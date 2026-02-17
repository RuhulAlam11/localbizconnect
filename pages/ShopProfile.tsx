
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../services/storageService';
import { Shop, Product, Review, User, Order } from '../types';
import { useCart } from '../components/CartContext';

const ShopProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'reviews'>('products');
  
  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const [requirementText, setRequirementText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundShop = storage.getShops().find(s => s.id === id);
    if (!foundShop) { navigate('/'); return; }
    setShop(foundShop);
    setProducts(storage.getProducts().filter(p => p.shop_id === id));
    setReviews(storage.getReviews().filter(r => r.shop_id === id).reverse());
  }, [id, navigate]);

  const handleCustomList = () => {
    if (!currentUser) { navigate('/login'); return; }
    if (!requirementText.trim()) return;

    setIsSubmitting(true);
    const newOrder: Order = {
      id: `ord-custom-${Math.random().toString(36).substr(2, 5)}`,
      customer_id: currentUser.id,
      customer_name: currentUser.name,
      shop_id: shop!.id,
      shop_name: shop!.name,
      total_amount: 0,
      status: 'pending',
      type: 'custom_list',
      custom_list_text: requirementText,
      created_at: new Date().toISOString(),
      items: []
    };

    const orders = storage.getOrders();
    storage.setOrders([...orders, newOrder]);
    
    // Notify shopkeeper
    const notifs = storage.getNotifications();
    storage.setNotifications([...notifs, {
      id: Math.random().toString(36).substr(2, 5),
      user_id: shop!.owner_id,
      title: 'New Requirement List',
      message: `${currentUser.name} sent a custom list. Check and send a quote!`,
      read: false,
      created_at: new Date().toISOString()
    }]);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowRequirementForm(false);
      setRequirementText('');
      alert("Requirement list sent! Wait for the merchant to send a price quote.");
      navigate('/orders');
    }, 1500);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 'New';

  if (!shop) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner */}
      <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100 mb-12 relative h-[30rem]">
        <img src={shop.imageUrl} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
        <div className="absolute bottom-0 inset-x-0 p-12 flex flex-col md:flex-row items-end justify-between gap-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="w-32 h-32 bg-white rounded-[2.5rem] p-1 shadow-2xl"><img src={shop.logoUrl} className="w-full h-full object-cover rounded-[2rem]" /></div>
            <div className="text-center md:text-left text-white">
              <h1 className="text-5xl md:text-7xl font-black mb-2 tracking-tighter leading-none">{shop.name}</h1>
              <p className="text-sm font-bold opacity-70 flex items-center gap-2 justify-center md:justify-start"><i className="fas fa-location-arrow"></i> {shop.address}</p>
            </div>
          </div>
          <div className="flex gap-4">
             <button onClick={() => setShowRequirementForm(true)} className="px-10 py-5 bg-white text-slate-900 font-black rounded-3xl shadow-xl hover:bg-indigo-600 hover:text-white transition-all">Request Custom Quote</button>
             <button onClick={() => navigate(`/chat/${shop.owner_id}`)} className="w-16 h-16 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center text-white border border-white/20 hover:bg-white/30 transition-all text-xl"><i className="fas fa-comment-alt"></i></button>
          </div>
        </div>
      </div>

      {/* Requirement Modal */}
      {showRequirementForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-xl p-12 shadow-2xl animate-in zoom-in-95">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Neighborhood List</h2>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-10">Describe what you need (e.g. 2kg Aashirvaad Atta, 1L Milk)</p>
              <textarea 
                className="w-full bg-slate-50 border-none rounded-[2rem] p-8 text-sm font-medium h-48 focus:ring-4 focus:ring-indigo-100 transition-all mb-8 outline-none"
                placeholder="Write your requirement list here..."
                value={requirementText}
                onChange={(e) => setRequirementText(e.target.value)}
              />
              <div className="flex gap-4">
                 <button onClick={() => setShowRequirementForm(false)} className="flex-grow py-5 text-slate-400 font-black text-[10px] uppercase">Cancel</button>
                 <button onClick={handleCustomList} disabled={isSubmitting} className="flex-grow py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                   {isSubmitting ? 'Sending Request...' : 'Submit to Shop'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-16">
        <div className="bg-white p-2 rounded-[2.5rem] flex gap-2 shadow-sm border border-slate-100">
           {(['products', 'services', 'reviews'] as const).map(t => (
             <button key={t} onClick={() => setActiveTab(t)} className={`px-12 py-4 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === t ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
               {t} {t === 'reviews' && `(${reviews.length})`}
             </button>
           ))}
        </div>
      </div>

      {/* Content Rendering */}
      <div className="animate-in fade-in duration-700">
        {activeTab === 'reviews' ? (
           <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex items-center justify-between mb-12">
                 <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Average Rating</p>
                    <h3 className="text-6xl font-black text-slate-900">{avgRating}</h3>
                 </div>
                 <div className="flex gap-2">
                    {[1,2,3,4,5].map(s => <i key={s} className={`fas fa-star text-2xl ${s <= Math.round(Number(avgRating)) ? 'text-amber-400' : 'text-slate-100'}`}></i>)}
                 </div>
              </div>
              {reviews.length > 0 ? reviews.map(r => (
                <div key={r.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black">{r.customer_name[0]}</div>
                      <div>
                         <h4 className="font-black text-slate-800 text-sm">{r.customer_name}</h4>
                         <span className="text-[9px] font-black text-slate-300 uppercase">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="ml-auto flex gap-1">
                         {[1,2,3,4,5].map(s => <i key={s} className={`fas fa-star text-[9px] ${s <= r.rating ? 'text-amber-400' : 'text-slate-100'}`}></i>)}
                      </div>
                   </div>
                   <p className="text-slate-600 font-medium leading-relaxed italic">"{r.comment}"</p>
                </div>
              )) : (
                <div className="text-center py-20 bg-white rounded-[4rem] border border-slate-100">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No neighborhood feedback yet</p>
                </div>
              )}
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.filter(p => activeTab === 'services' ? p.isService : !p.isService).map(item => (
                <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                   <div className="h-48 rounded-[1.8rem] overflow-hidden mb-6 relative">
                      <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/95 rounded-xl font-black text-xs shadow-sm">₹{item.price}</div>
                   </div>
                   <h3 className="font-black text-slate-800 mb-1 truncate">{item.name}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Stock: {item.stock}</p>
                   <button onClick={() => addToCart(item)} className="w-full py-4 bg-slate-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Add to Basket</button>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

export default ShopProfile;
