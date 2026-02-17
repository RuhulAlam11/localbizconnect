
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storageService';
import { User, Shop, ShopType, WeeklyHours, DailyHours } from '../types';
import { SHOP_CATEGORIES } from '../constants';

interface CreateShopProps {
  user: User | null;
}

const DEFAULT_HOURS: DailyHours = { open: '09:00', close: '21:00', closed: false };

// Advanced Image Uploader Component
const ImageUploader: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  icon: string;
}> = ({ label, value, onChange, icon }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const item = e.clipboardData.items[0];
    if (item?.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) handleFile(file);
    }
  };

  return (
    <div className="flex flex-col">
      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        onClick={() => fileInputRef.current?.click()}
        className={`relative h-56 rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group
          ${isDragging ? 'border-indigo-600 bg-indigo-50/50 scale-95' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300'}`}
      >
        {value ? (
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-6">
            <i className={`fas ${icon} text-3xl mb-4 transition-transform group-hover:scale-110 ${isDragging ? 'text-indigo-600' : 'text-slate-300'}`}></i>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">
              Drop Photo Here,<br/> Click to Browse,<br/> or Paste (Ctrl+V)
            </p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        {value && (
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <span className="bg-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase text-slate-900 shadow-2xl">Replace Image</span>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateShop: React.FC<CreateShopProps> = ({ user }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showCustomCat, setShowCustomCat] = useState(false);
  
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: user?.name || '',
    category: SHOP_CATEGORIES[0],
    customCategory: '',
    shopType: 'product' as ShopType,
    address: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    latitude: 19.0760,
    longitude: 72.8777,
    phone: '',
    whatsapp: '',
    deliveryAvailable: true,
    deliveryRadius: 5,
    baseFee: 15,
    perKm: 2,
    ownerPhoto: '',
    frontPhoto: '',
    logo: ''
  });

  const [hours, setHours] = useState<WeeklyHours>({
    monday: { ...DEFAULT_HOURS },
    tuesday: { ...DEFAULT_HOURS },
    wednesday: { ...DEFAULT_HOURS },
    thursday: { ...DEFAULT_HOURS },
    friday: { ...DEFAULT_HOURS },
    saturday: { ...DEFAULT_HOURS },
    sunday: { ...DEFAULT_HOURS, closed: true },
  });

  useEffect(() => {
    if (!user || user.role !== 'shopkeeper') navigate('/login');
  }, [user, navigate]);

  const handleFinish = () => {
    const finalCategory = showCustomCat ? formData.customCategory : formData.category;
    if (!finalCategory || !formData.shopName || !formData.phone) { 
       alert("Please fill all mandatory fields!"); 
       return; 
    }

    const newShop: Shop = {
      id: 's' + Math.random().toString(36).substr(2, 5),
      owner_id: user!.id,
      owner_name: formData.ownerName,
      name: formData.shopName,
      category: finalCategory,
      shopType: formData.shopType,
      address: formData.address,
      landmark: formData.landmark,
      pincode: formData.pincode,
      city: formData.city,
      state: formData.state || 'Maharashtra',
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      openingHours: "Standard Operating Hours",
      detailedHours: hours,
      status: 'pending', // Reverted to pending for Admin Manual Approval
      deliveryAvailable: formData.deliveryAvailable,
      deliveryRadius: formData.deliveryRadius,
      deliveryFee: formData.baseFee,
      perKmCharge: formData.perKm,
      commission: 5,
      latitude: formData.latitude,
      longitude: formData.longitude,
      imageUrl: formData.frontPhoto || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
      logoUrl: formData.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.shopName}`,
      ownerPhotoUrl: formData.ownerPhoto,
      createdAt: new Date().toISOString()
    };

    const shops = storage.getShops();
    storage.setShops([...shops, newShop]);
    alert("Application submitted! Admin will verify and approve your shop soon.");
    navigate('/');
  };

  const updateDay = (day: keyof WeeklyHours, field: keyof DailyHours, value: any) => {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const steps = ['Basic Info', 'Identity', 'Location', 'Contact', 'Hours'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12 flex justify-between relative px-2">
         {steps.map((s, i) => (
           <div key={i} className="flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] transition-all ${step > i ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>{i+1}</div>
              <span className="text-[8px] font-black uppercase mt-2 text-slate-400 tracking-widest">{s}</span>
           </div>
         ))}
         <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
      </div>

      <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
         {step === 1 && (
           <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 leading-none">Step 1: Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Shop Owner Name</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Shop Name</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" value={formData.shopName} onChange={(e) => setFormData({...formData, shopName: e.target.value})} />
                 </div>
              </div>
              <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
                    <button onClick={() => setShowCustomCat(!showCustomCat)} className="text-[10px] font-black uppercase text-indigo-600 underline">Add Custom?</button>
                 </div>
                 {showCustomCat ? (
                    <input type="text" placeholder="Custom niche..." className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" value={formData.customCategory} onChange={(e) => setFormData({...formData, customCategory: e.target.value})} />
                 ) : (
                    <select className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold appearance-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                       {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 )}
              </div>
              <div>
                 <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-2">Shop Type <i className="fas fa-info-circle text-indigo-400" title="Product = Physical items, Service = Skill-based, Both = Mix of both"></i></label>
                 <div className="grid grid-cols-3 gap-3">
                    {(['product', 'service', 'both'] as ShopType[]).map(t => (
                      <button key={t} onClick={() => setFormData({...formData, shopType: t})} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.shopType === t ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                        {t}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
         )}

         {step === 2 && (
           <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 leading-none">Step 2: Identity & Trust</h2>
              <p className="text-slate-400 text-xs font-bold mb-6">Drag and drop images or paste from clipboard (Ctrl+V).</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <ImageUploader 
                    label="Owner Photo (Required)" 
                    value={formData.ownerPhoto} 
                    onChange={(val) => setFormData({...formData, ownerPhoto: val})} 
                    icon="fa-user-tie"
                 />
                 <ImageUploader 
                    label="Shop Front Photo (Required)" 
                    value={formData.frontPhoto} 
                    onChange={(val) => setFormData({...formData, frontPhoto: val})} 
                    icon="fa-store"
                 />
              </div>
              <div className="mt-8">
                 <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Shop Logo (Optional)</label>
                 <input type="text" placeholder="Logo Image URL (or leave blank for default)" className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" value={formData.logo} onChange={(e) => setFormData({...formData, logo: e.target.value})} />
              </div>
           </div>
         )}

         {step === 3 && (
           <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 leading-none">Step 3: Location Details</h2>
              <input type="text" placeholder="Full Address" className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              <div className="grid grid-cols-2 gap-6">
                 <input type="text" placeholder="Pincode" className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
                 <input type="text" placeholder="City" className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </div>
              <button onClick={() => {}} className="w-full py-5 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all">
                 <i className="fas fa-location-crosshairs"></i> Detect My Current Location
              </button>
           </div>
         )}

         {step === 4 && (
           <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-900 leading-none">Step 4: Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Phone Number (Required)</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">WhatsApp (Optional)</label>
                    <input type="text" className="w-full bg-slate-50 border-none rounded-2xl p-5 font-bold" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
                 </div>
              </div>
              <div className="p-8 bg-slate-50 rounded-[3rem] space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Neighborhood Delivery Service</span>
                    <button onClick={() => setFormData({...formData, deliveryAvailable: !formData.deliveryAvailable})} className={`w-14 h-7 rounded-full relative transition-all ${formData.deliveryAvailable ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                       <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${formData.deliveryAvailable ? 'left-8' : 'left-1'}`}></div>
                    </button>
                 </div>
                 {formData.deliveryAvailable && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                       <div>
                          <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Base Delivery Fee (₹)</label>
                          <input type="number" className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-xs font-bold" value={formData.baseFee} onChange={(e) => setFormData({...formData, baseFee: Number(e.target.value)})} />
                       </div>
                       <div>
                          <label className="block text-[8px] font-black uppercase text-slate-400 mb-2">Per KM Charge (₹)</label>
                          <input type="number" className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-xs font-bold" value={formData.perKm} onChange={(e) => setFormData({...formData, perKm: Number(e.target.value)})} />
                       </div>
                    </div>
                 )}
              </div>
           </div>
         )}

         {step === 5 && (
            <div className="space-y-6">
               <h2 className="text-3xl font-black text-slate-900 leading-none">Step 5: Operating Hours</h2>
               <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-4 no-scrollbar">
                  {(Object.keys(hours) as (keyof WeeklyHours)[]).map(day => (
                    <div key={day} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem]">
                       <span className="text-[10px] font-black uppercase text-slate-600 w-24 tracking-widest">{day}</span>
                       <div className="flex items-center gap-3">
                          {!hours[day].closed ? (
                            <>
                               <input type="time" value={hours[day].open} onChange={(e) => updateDay(day, 'open', e.target.value)} className="bg-white border-none rounded-xl p-3 text-xs font-bold shadow-sm" />
                               <span className="text-slate-300 font-bold">to</span>
                               <input type="time" value={hours[day].close} onChange={(e) => updateDay(day, 'close', e.target.value)} className="bg-white border-none rounded-xl p-3 text-xs font-bold shadow-sm" />
                            </>
                          ) : <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Closed for the day</span>}
                          <button onClick={() => updateDay(day, 'closed', !hours[day].closed)} className={`ml-4 px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-colors ${hours[day].closed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                             {hours[day].closed ? 'Open Shop' : 'Close Shop'}
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         )}
         
         <div className="mt-12 flex gap-4">
            {step > 1 && <button onClick={() => setStep(step - 1)} className="px-10 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest hover:text-slate-600">Go Back</button>}
            <button 
               onClick={() => step === 5 ? handleFinish() : setStep(step + 1)} 
               className="flex-grow py-5 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95"
            >
               {step === 5 ? 'Launch My Neighborhood Shop' : 'Next Step'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default CreateShop;
