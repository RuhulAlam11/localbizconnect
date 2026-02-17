
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storageService';
import { Shop, User, Order } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'shops' | 'users'>('shops');

  useEffect(() => {
    const admin = storage.getCurrentUser();
    if (!admin || admin.role !== 'admin') { navigate('/login'); return; }
    setShops(storage.getShops());
    setUsers(storage.getUsers());
    setOrders(storage.getOrders());
  }, [navigate]);

  const toggleFeatured = (id: string) => {
    const updated = shops.map(s => s.id === id ? { ...s, isFeatured: !s.isFeatured } : s);
    storage.setShops(updated);
    setShops(updated);
  };

  const approveShop = (id: string) => {
    const updated = shops.map(s => s.id === id ? { ...s, status: 'approved' as const } : s);
    storage.setShops(updated);
    setShops(updated);
  };

  const stats = [
    { label: 'Total Shops', value: shops.length, icon: 'fa-store', color: 'bg-indigo-500' },
    { label: 'Total Users', value: users.length, icon: 'fa-users', color: 'bg-emerald-500' },
    { label: 'Total Orders', value: orders.length, icon: 'fa-shopping-bag', color: 'bg-amber-500' },
    { label: 'Platform Revenue', value: `₹${orders.reduce((s, o) => s + o.total_amount, 0)}`, icon: 'fa-indian-rupee-sign', color: 'bg-rose-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 leading-none">Command Center</h1>
          <p className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.3em] mt-3">Platform Overview & Management</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
          <button 
            onClick={() => setActiveTab('shops')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'shops' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Manage Shops
          </button>
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            Registered Users
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl ${stat.color} shadow-lg shadow-inherit/20`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-800 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4">
        {activeTab === 'shops' ? (
          <>
            <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Neighborhood Shops</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase">Verification Queue</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Details</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {shops.map(shop => (
                    <tr key={shop.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={shop.imageUrl} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                          <div>
                            <p className="font-black text-slate-800 leading-none mb-1">{shop.name}</p>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Owner: {shop.owner_name}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1">ID: {shop.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{shop.address}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase mt-1">{shop.city}, {shop.pincode}</p>
                      </td>
                      <td className="px-6 py-6"><span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase tracking-widest">{shop.category}</span></td>
                      <td className="px-6 py-6">
                         <button 
                           onClick={() => toggleFeatured(shop.id)}
                           className={`w-12 h-6 rounded-full relative transition-colors ${shop.isFeatured ? 'bg-amber-500' : 'bg-slate-200'}`}
                         >
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${shop.isFeatured ? 'left-7' : 'left-1'}`}></div>
                         </button>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          shop.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          shop.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {shop.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          {shop.status === 'pending' && (
                            <button onClick={() => approveShop(shop.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 active:scale-95 transition-all">Approve</button>
                          )}
                          <button onClick={() => navigate(`/shop/${shop.id}`)} className="text-slate-400 hover:text-indigo-600 p-2"><i className="fas fa-eye"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {shops.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No shops have applied yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Registered Neighbors</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase">User Database</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Account ID</th>
                    <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black text-xs">
                            {u.name[0].toUpperCase()}
                          </div>
                          <span className="font-black text-slate-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-sm font-medium text-slate-500">{u.email}</td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                          u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                          u.role === 'shopkeeper' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-xs font-bold text-slate-300 font-mono tracking-tighter">{u.id}</td>
                      <td className="px-10 py-6 text-right">
                         <button onClick={() => alert(`Details for ${u.name} (Simulation Only)`)} className="text-slate-300 hover:text-slate-900 transition-colors"><i className="fas fa-ellipsis-v"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
