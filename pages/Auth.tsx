
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { storage } from '../services/storageService';
import { UserRole, User } from '../types';

interface AuthProps {
  type: 'login' | 'register';
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ type, onAuthSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = storage.getUsers();

    if (type === 'login') {
      const user = users.find(u => u.email === email);
      if (user) {
        onAuthSuccess(user);
        const shops = storage.getShops();
        const userShop = shops.find(s => s.owner_id === user.id);

        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'shopkeeper') {
          if (!userShop) navigate('/welcome-shopkeeper');
          else navigate('/shop-dashboard');
        }
        else navigate('/');
      } else {
        setError('Invalid credentials');
      }
    } else {
      if (users.some(u => u.email === email)) {
        setError('User already exists');
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role
      };
      storage.setUsers([...users, newUser]);
      onAuthSuccess(newUser);
      
      if (role === 'shopkeeper') {
        // Essential: Redirect to Onboarding Welcome page
        navigate('/welcome-shopkeeper');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-slate-900 leading-none mb-3">
              {type === 'login' ? 'Welcome Back' : 'Join LocalBiz'}
            </h2>
            <p className="text-slate-500 font-medium">
              {type === 'login' ? 'Connect with your neighborhood' : 'Empower your local community'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-black border border-rose-100 uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            {type === 'register' && (
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@email.com"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Secret Key</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {type === 'register' && (
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Identify As</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
                      role === 'customer' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 text-slate-400 border-slate-50'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('shopkeeper')}
                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${
                      role === 'shopkeeper' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 text-slate-400 border-slate-50'
                    }`}
                  >
                    Shopkeeper
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-2xl shadow-slate-100 mt-4 uppercase tracking-[0.2em] text-xs"
            >
              {type === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            {type === 'login' ? (
              <p>New here? <Link to="/register" className="text-indigo-600 hover:underline">Register Today</Link></p>
            ) : (
              <p>Existing Neighbor? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
