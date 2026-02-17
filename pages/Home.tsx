
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { storage } from '../services/storageService';
import { Shop, Product } from '../types';

const Home: React.FC = () => {
  const location = useLocation();
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [userLoc, setUserLoc] = useState<{lat: number, lon: number} | null>(null);

  // Load initial data
  useEffect(() => {
    const allShops = storage.getShops().filter(s => s.status === 'approved');
    const allProds = storage.getProducts();
    setShops(allShops);
    setProducts(allProds);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => setUserLoc({ lat: p.coords.latitude, lon: p.coords.longitude }),
        err => console.debug("Geolocation denied or unavailable")
      );
    }
  }, []);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Derived states for filtering
  const { nearbyShops, nearbyProducts, nearbyServices, featuredShops } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q')?.toLowerCase();
    const cat = params.get('cat');
    const distLimit = params.get('dist') ? Number(params.get('dist')) : null;

    // Filter Shops
    let filteredS = [...shops];
    
    if (cat && cat !== 'All') {
      filteredS = filteredS.filter(s => s.category === cat);
    }
    
    if (q) {
      filteredS = filteredS.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.category.toLowerCase().includes(q) ||
        s.owner_name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.pincode.includes(q)
      );
    }

    // Apply distance only if a limit is explicitly set or if searching
    if (userLoc && (distLimit || q)) {
      const limit = distLimit || 50; // Use a wider default for search
      filteredS = filteredS.map(s => ({ 
        ...s, 
        distance: getDistance(userLoc.lat, userLoc.lon, s.latitude, s.longitude) 
      }))
      .filter(s => (s as any).distance <= limit)
      .sort((a: any, b: any) => a.distance - b.distance);
    } else if (userLoc) {
      // Just add distance info without aggressive filtering for general browse
      filteredS = filteredS.map(s => ({ 
        ...s, 
        distance: getDistance(userLoc.lat, userLoc.lon, s.latitude, s.longitude) 
      })).sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
    }

    // Filter Products/Services
    let filteredP = products;
    if (q) {
      filteredP = filteredP.filter(p => p.name.toLowerCase().includes(q));
    }

    return {
      nearbyShops: filteredS,
      nearbyProducts: filteredP.filter(p => !p.isService),
      nearbyServices: filteredP.filter(p => p.isService),
      featuredShops: shops.filter(s => s.isFeatured)
    };
  }, [location.search, shops, products, userLoc]);

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-10 mt-16 px-2">
      <div className="w-2 h-10 bg-indigo-600 rounded-full"></div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 no-scrollbar">
      {/* Hero Heading */}
      <div className="py-20 text-center animate-in fade-in zoom-in duration-1000">
         <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-8">Find Your <br/><span className="text-indigo-600">Local Shops.</span></h1>
         <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-300">Community Marketplace • Neighborhood Values</p>
      </div>

      {/* Featured Shops */}
      {featuredShops.length > 0 && (
        <section>
          <SectionHeader title="Featured Neighborhood" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredShops.map(shop => (
              <Link to={`/shop/${shop.id}`} key={shop.id} className="group flex flex-col sm:flex-row bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all h-auto sm:h-44">
                <div className="w-full sm:w-64 h-44 sm:h-full shrink-0 overflow-hidden">
                   <img src={shop.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <div className="p-8 flex flex-col justify-center flex-grow">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-1.5">{shop.category}</p>
                         <h3 className="text-xl font-black text-slate-900 truncate">{shop.name}</h3>
                         <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-2"><i className="fas fa-location-dot text-indigo-200"></i> {shop.address}</p>
                      </div>
                      <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2">
                         <i className="fas fa-star text-[9px]"></i> {shop.rating || '4.5'}
                      </div>
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Map Section */}
      <section className="mt-24">
         <div className="bg-white p-5 rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden relative group">
            <div className="h-[450px] w-full bg-slate-100 rounded-[3.5rem] overflow-hidden">
               <iframe 
                 width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
                 src={`https://www.google.com/maps/embed/v1/search?key=${process.env.API_KEY}&q=shops+near+me&center=${userLoc?.lat || 19.0760},${userLoc?.lon || 72.8777}&zoom=14`}
                 allowFullScreen
               ></iframe>
            </div>
            <div className="absolute top-10 left-10 p-8 bg-white/95 backdrop-blur rounded-[3rem] shadow-2xl border border-slate-100 max-w-sm pointer-events-none transition-all group-hover:scale-105">
               <h4 className="text-[10px] font-black uppercase text-indigo-600 mb-3 tracking-widest">Neighborhood Radar</h4>
               <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"You are currently viewing {nearbyShops.length} verified shops near your area."</p>
            </div>
         </div>
      </section>

      {/* Nearby Shops */}
      <section>
        <SectionHeader title="Neighborhood Shops" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {nearbyShops.map(shop => (
             <Link to={`/shop/${shop.id}`} key={shop.id} className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 hover:shadow-2xl transition-all flex items-center gap-6">
                <div className="w-28 h-28 rounded-3xl overflow-hidden shrink-0 shadow-lg">
                   <img src={shop.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex-grow min-w-0 pr-4">
                   <p className="text-[9px] font-black uppercase text-indigo-500 mb-1 tracking-widest">{shop.category}</p>
                   <h3 className="text-lg font-black text-slate-900 truncate leading-tight">{shop.name}</h3>
                   <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {(shop as any).distance ? `${(shop as any).distance.toFixed(1)} KM` : 'Locating...'}
                      </span>
                      <span className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg"><i className="fas fa-star text-[8px]"></i> {shop.rating || 'New'}</span>
                   </div>
                </div>
             </Link>
           ))}
           {nearbyShops.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No shops found matching your criteria</p>
              </div>
           )}
        </div>
      </section>

      {/* Nearby Products */}
      <section>
        <SectionHeader title="Popular Products" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
           {nearbyProducts.map(p => (
             <Link to={`/shop/${p.shop_id}`} key={p.id} className="group bg-white rounded-[2.5rem] p-5 border border-slate-100 hover:shadow-2xl transition-all">
                <div className="aspect-square rounded-3xl overflow-hidden mb-5 relative shadow-md">
                   <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                   <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1.5 rounded-xl text-xs font-black shadow-lg">₹{p.price}</div>
                   {p.stock === 0 && <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-[10px] font-black text-white uppercase tracking-widest">Out of Stock</div>}
                </div>
                <h4 className="text-sm font-black text-slate-800 truncate px-1">{p.name}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mt-1.5">Product</p>
             </Link>
           ))}
        </div>
      </section>

      {/* Nearby Services */}
      <section>
        <SectionHeader title="Top Services" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
           {nearbyServices.map(s => (
             <Link to={`/shop/${s.shop_id}`} key={s.id} className="group bg-white rounded-[2.5rem] p-5 border border-slate-100 hover:shadow-2xl transition-all">
                <div className="aspect-square rounded-3xl overflow-hidden mb-5 relative shadow-md">
                   <img src={s.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                   <div className="absolute top-3 right-3 bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg tracking-widest uppercase">Fixed</div>
                </div>
                <h4 className="text-sm font-black text-slate-800 truncate px-1">{s.name}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mt-1.5">Service</p>
             </Link>
           ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
