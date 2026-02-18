
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Notification, Shop, Product } from '../types';
import { storage } from '../services/storageService';
import { SHOP_CATEGORIES } from '../constants';
import AIAssistant from './AIAssistant';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userShop, setUserShop] = useState<Shop | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  // Filter states
  const [fName, setFName] = useState('');
  const [fLoc, setFLoc] = useState('');
  const [fType, setFType] = useState<string>('all');
  const [fDelivery, setFDelivery] = useState(false);
  const [fRating, setFRating] = useState(0);
  const [fPrice, setFPrice] = useState({ min: '', max: '' });
  const [fRadius, setFRadius] = useState('5');

  const filterRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setNotifications(storage.getNotifications().filter(n => n.user_id === user.id).reverse());
      if (user.role === 'shopkeeper') {
        const shops = storage.getShops();
        setUserShop(shops.find(s => s.owner_id === user.id) || null);
      }
    } else {
      setUserShop(null);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilterMenu(false);
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (fName) params.set('name', fName);
    if (fLoc) params.set('loc', fLoc);
    if (fType !== 'all') params.set('type', fType);
    if (fDelivery) params.set('delivery', 'true');
    if (fRating > 0) params.set('rating', fRating.toString());
    if (fPrice.min) params.set('minP', fPrice.min);
    if (fPrice.max) params.set('maxP', fPrice.max);
    params.set('dist', fRadius);
    
    navigate(`/?${params.toString()}`);
    setShowFilterMenu(false);
  };

  const markAsRead = () => {
    if (!user) return;
    const all = storage.getNotifications();
    const updated = all.map(n => n.user_id === user.id ? { ...n, read: true } : n);
    storage.setNotifications(updated);
    setNotifications(updated.filter(n => n.user_id === user.id).reverse());
  };

  return (
    <div className="min-h-screen flex flex-col no-scrollbar">
      {/* Static Navbar */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[100] py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col gap-4">
          <div className="flex justify-between items-center gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-store text-lg"></i>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-slate-900 leading-none">LocalBiz</h1>
                <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mt-0.5">Connect</p>
              </div>
            </Link>

            {/* Search Bar & YouTube-style Filter Button */}
            <div className="flex-grow max-w-xl relative" ref={filterRef}>
              <form onSubmit={handleSearch} className="relative flex items-center">
                <i className="fas fa-search absolute left-5 text-slate-300"></i>
                <input
                  type="text"
                  placeholder="Search shops, products, services..."
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  title={showFilterMenu ? 'Close filters' : 'Open advanced filters'}
                  aria-label={showFilterMenu ? 'Close filters' : 'Open advanced filters'}
                  className={`absolute right-4 p-2 transition-colors ${showFilterMenu ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
                >
                  <i className="fas fa-sliders-h"></i>
                </button>
              </form>

              {showFilterMenu && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[110] p-6 animate-in slide-in-from-top-2">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Advanced Filter</h4>
                   <div className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="By Name..." 
                        title="Filter shops by name"
                        aria-label="Filter shops by name"
                        className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-xs font-bold" 
                        value={fName} 
                        onChange={(e) => setFName(e.target.value)} 
                      />
                      <input 
                        type="text" 
                        placeholder="By Address/Pincode..." 
                        title="Filter by address or pincode"
                        aria-label="Filter by address or pincode"
                        className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-xs font-bold" 
                        value={fLoc} 
                        onChange={(e) => setFLoc(e.target.value)} 
                      />
                      <select 
                        title="Filter by shop type"
                        aria-label="Filter by shop type"
                        className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-xs font-bold appearance-none" 
                        value={fType} 
                        onChange={(e) => setFType(e.target.value)}
                      >
                        <option value="all">Any Shop Type</option>
                        <option value="product">Product Based</option>
                        <option value="service">Service Based</option>
                        <option value="both">Both</option>
                      </select>
                      <div className="flex items-center justify-between p-2">
                        <label htmlFor="delivery-check" className="text-xs font-bold text-slate-500">Delivery Available</label>
                        <input 
                          id="delivery-check"
                          type="checkbox" 
                          title="Filter by delivery availability"
                          aria-label="Filter by delivery availability"
                          checked={fDelivery} 
                          onChange={(e) => setFDelivery(e.target.checked)} 
                          className="accent-indigo-600" 
                        />
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Min ₹" 
                          title="Minimum price filter"
                          aria-label="Minimum price"
                          className="w-1/2 bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" 
                          value={fPrice.min} 
                          onChange={(e) => setFPrice({...fPrice, min: e.target.value})} 
                        />
                        <input 
                          type="number" 
                          placeholder="Max ₹" 
                          title="Maximum price filter"
                          aria-label="Maximum price"
                          className="w-1/2 bg-slate-50 border-none rounded-xl p-3 text-xs font-bold" 
                          value={fPrice.max} 
                          onChange={(e) => setFPrice({...fPrice, max: e.target.value})} 
                        />
                      </div>
                      <div className="flex items-center justify-between px-2">
                         <label htmlFor="radius-slider" className="text-[10px] font-black uppercase text-slate-400">Radius: {fRadius}km</label>
                         <input 
                          id="radius-slider"
                          type="range" 
                          min="1" 
                          max="10" 
                          title="Select search radius in kilometers"
                          aria-label="Select search radius in kilometers"
                          value={fRadius} 
                          onChange={(e) => setFRadius(e.target.value)} 
                          className="w-1/2 accent-indigo-600" 
                         />
                      </div>
                      <button onClick={() => handleSearch()} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Apply Filters</button>
                   </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <div className="relative" ref={notifRef}>
                   <button onClick={() => { setIsNotifOpen(!isNotifOpen); markAsRead(); }} className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center relative hover:bg-white hover:text-indigo-600 transition-all">
                      <i className="fas fa-bell"></i>
                      {notifications.filter(n => !n.read).length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-[8px] font-black flex items-center justify-center border-2 border-white">{notifications.filter(n => !n.read).length}</span>}
                   </button>
                   {isNotifOpen && (
                     <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[110] animate-in slide-in-from-top-2">
                        <div className="p-5 border-b border-slate-50 font-black text-[10px] uppercase text-slate-400 tracking-widest flex justify-between items-center">
                          <span>Neighborhood Activity</span>
                          {notifications.length > 0 && <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg">{notifications.length}</span>}
                        </div>
                        <div className="max-h-80 overflow-y-auto no-scrollbar">
                           {notifications.length > 0 ? notifications.map(n => (
                             <div key={n.id} className={`p-5 border-b last:border-0 border-slate-50 hover:bg-slate-50 transition-colors relative group ${!n.read ? 'bg-indigo-50/20' : ''}`}>
                                {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{n.title}</p>
                                  {!n.read && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
                                </div>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed mb-2">{n.message}</p>
                                <span className="text-[8px] font-black text-slate-300 uppercase">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                           )) : (
                             <div className="p-16 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 text-xl"><i className="fas fa-bell-slash"></i></div>
                                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">Neighborhood is quiet</p>
                             </div>
                           )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="p-4 bg-slate-50/50 text-center">
                            <button onClick={() => { setIsNotifOpen(false); navigate('/orders'); }} className="text-[9px] font-black uppercase text-indigo-500 tracking-widest hover:underline">View All Records</button>
                          </div>
                        )}
                     </div>
                   )}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {!user ? (
                  <>
                    <Link to="/login" className="px-5 py-2.5 text-sm font-black text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">Login</Link>
                    <Link to="/register" className="px-5 py-2.5 text-sm font-black text-white bg-indigo-600 rounded-xl shadow-lg hover:bg-indigo-700 transition-all">Register</Link>
                  </>
                ) : (
                  <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 p-1 pl-2 pr-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-all">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">{user.name[0].toUpperCase()}</div>
                      <span className="text-xs font-bold text-slate-700 hidden md:block">{user.name}</span>
                      <i className="fas fa-chevron-down text-[10px] text-slate-400"></i>
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[110] animate-in slide-in-from-top-2">
                         <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                           <p className="text-xs font-black text-slate-900 leading-none mb-1">{user.name}</p>
                           <p className="text-[9px] font-black uppercase text-indigo-500 tracking-widest">{user.role}</p>
                         </div>
                         <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50">
                            <i className="fas fa-user-circle mr-3 text-slate-400"></i> My Profile
                         </Link>
                         {user.role === 'shopkeeper' && (
                           !userShop ? (
                             <Link to="/create-shop" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50">
                               <i className="fas fa-plus-circle mr-3 text-indigo-600"></i> Create Your Shop
                             </Link>
                           ) : (
                             <Link to="/shop-dashboard" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50">
                               <i className="fas fa-store-alt mr-3 text-indigo-600"></i> Manage My Shop
                             </Link>
                           )
                         )}
                         <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50">
                            <i className="fas fa-shopping-bag mr-3 text-slate-400"></i> My Orders
                         </Link>
                         <Link to="/favorites" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50">
                            <i className="fas fa-heart mr-3 text-rose-400"></i> Favorites
                         </Link>
                         {user.role === 'admin' && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50">
                            <i className="fas fa-shield-halved mr-3 text-rose-500"></i> Admin Panel
                         </Link>}
                         <button onClick={() => { onLogout(); setIsMenuOpen(false); navigate('/login'); }} className="w-full text-left px-6 py-4 text-sm font-bold text-rose-500 hover:bg-rose-50">
                            <i className="fas fa-sign-out-alt mr-3"></i> Logout
                         </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-3 no-scrollbar pb-1 items-center">
             <button onClick={() => navigate('/?cat=All')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${new URLSearchParams(location.search).get('cat') === 'All' || !new URLSearchParams(location.search).get('cat') ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:text-indigo-600'}`}>All</button>
             {SHOP_CATEGORIES.map(c => (
               <button key={c} onClick={() => navigate(`/?cat=${c}`)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${new URLSearchParams(location.search).get('cat') === c ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:text-indigo-600'}`}>{c}</button>
             ))}
          </div>
        </div>
      </nav>

      {/* Back Button Below Categories */}
      <div className="bg-white/50 border-b border-slate-100 py-3 mb-6 sticky top-[125px] z-50 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="group flex items-center gap-3 px-5 py-2 bg-white rounded-full shadow-sm border border-slate-100 hover:bg-slate-900 hover:text-white transition-all active:scale-95">
               <i className="fas fa-arrow-left text-xs group-hover:-translate-x-1 transition-transform"></i>
               <span className="text-[10px] font-black uppercase tracking-widest">Previous Page</span>
            </button>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
               <span>Hyperlocal Hub</span>
               <i className="fas fa-circle text-[4px] opacity-30"></i>
               <span className="text-slate-500">{location.pathname === '/' ? 'Home' : location.pathname.slice(1).replace('-', ' ')}</span>
            </div>
         </div>
      </div>

      <main className="flex-grow no-scrollbar">{children}</main>
      
      <footer className="bg-white border-t border-slate-200 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><i className="fas fa-store text-xs"></i></div>
              <h2 className="font-black text-slate-900 tracking-tighter">LocalBiz</h2>
            </Link>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">&copy; {new Date().getFullYear()} Community Commerce Platform.</p>
          </div>
          <div className="flex justify-center md:justify-end gap-10">
            <Link to="/terms" className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-indigo-600 transition-colors">Terms of Service</Link>
            <Link to="/terms" className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-indigo-600 transition-colors">Privacy Policy</Link>
            <a href="#" className="text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-indigo-600 transition-colors">Help Center</a>
          </div>
        </div>
      </footer>
      
      {/* AI Assistant Floating Button */}
      <AIAssistant />
    </div>
  );
};

export default Layout;
