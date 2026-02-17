
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storageService';
import { User, Product } from '../types';

const AddProduct: React.FC<{ user: User | null }> = ({ user }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isService, setIsService] = useState(false);
  const [stock, setStock] = useState('10');
  const [image, setImage] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'shopkeeper') {
      navigate('/login');
      return;
    }
    const myShop = storage.getShops().find(s => s.owner_id === user.id);
    if (!myShop) {
      navigate('/create-shop');
      return;
    }
    setShopId(myShop.id);
  }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) return;

    const newProduct: Product = {
      id: (isService ? 's' : 'p') + Math.random().toString(36).substr(2, 5),
      shop_id: shopId,
      name,
      price: Number(price),
      description,
      isService,
      stock: isService ? 999 : Number(stock),
      imageUrl: image || (isService ? 'https://images.unsplash.com/photo-1581578731548-c64695cc6958' : 'https://images.unsplash.com/photo-1542838132-92c53300491e')
    };

    const existing = storage.getProducts();
    storage.setProducts([...existing, newProduct]);
    navigate('/shop-dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Add to Inventory</h1>
        <p className="text-slate-500 mb-8">List a new product or service for your neighborhood.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setIsService(false)}
              className={`flex-grow py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isService ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Physical Product
            </button>
            <button
              type="button"
              onClick={() => setIsService(true)}
              className={`flex-grow py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isService ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Service Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Item Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  placeholder="e.g. Organic Tomatoes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                {!isService && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Stock Qty</label>
                    <input
                      type="number"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Item Image</label>
              <div className="relative group aspect-square rounded-3xl bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-400 transition-all">
                {image ? (
                  <img src={image} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt text-3xl text-slate-300 mb-2"></i>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Upload Photo</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Description (Optional)</label>
            <textarea
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-medium h-32"
              placeholder="Tell customers more about this item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/shop-dashboard')}
              className="px-8 py-4 text-slate-400 font-black uppercase text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-grow py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              Add to {isService ? 'Services' : 'Products'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
