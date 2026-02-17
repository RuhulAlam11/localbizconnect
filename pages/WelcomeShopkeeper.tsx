
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

const WelcomeShopkeeper: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden text-center p-12 md:p-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-0"></div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl mx-auto mb-10 shadow-2xl shadow-indigo-200 animate-bounce">
            <i className="fas fa-rocket"></i>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Welcome to the <br/><span className="text-indigo-600">Merchant Community!</span>
          </h1>
          
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
            Hello {user?.name}, you're one step away from bringing your neighborhood shop online. Reach hundreds of neighbors and manage orders with ease.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mb-4"><i className="fas fa-magic"></i></div>
              <h3 className="font-black text-slate-800 mb-2">Easy Setup</h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">Simple multi-step wizard to set up your store details.</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-4"><i className="fas fa-chart-pie"></i></div>
              <h3 className="font-black text-slate-800 mb-2">Live Analytics</h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">Track your daily sales, revenue, and neighbor feedback.</p>
            </div>
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm mb-4"><i className="fas fa-truck"></i></div>
              <h3 className="font-black text-slate-800 mb-2">Local Delivery</h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed">Manage your own delivery radius and fees flexibly.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => navigate('/create-shop')}
              className="px-12 py-6 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95 group flex items-center gap-4"
            >
              Start Building My Store <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-6 text-slate-400 font-black uppercase text-xs tracking-widest"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeShopkeeper;
