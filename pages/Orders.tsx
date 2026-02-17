
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../services/storageService';
import { Order, User, Review, Notification, Shop } from '../types';

interface OrdersProps {
  user: User | null;
}

const Orders: React.FC<OrdersProps> = ({ user }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'history' | 'favorites'>('history');
  const [orders, setOrders] = useState<Order[]>([]);
  const [favShops, setFavShops] = useState<Shop[]>([]);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [starRating, setStarRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const allOrders = storage.getOrders();
    setOrders(allOrders.filter(o => o.customer_id === user.id).reverse());
    const favIds = storage.getFavorites();
    const allShops = storage.getShops();
    setFavShops(allShops.filter(s => favIds.includes(s.id)));
  }, [user, navigate]);

  const submitReview = () => {
    if (!ratingOrder || !user || !reviewComment.trim()) { alert("Please write a comment!"); return; }
    const newReview: Review = {
      id: 'rev-' + Math.random().toString(36).substr(2, 9),
      shop_id: ratingOrder.shop_id,
      customer_id: user.id,
      customer_name: user.name,
      rating: starRating,
      comment: reviewComment,
      created_at: new Date().toISOString()
    };
    storage.setReviews([...storage.getReviews(), newReview]);
    const updatedOrders = storage.getOrders().map(o => o.id === ratingOrder.id ? { ...o, isRated: true } : o);
    storage.setOrders(updatedOrders);
    setOrders(updatedOrders.filter(o => o.customer_id === user.id).reverse());
    setRatingOrder(null);
    setReviewComment('');
    alert("Review posted! Thanks neighbor.");
  };

  const handlePayForQuote = (orderId: string) => {
    const allOrders = storage.getOrders();
    const updated = allOrders.map(o => o.id === orderId ? { ...o, status: 'accepted' as const, payment_method: 'online' as const } : o);
    storage.setOrders(updated);
    setOrders(updated.filter(o => o.customer_id === user?.id).reverse());
    alert("Payment verified! Neighborhood shop has been notified to start your order.");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
        <div>
           <h1 className="text-5xl font-black text-slate-900 leading-none">Local Activity</h1>
           <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.4em] mt-3">Tracking Neighborhood Commerce</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-[2rem] shadow-inner gap-2">
          <button onClick={() => setTab('history')} className={`px-10 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'history' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Order History</button>
          <button onClick={() => setTab('favorites')} className={`px-10 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'favorites' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400'}`}>My Favorites</button>
        </div>
      </div>

      {tab === 'history' && (
        <div className="space-y-10 animate-in fade-in">
          {orders.length > 0 ? orders.map(order => (
            <div key={order.id} className="bg-white rounded-[4rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all">
              <div className="p-10 border-b border-slate-50 flex flex-wrap justify-between items-center gap-8">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-[0.3em]">{order.shop_name}</p>
                  <p className="font-black text-slate-900 text-2xl tracking-tight">Order #{order.id.substr(-8)}</p>
                  <p className="text-[10px] font-bold text-slate-300 uppercase mt-2 tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 
                    order.status === 'quoted' ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-3xl font-black text-slate-900 ml-6">₹{order.total_amount || 'Pending'}</p>
                </div>
              </div>

              <div className="p-10 bg-slate-50/50 flex flex-wrap justify-between items-center gap-8">
                 <div className="flex gap-4">
                    <button onClick={() => navigate(`/chat/${order.shop_id}`)} className="px-8 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all flex items-center gap-3 shadow-sm active:scale-95">
                       <i className="fas fa-comment-dots"></i> Order Discussion
                    </button>
                    {order.status === 'delivered' && !order.isRated && (
                       <button 
                         onClick={() => setRatingOrder(order)}
                         className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
                       >
                          Write a Review
                       </button>
                    )}
                 </div>

                 {order.status === 'quoted' && (
                    <div className="flex items-center gap-6 animate-in zoom-in-95">
                       <p className="text-sm font-bold text-slate-400">Merchant Quote: <span className="text-slate-900 font-black">₹{order.quote_amount}</span></p>
                       <button 
                          onClick={() => handlePayForQuote(order.id)}
                          className="px-12 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-100 active:scale-95 transition-all"
                       >
                          Accept & Pay Online
                       </button>
                    </div>
                 )}
              </div>
            </div>
          )) : (
            <div className="text-center py-40 bg-white rounded-[4rem] border border-slate-100">
               <i className="fas fa-box-open text-8xl text-slate-100 mb-10"></i>
               <h3 className="text-2xl font-black text-slate-300 mb-4 uppercase tracking-[0.4em]">Cart is currently quiet</h3>
               <Link to="/" className="text-indigo-600 font-black uppercase text-[10px] tracking-widest hover:underline">Start neighbor discovery</Link>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {ratingOrder && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-[4rem] w-full max-w-xl p-16 shadow-2xl animate-in zoom-in-95">
              <div className="text-center mb-12">
                 <h2 className="text-4xl font-black text-slate-900 leading-none mb-4">Support {ratingOrder.shop_name}</h2>
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Honest neighborhood feedback helps everyone.</p>
              </div>

              <div className="flex justify-center gap-4 mb-12">
                 {[1, 2, 3, 4, 5].map(star => (
                   <button 
                     key={star} 
                     onClick={() => setStarRating(star)}
                     className={`text-4xl transition-all hover:scale-125 ${star <= starRating ? 'text-amber-400' : 'text-slate-100'}`}
                   >
                      <i className="fas fa-star"></i>
                   </button>
                 ))}
              </div>

              <textarea 
                className="w-full bg-slate-50 border-none rounded-[2.5rem] p-8 text-sm font-bold focus:ring-8 focus:ring-indigo-100 outline-none transition-all h-40 mb-10 placeholder:text-slate-300"
                placeholder="Share your experience with the neighborhood..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />

              <div className="flex gap-4">
                 <button onClick={() => setRatingOrder(null)} className="flex-grow py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest">Later</button>
                 <button onClick={submitReview} className="flex-grow py-5 bg-slate-900 text-white font-black rounded-[2rem] text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Submit Feedback</button>
              </div>
           </div>
        </div>
      )}

      {/* Favorites tab content... */}
    </div>
  );
};

export default Orders;
