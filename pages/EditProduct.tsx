
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storage } from '../services/storageService';
import { User, Product } from '../types';

const EditProduct: React.FC<{ user: User | null }> = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isService, setIsService] = useState(false);
  const [stock, setStock] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'shopkeeper') { navigate('/login'); return; }
    const found = storage.getProducts().find(p => p.id === id);
    if (!found) { navigate('/shop-dashboard'); return; }
    
    setProduct(found);
    setName(found.name);
    setPrice(found.price.toString());
    setDescription(found.description || '');
    setIsService(found.isService || false);
    setStock(found.stock.toString());
    setImage(found.imageUrl);
  }, [id, user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const updated: Product = {
      ...product,
      name,
      price: Number(price),
      description,
      stock: isService ? 999 : Number(stock),
      imageUrl: image || product.imageUrl
    };

    const all = storage.getProducts();
    const updatedAll = all.map(p => p.id === id ? updated : p);
    storage.setProducts(updatedAll);
    navigate('/shop-dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 md:p-16">
        <h1 className="text-3xl font-black text-slate-900 mb-2 leading-none">Edit Item</h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Updating Catalog Entry</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Item Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Price (₹)</label>
                  <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" />
                </div>
                {!isService && (
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Stock</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" />
                  </div>
                )}
              </div>
            </div>
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Item Photo</label>
               <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] overflow-hidden relative group cursor-pointer">
                  {image ? <img src={image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-slate-300"><i className="fas fa-image text-3xl"></i></div>}
                  <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
               </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Full Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-6 font-medium h-32" />
          </div>
          <div className="flex gap-4 pt-4">
             <button type="button" onClick={() => navigate('/shop-dashboard')} className="px-10 py-5 text-slate-400 font-black uppercase text-[10px]">Discard</button>
             <button type="submit" className="flex-grow py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
