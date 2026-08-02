export interface CategoryItem {
  id: string;
  label: string;
}

export type CategoryType = string;

export interface Product {
  id: string;
  title: string;
  code: string;
  category: string;
  price: number;
  originalPrice?: number;
  frameType: string; // e.g. کائوچویی, فلزی, مگنتی, خلبانی
  lensColor: string; // e.g. دودی, جیوه‌ای, قهوه‌ای
  uvProtection: string; // e.g. UV400, Polarized
  gender: 'مردانه' | 'زنانه' | 'اسپرت (یونی‌سکس)';
  images: string[];
  description: string;
  features: string[];
  stock: number;
  isFeatured?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface OrderCustomer {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderCode: string;
  createdAt: string;
  items: CartItem[];
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  customer: OrderCustomer;
  paymentMethod: 'card_to_card' | 'online_gateway' | 'cash_on_delivery';
  paymentReceipt?: string;
  status: OrderStatus;
  postalTrackingCode?: string;
  adminNote?: string;
  updatedAt?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  bannerMessage?: string;
  welcomeText?: string;
  welcomeSubtext?: string;
  noticeText?: string;
  aboutText?: string;
  rulesText?: string;
  categories?: CategoryItem[];
  instagram: string;
  telegram?: string;
  phone: string;
  address: string;
  freeShippingThreshold: number;
  adminPasscode: string;
  cardNumber: string;
  cardHolderName: string;
  bankName?: string;
  accountNumber?: string;
  shebaNumber?: string;
}
