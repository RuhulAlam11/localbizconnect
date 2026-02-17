
import { Shop, Product, User } from './types';

export const SHOP_CATEGORIES = [
  'Grocery',
  'Electronics',
  'Clothing',
  'Pharmacy',
  'Bakery',
  'Pet Supplies',
  'Stationery',
  'Salon',
  'Plumbing',
  'Tailoring'
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'John Admin', email: 'admin@localbiz.com', role: 'admin' },
  { id: 'u2', name: 'Sam Shopkeeper', email: 'sam@bakery.com', role: 'shopkeeper' },
  { id: 'u3', name: 'Alice Customer', email: 'alice@gmail.com', role: 'customer' },
];

export const INITIAL_SHOPS: Shop[] = [
  {
    id: 's1',
    owner_id: 'u2',
    owner_name: 'Sam Bakes',
    name: 'Fresh Bakes Corner',
    category: 'Bakery',
    shopType: 'product',
    address: '123 Baker St, Midtown',
    pincode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '555-0101',
    openingHours: '08:00 AM - 08:00 PM',
    status: 'approved',
    deliveryAvailable: true,
    deliveryRadius: 5,
    deliveryFee: 15,
    commission: 5,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800',
    latitude: 19.0760,
    longitude: 72.8777,
    isFeatured: true,
    createdAt: '2023-10-01T10:00:00Z'
  },
  {
    id: 's2',
    owner_id: 'u2',
    owner_name: 'Sam Bakes',
    name: 'Quick Fix Electronics',
    category: 'Electronics',
    shopType: 'both',
    address: '456 Market Rd, Downtown',
    pincode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '555-0202',
    openingHours: '10:00 AM - 09:00 PM',
    status: 'approved',
    deliveryAvailable: true,
    deliveryRadius: 10,
    deliveryFee: 50,
    commission: 8,
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800',
    latitude: 19.0820,
    longitude: 72.8890,
    isFeatured: false,
    createdAt: '2023-11-15T10:00:00Z'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', shop_id: 's1', name: 'Sourdough Bread', price: 45, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?auto=format&fit=crop&q=80&w=400', isService: false },
  { id: 'p2', shop_id: 's1', name: 'Chocolate Muffin', price: 25, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1582211594533-268f4f1edeb9?auto=format&fit=crop&q=80&w=400', isService: false },
  { id: 'p3', shop_id: 's2', name: 'Smartphone Screen Repair', price: 1500, stock: 99, imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=400', isService: true },
  { id: 'p4', shop_id: 's2', name: 'USB-C Cable', price: 299, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=400', isService: false },
];
