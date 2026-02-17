
export type UserRole = 'customer' | 'shopkeeper' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export type ShopStatus = 'pending' | 'approved' | 'rejected';
export type ShopType = 'product' | 'service' | 'both';

export interface DailyHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface WeeklyHours {
  monday: DailyHours;
  tuesday: DailyHours;
  wednesday: DailyHours;
  thursday: DailyHours;
  friday: DailyHours;
  saturday: DailyHours;
  sunday: DailyHours;
}

export interface Shop {
  id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  category: string;
  shopType: ShopType;
  address: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  phone: string;
  whatsapp?: string;
  openingHours: string;
  detailedHours?: WeeklyHours;
  status: ShopStatus;
  deliveryAvailable: boolean;
  deliveryRadius: number;
  deliveryFee: number;
  perKmCharge?: number;
  commission: number;
  imageUrl?: string;
  logoUrl?: string;
  ownerPhotoUrl?: string;
  latitude: number;
  longitude: number;
  isFeatured?: boolean;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
  adStats?: {
    impressions: number;
    clicks: number;
    leads: number;
  };
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description?: string;
  isService?: boolean;
}

export type OrderStatus = 'pending' | 'quoted' | 'accepted' | 'delivered' | 'cancelled';
export type OrderType = 'direct' | 'custom_list';
export type PaymentMethod = 'cod' | 'online';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer_id: string;
  customer_name?: string;
  shop_id: string;
  shop_name: string;
  total_amount: number;
  quote_amount?: number;
  isQuoted?: boolean;
  status: OrderStatus;
  type: OrderType;
  payment_method?: PaymentMethod;
  custom_list_text?: string;
  created_at: string;
  items: OrderItem[];
  isRated?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  orderId?: string;
}

export interface Review {
  id: string;
  shop_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type?: 'stock' | 'order' | 'quote';
}

export interface CartItem {
  product: Product;
  quantity: number;
  shopId: string;
}
