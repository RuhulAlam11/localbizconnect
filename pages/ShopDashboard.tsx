
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../services/storageService';
import { Shop, Product, Order, User, Notification } from '../types';
// Import SHOP_CATEGORIES from constants to fix the "Cannot find name 'SHOP_CATEGORIES'" error
import { SHOP_CATEGORIES } from '../constants';

const ShopDashboard: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'orders' | 'inventory' | 'services' | 'analytics' | 'settings' | 'ads'>('orders');

  // Profile Edit States
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopCategory, setShopCategory] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'shopkeeper') { navigate('/login'); return; }
    const myShop = storage.getShops().find(s => s.owner_id === user.id);
    if (!myShop) { navigate('/create-shop'); return; }
    setShop(myShop);
    setShopName(myShop.name);
    setShopPhone(myShop.phone);
    setShopCategory(myShop.category);
    refreshData(myShop.id);
  }, [user, navigate]);

  const refreshData = (shopId: string) => {
    const allItems = storage.getProducts().filter(p => p.shop_id === shopId);
    setProducts(allItems.filter(p => !p.isService));
    setServices(allItems.filter(p => p.isService));
    setOrders(storage.getOrders().filter(o => o.shop_id === shopId).reverse());
  };

  const deleteItem = (id: string) => {
    if (!confirm("Delete this item from your neighborhood catalog?")) return;
    const updated = storage.getProducts().filter(p => p.id !== id);
    storage.setProducts(updated);
    if (shop) refreshData(shop.id);
  };

  const updateOrderStatus = (orderId: string, newStatus: any) => {
    const all = storage.getOrders();
    const updated = all.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    storage.setOrders(updated);
    if (shop) refreshData(shop.id);
  };

  const saveProfileSettings = () => {
    if (!shop) return;
    const allShops = storage.getShops();
    const updated = allShops.map(s => s.id === shop.id ? { ...s, name: shopName, phone: shopPhone, category: shopCategory } : s);
    storage.setShops(updated);
    setShop({ ...shop, name: shopName, phone: shopPhone, category: shopCategory });
    alert("Shop Profile Updated Locally!");
  };

  const handleSendQuote = (orderId: string) => {
    const amount = prompt("Enter total quote amount for this neighborhood list (₹):");
    if (!amount || isNaN(Number(amount))) return;
    const all = storage.getOrders();
    const updated = all.map(o => o.id === orderId ? { 
      ...o, 
      status: 'quoted' as const, 
      quote_amount: Number(amount), 
      total_amount: Number(amount), 
      isQuoted: true 
    } : o);
    storage.setOrders(updated);
    
    const order = updated.find(o => o.id === orderId);
    if (order) {
      storage.setNotifications([...storage.getNotifications(), {
        id: Math.random().toString(36).substr(2, 9),
        user_id: order.customer_id,
        title: 'Quote Received!',
        message: `${shop?.name} sent a quote of ₹${amount} for your list. Review and pay to confirm!`,
        read: false,
        created_at: new Date().toISOString()
      }]);
    }

    if (shop) refreshData(shop.id);
  };

  const outOfStockItems = products.filter(p => p.stock === 0);
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-center justify-between mb-16 gap-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-none">{shop?.name} Command</h1>
          <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.3em] mt-3">Control Panel • Neighborhood Growth</p>
        </div>
        <div className="flex flex-wrap p-2 bg-slate-100 rounded-[2.5rem] shadow-inner gap-1">
          {(['orders', 'inventory', 'services', 'analytics', 'settings', 'ads'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {outOfStockItems.length > 0 && tab === 'inventory' && (
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[3rem] mb-12 flex items-center justify-between animate-in slide-in-from-top-4 shadow-sm">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-rose-500 text-white rounded-[1.8rem] flex items-center justify-center animate-pulse text-2xl shadow-lg shadow-rose-100"><i className="fas fa-exclamation-triangle"></i></div>
              <div>
                 <h4 className="text-rose-900 font-black uppercase text-[12px] tracking-widest mb-1">Stock Alert!</h4>
                 <p className="text-rose-600 text-sm font-bold">{outOfStockItems.length} products are currently out of stock.</p>
              </div>
           </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="animate-in fade-in duration-700">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Net Sales</p>
                 <h3 className="text-5xl font-black text-slate-900">₹{totalEarnings.toLocaleString()}</h3>
              </div>
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Order Velocity</p>
                 <h3 className="text-5xl font-black text-slate-900">{orders.length}</h3>
              </div>
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Avg Rating</p>
                 <h3 className="text-5xl font-black text-amber-500">{shop?.rating || '4.8'}</h3>
              </div>
           </div>
           
           <div className="bg-slate-900 rounded-[4rem] p-16 text-white relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
              <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-12">Neighborhood Reach</h4>
              <div className="flex items-end gap-6 h-64 border-b border-white/5 pb-6">
                 {[40, 70, 45, 100, 60, 110, 80, 95, 65, 90].map((h, i) => (
                    <div key={i} className="flex-grow bg-indigo-600 rounded-t-2xl transition-all hover:bg-white hover:scale-x-110" style={{ height: `${h}%` }}></div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {(tab === 'inventory' || tab === 'services') && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4">
           <div className="flex justify-between items-center px-4">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Manage {tab === 'inventory' ? 'Products' : 'Services'}</h2>
              <Link to="/add-product" className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                Add New {tab === 'inventory' ? 'Product' : 'Service'}
              </Link>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(tab === 'inventory' ? products : services).map(item => (
                <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex items-center gap-6 shadow-sm group hover:shadow-xl transition-all">
                   <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0">
                      <img src={item.imageUrl} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-grow min-w-0">
                      <h4 className="font-black text-slate-800 truncate">{item.name}</h4>
                      <p className="text-xs font-bold text-slate-400 mt-1">₹{item.price} {tab === 'inventory' && `• Stock: ${item.stock}`}</p>
                      <div className="flex gap-3 mt-4">
                         <button onClick={() => navigate(`/edit-product/${item.id}`)} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">Edit</button>
                         <button onClick={() => deleteItem(item.id)} className="text-rose-500 font-black text-[10px] uppercase tracking-widest hover:underline">Remove</button>
                      </div>
                   </div>
                </div>
              ))}
              {(tab === 'inventory' ? products : services).length === 0 && (
                 <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[4rem] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Empty Catalog</p>
                 </div>
              )}
           </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4">
           {orders.length > 0 ? orders.map(o => (
              <div key={o.id} className="bg-white p-12 rounded-[4rem] border border-slate-100 flex flex-wrap items-start justify-between gap-10 shadow-sm hover:shadow-xl transition-all">
                 <div className="max-w-md">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.3em]">Neighborhood Order #{o.id.substr(-6)}</p>
                    <h3 className="text-2xl font-black text-slate-900 mb-6">{o.customer_name}</h3>
                    {o.type === 'custom_list' ? (
                       <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 text-sm font-bold italic text-slate-600 leading-relaxed shadow-inner">
                          " {o.custom_list_text} "
                       </div>
                    ) : (
                       <div className="flex flex-wrap gap-3">
                          {o.items.map(i => <span key={i.id} className="px-5 py-2.5 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest border border-slate-100">{i.quantity}x {i.product_name}</span>)}
                       </div>
                    )}
                 </div>
                 <div className="flex flex-col items-end gap-6 shrink-0">
                    <div className="flex flex-col gap-4">
                       <select 
                         value={o.status} 
                         onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                         className="bg-slate-900 text-white border-none rounded-[1.5rem] px-8 py-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-2xl active:scale-95 transition-all"
                       >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                       </select>
                       <p className="text-5xl font-black text-right text-slate-900">₹{o.total_amount || 'Quote TBD'}</p>
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => navigate(`/chat/${o.customer_id}`)} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
                          Chat with Customer
                       </button>
                       {o.type === 'custom_list' && o.status === 'pending' && (
                          <button onClick={() => handleSendQuote(o.id)} className="px-10 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-100 active:scale-95 transition-all">Send Price Quote</button>
                       )}
                    </div>
                 </div>
              </div>
           )) : (
              <div className="text-center py-40 bg-white rounded-[4rem] border border-slate-100">
                 <i className="fas fa-couch text-7xl text-slate-100 mb-8"></i>
                 <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.4em]">No neighbor orders at the moment</p>
              </div>
           )}
        </div>
      )}

      {tab === 'settings' && (
         <div className="max-w-2xl bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-sm animate-in fade-in">
            <h2 className="text-3xl font-black text-slate-900 mb-10 leading-none">Shop Profile Settings</h2>
            <div className="space-y-8">
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Shop Name</label>
                  <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold focus:ring-4 focus:ring-indigo-100" />
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Neighborhood Phone</label>
                  <input type="text" value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold focus:ring-4 focus:ring-indigo-100" />
               </div>
               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Market Category</label>
                  <select value={shopCategory} onChange={(e) => setShopCategory(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold focus:ring-4 focus:ring-indigo-100 appearance-none">
                     {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
               </div>
               <div className="pt-6">
                  <button onClick={saveProfileSettings} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Update Shop Profile</button>
               </div>
            </div>
         </div>
      )}

      {tab === 'ads' && (
         <div className="animate-in fade-in duration-700">
            <div className="bg-indigo-600 text-white p-16 rounded-[4rem] text-center shadow-2xl shadow-indigo-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
               <h2 className="text-5xl font-black mb-6 tracking-tighter leading-none">Reach More Neighbors</h2>
               <p className="max-w-xl mx-auto text-indigo-100 font-medium mb-12 text-lg">Boost your shop to the top of results for just ₹49/day. Start getting seen by every local browser.</p>
               <button onClick={() => alert("Boosting is enabled! (MVP Simulation)")} className="px-12 py-6 bg-white text-indigo-600 font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest">Start Ad Campaign</button>
            </div>
         </div>
      )}
    </div>
  );
};

export default ShopDashboard;
