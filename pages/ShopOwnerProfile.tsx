
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../services/storageService';
import { User, Shop } from '../types';

const ShopOwnerProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    if (currentUser.role === 'shopkeeper') {
      const myShop = storage.getShops().find(s => s.owner_id === currentUser.id);
      setShop(myShop || null);
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden p-12 md:p-20 relative">
        <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-100">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-grow">
            <h1 className="text-4xl font-black text-slate-900 leading-none mb-4">{user.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="px-5 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest">{user.email}</span>
              <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                user.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                user.role === 'shopkeeper' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {user.role} Account
              </span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100">
            <h3 className="text-[10px] font-black uppercase text-indigo-500 mb-4 tracking-widest">Account Information</h3>
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-600 flex justify-between"><span>User ID:</span> <span className="text-slate-900 font-mono">#{user.id}</span></p>
              <p className="text-sm font-bold text-slate-600 flex justify-between"><span>Status:</span> <span className="text-emerald-500 font-black uppercase text-[10px]">Verified</span></p>
            </div>
          </div>

          {user.role === 'shopkeeper' && (
            <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-100">
              <h3 className="text-[10px] font-black uppercase text-white/60 mb-6 tracking-widest">Business Control</h3>
              {shop ? (
                <div>
                  <p className="text-xl font-black mb-6">{shop.name}</p>
                  <Link to="/shop-dashboard" className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Go to Dashboard</Link>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold mb-6 opacity-80">You haven't registered your shop yet.</p>
                  <Link to="/create-shop" className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Setup Shop Now</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerProfile;
