
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { storage } from '../services/storageService';
import { User, Order, OrderItem, PaymentMethod, Notification, Shop, Product } from '../types';

interface CartProps {
  user: User | null;
}

const Cart: React.FC<CartProps> = ({ user }) => {
  const { cart, removeFromCart, clearCart, total } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'verifying' | 'success'>('processing');
  const [deliveryFees, setDeliveryFees] = useState<Record<string, number>>({});
  const [userLoc, setUserLoc] = useState<{lat: number, lon: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => setUserLoc({ lat: p.coords.latitude, lon: p.coords.longitude }));
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

  useEffect(() => {
    const shops = storage.getShops();
    const uniqueShopIds: string[] = Array.from(new Set(cart.map(i => i.shopId)));
    const fees: Record<string, number> = {};
    
    uniqueShopIds.forEach(id => {
      const shop = shops.find(s => s.id === id);
      if (shop) {
        let fee = shop.deliveryFee || 0;
        if (userLoc && shop.perKmCharge) {
          const dist = getDistance(userLoc.lat, userLoc.lon, shop.latitude, shop.longitude);
          fee += dist * shop.perKmCharge;
        }
        fees[id] = Math.round(fee);
      }
    });
    setDeliveryFees(fees);
  }, [cart, userLoc]);

  const handlePlaceOrder = () => {
    if (!user) { navigate('/login'); return; }
    if (cart.length === 0) return;
    if (paymentMethod === 'online') { 
      setIsPaying(true); 
      setPaymentStatus('processing');
      setTimeout(() => setPaymentStatus('verifying'), 2000);
      setTimeout(() => completeOrder(), 4000);
      return; 
    }
    completeOrder();
  };

  const completeOrder = () => {
    const shopsInCart: string[] = Array.from(new Set(cart.map(item => item.shopId)));
    const shops = storage.getShops();

    // Inventory Deduction Logic
    const allProducts = storage.getProducts();
    const updatedProducts = allProducts.map(p => {
      const cartItem = cart.find(item => item.product.id === p.id);
      if (cartItem && !p.isService) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    });
    storage.setProducts(updatedProducts);

    const orders: Order[] = shopsInCart.map((shopId: string) => {
      const shop = shops.find(s => s.id === shopId);
      const shopItems = cart.filter(item => item.shopId === shopId);
      const shopSubtotal = shopItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const deliveryFee = deliveryFees[shopId] || 0;
      const orderId = `ord-${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        id: orderId,
        customer_id: user!.id,
        customer_name: user!.name,
        shop_id: shopId,
        shop_name: shop?.name || 'Local Shop',
        total_amount: shopSubtotal + deliveryFee,
        status: 'pending',
        type: 'direct',
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
        items: shopItems.map(item => ({
          id: Math.random().toString(36).substr(2, 9),
          order_id: orderId,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      };
    });

    storage.setOrders([...storage.getOrders(), ...orders]);
    clearCart();
    navigate('/orders');
  };

  const totalDeliveryFee = Object.values(deliveryFees).reduce((a: number, b: number) => a + b, 0);

  if (isPaying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white">
         <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
               <i className={`fas ${paymentStatus === 'processing' ? 'fa-shield-halved' : 'fa-circle-notch fa-spin'} text-4xl`}></i>
            </div>
            <div>
               <h2 className="text-3xl font-black mb-2">{paymentStatus === 'processing' ? 'Securing Gateway' : 'Verifying Transaction'}</h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Please do not refresh the page</p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
               <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-black text-slate-500">Amount</span><span className="font-black">₹{total + totalDeliveryFee}</span></div>
               <div className="flex justify-between items-center"><span className="text-[10px] uppercase font-black text-slate-500">Payment ID</span><span className="font-black text-xs">#X-LOCAL-BIZ-{Math.floor(Math.random() * 999999)}</span></div>
            </div>
         </div>
      </div>
    );
  }

  if (cart.length === 0) return (
     <div className="max-w-5xl mx-auto px-4 py-32 text-center">
        <i className="fas fa-shopping-basket text-7xl text-slate-100 mb-8"></i>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Your basket is empty</h2>
        <Link to="/" className="inline-block px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 transition-all">Explore Nearby Shops</Link>
     </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-12 text-slate-900 leading-none">Review Your Order</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-6 py-4 border-b last:border-0 border-slate-50">
                <img src={item.product.imageUrl} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-grow">
                   <h3 className="font-bold text-slate-800">{item.product.name}</h3>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest">{item.quantity} Unit(s) • ₹{item.product.price} ea</p>
                </div>
                <p className="font-black text-slate-900">₹{item.product.price * item.quantity}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Payment Method</h4>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setPaymentMethod('cod')} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-slate-50 text-slate-400'}`}>
                   <i className="fas fa-hand-holding-dollar text-xl"></i>
                   <span className="text-[10px] font-black uppercase tracking-widest">Cash on Delivery</span>
                </button>
                <button onClick={() => setPaymentMethod('online')} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'online' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-slate-50 text-slate-400'}`}>
                   <i className="fas fa-credit-card text-xl"></i>
                   <span className="text-[10px] font-black uppercase tracking-widest">Online Payment</span>
                </button>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[3rem] h-fit sticky top-24">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Summary</h3>
           <div className="space-y-4 mb-10">
              <div className="flex justify-between font-bold text-sm"><span className="text-slate-400">Basket Subtotal</span><span>₹{total}</span></div>
              <div className="flex justify-between font-bold text-sm"><span className="text-slate-400">Neighborhood Delivery</span><span>₹{totalDeliveryFee}</span></div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                 <span className="text-xs uppercase font-black text-indigo-400 tracking-widest">Total</span>
                 <span className="text-4xl font-black">₹{total + totalDeliveryFee}</span>
              </div>
           </div>
           <button onClick={handlePlaceOrder} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
             {paymentMethod === 'online' ? 'Pay & Place Order' : 'Place Local Order'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
