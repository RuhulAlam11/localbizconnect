
import { User, Shop, Product, Order, ChatMessage, Review, Notification } from '../types';
import { INITIAL_USERS, INITIAL_SHOPS, INITIAL_PRODUCTS } from '../constants';

const KEYS = {
  USERS: 'lb_users',
  SHOPS: 'lb_shops',
  PRODUCTS: 'lb_products',
  ORDERS: 'lb_orders',
  CHATS: 'lb_chats',
  REVIEWS: 'lb_reviews',
  NOTIFICATIONS: 'lb_notifications',
  CURRENT_USER: 'lb_current_user',
  FAVORITES: 'lb_favorites'
};

export const storage = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    if (!data) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(data);
  },
  setUsers: (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),

  getShops: (): Shop[] => {
    const data = localStorage.getItem(KEYS.SHOPS);
    if (!data) {
      localStorage.setItem(KEYS.SHOPS, JSON.stringify(INITIAL_SHOPS));
      return INITIAL_SHOPS;
    }
    return JSON.parse(data);
  },
  setShops: (shops: Shop[]) => localStorage.setItem(KEYS.SHOPS, JSON.stringify(shops)),

  getProducts: (): Product[] => {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  },
  setProducts: (products: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products)),

  getOrders: (): Order[] => {
    const data = localStorage.getItem(KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },
  setOrders: (orders: Order[]) => localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders)),

  getChats: (): ChatMessage[] => {
    const data = localStorage.getItem(KEYS.CHATS);
    return data ? JSON.parse(data) : [];
  },
  setChats: (chats: ChatMessage[]) => localStorage.setItem(KEYS.CHATS, JSON.stringify(chats)),

  getReviews: (): Review[] => {
    const data = localStorage.getItem(KEYS.REVIEWS);
    return data ? JSON.parse(data) : [];
  },
  setReviews: (reviews: Review[]) => localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews)),

  getNotifications: (): Notification[] => {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  },
  setNotifications: (notifications: Notification[]) => localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications)),

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser: (user: User | null) => localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user)),

  getFavorites: (): string[] => {
    const user = storage.getCurrentUser();
    if (!user) return [];
    const data = localStorage.getItem(`${KEYS.FAVORITES}_${user.id}`);
    return data ? JSON.parse(data) : [];
  },
  toggleFavorite: (shopId: string) => {
    const user = storage.getCurrentUser();
    if (!user) return;
    const favs = storage.getFavorites();
    const updated = favs.includes(shopId) ? favs.filter(id => id !== shopId) : [...favs, shopId];
    localStorage.setItem(`${KEYS.FAVORITES}_${user.id}`, JSON.stringify(updated));
    return updated;
  }
};
