import { Product, Order, StoreSettings, CategoryItem } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc, writeBatch, onSnapshot } from 'firebase/firestore';

const PRODUCTS_KEY = 'stock_jahani_products_v1';
const ORDERS_KEY = 'stock_jahani_orders_v1';
const SETTINGS_KEY = 'stock_jahani_settings_v1';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'sunglasses', label: 'عینک آفتابی' },
  { id: 'optical', label: 'عینک طبی' },
  { id: 'sport', label: 'ورزشی و اسپرت' },
  { id: 'unisex', label: 'یونی‌سکس' },
  { id: 'accessories', label: 'لوازم جانبی' },
];

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'stock_jahani',
  tagline: 'فروشگاه تخصصی عینک‌های آفتابی و طبی استوک اورجینال',
  bannerMessage: '✨ ارسال با پست پیشتاز به سراسر کشور | تضمین سلامت فریم و عدسی',
  welcomeText: 'تجربه‌ای متفاوت از کیفیت و استایل با عینک استوک جهانی',
  welcomeSubtext: 'مجموعه کامل عینک‌های آفتابی و طبی اورجینال، فریم‌های استوک کائوچویی و فلزی ساخت اروپا با عدسی‌های پلاریزه و استاندارد کامل UV400.',
  noticeText: '💡 خریداران گرامی: پس از ثبت سفارش، کد ۲۴ رقمی رهگیری پستی به همراه وضعیت خریدهای شما در بخش «پیگیری سفارشات» قرار خواهد گرفت.',
  aboutText: 'فروشگاه عینک استوک جهانی عرضه کننده مستقیم جدیدترین فریم‌های طبی و آفتابی استوک اورجینال اروپا با بالاترین کیفیت و نازل‌ترین قیمت.',
  rulesText: 'تمامی بسته‌ها در هاردکیس مقاوم ضدضربه با پُست پیشتاز ارسال شده و کد رهگیری مرسوله پستی پس از ارسال در همین سایت نمایش داده می‌شود.',
  categories: DEFAULT_CATEGORIES,
  instagram: 'stock_jahani',
  phone: '09120000000',
  address: 'تهران، خیابان ولیعصر، مرکز خرید عینک استوک جهانی',
  freeShippingThreshold: 0,
  adminPasscode: '1383',
  cardNumber: '6037-9975-1234-5678',
  cardHolderName: 'بهنام جهانی',
  bankName: 'بانک ملی ایران',
  accountNumber: '0102030405006',
  shebaNumber: 'IR120170000000102030405006',
};

// Ready sample products if user requests demo items
export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    title: 'عینک آفتابی فریم خلبانی استوک اروپایی',
    code: 'STK-901',
    category: 'sunglasses',
    price: 1850000,
    originalPrice: 2400000,
    frameType: 'فلزی استیل ضدزنگ',
    lensColor: 'دودی هایلایت (Graded Green)',
    uvProtection: 'UV400 + Polarized',
    gender: 'اسپرت (یونی‌سکس)',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'عینک آفتابی خلبانی کلاسیک با کیفیت ساخت درجه یک اروپایی، دارای لنز پلاریزه با وضوح دید فوق‌العاده و محافظت ۱۰۰٪ در برابر اشعه‌های مضر UV. بسیار سبک و مناسب استفاده طولانی‌مدت و رانندگی.',
    features: ['عدسی پلاریزه واقعی', 'پد بینی سیلیکونی نرم', 'همراه با هارد کیس و دستمال نانو میکروفایبر', 'سبک و مقاوم'],
    stock: 5,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-2',
    title: 'عینک طبی کائوچویی فریم گربه‌ای تام فورد',
    code: 'STK-408',
    category: 'optical',
    price: 1650000,
    originalPrice: 1950000,
    frameType: 'کائوچو استات درجه یک',
    lensColor: 'شفاف بلوکات (BlueCut)',
    uvProtection: 'UV400 + Anti-Reflective',
    gender: 'زنانه',
    images: [
      'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'فریم طبی بسیار شیک گربه‌ای مدرن با دسته مجهز به لولای فنری اروپایی. مناسب برای نمره چشم و کار با کامپیوتر و گوشی.',
    features: ['فریم استات سبک', 'لولای فنری انعطاف‌پذیر', 'طراحی ارگونومیک صورت', 'مناسب تمام فرم‌های صورت'],
    stock: 3,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-3',
    title: 'عینک ورزشی و دوچرخه‌سواری مگنتی اسپرت',
    code: 'STK-705',
    category: 'sport',
    price: 2100000,
    frameType: 'پلی‌کربنات نشکن TR90',
    lensColor: 'جیوه‌ای چندرنگ (Rainbow)',
    uvProtection: 'UV400 Shield',
    gender: 'اسپرت (یونی‌سکس)',
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'عینک تخصصی ورزشی فوق‌العاده سبک با فریم TR90 مقاوم در برابر ضربه و عدسی وسیع ضدباد و گردوغبار.',
    features: ['عدسی یکپارچه پانوورامیک', 'جلوگیری از خستگی چشم در آفتاب شدید', 'ضد لغزش هنگام تعریق'],
    stock: 8,
    isFeatured: false,
    createdAt: new Date().toISOString()
  }
];

function cleanForFirestore<T>(data: T): T {
  if (data === undefined || data === null) return data;
  return JSON.parse(JSON.stringify(data));
}

export function getStoredProducts(): Product[] {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading products:', err);
    return [];
  }
}

export async function saveStoredProducts(products: Product[]): Promise<boolean> {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving products locally:', err);
  }

  try {
    const existingSnap = await getDocs(collection(db, 'products'));
    const currentIds = new Set(products.map((p) => p.id));
    const batch = writeBatch(db);

    existingSnap.forEach((docSnap) => {
      if (!currentIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    products.forEach((p) => {
      const cleanP = cleanForFirestore(p);
      batch.set(doc(db, 'products', p.id), cleanP);
    });

    await batch.commit();
    console.log('Saved products to Firestore successfully:', products.length);
  } catch (err) {
    console.error('Firestore batch product save error:', err);
    for (const p of products) {
      try {
        await setDoc(doc(db, 'products', p.id), cleanForFirestore(p));
      } catch (e) {
        console.error('Failed individual setDoc for product:', p.id, e);
      }
    }
  }

  // Also sync to backend server API if available
  fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  }).catch(() => {});

  return true;
}

export function getStoredOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading orders:', err);
    return [];
  }
}

export async function saveStoredOrders(orders: Order[]): Promise<boolean> {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders:', err);
  }

  try {
    const existingSnap = await getDocs(collection(db, 'orders'));
    const currentIds = new Set(orders.map((o) => o.id));
    const batch = writeBatch(db);

    existingSnap.forEach((docSnap) => {
      if (!currentIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    orders.forEach((o) => {
      const cleanO = cleanForFirestore(o);
      batch.set(doc(db, 'orders', o.id), cleanO);
    });

    await batch.commit();
  } catch (err) {
    console.error('Firestore orders save error:', err);
    for (const o of orders) {
      try {
        await setDoc(doc(db, 'orders', o.id), cleanForFirestore(o));
      } catch (e) {}
    }
  }

  // Also sync to backend server API if available
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orders }),
  }).catch(() => {});

  return true;
}

export function getStoredSettings(): StoreSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(data);
    if (parsed.adminPasscode === '1234' || !parsed.adminPasscode) {
      parsed.adminPasscode = '1383';
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }));
      } catch (e) {
        // Ignore storage errors
      }
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export async function saveStoredSettings(settings: StoreSettings): Promise<boolean> {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }

  try {
    await setDoc(doc(db, 'settings', 'store_settings'), cleanForFirestore(settings));
  } catch (err) {
    console.error('Firestore settings save error:', err);
  }

  // Also sync to backend server API if available
  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  }).catch(() => {});

  return true;
}

// Fetch all shared data from Firebase Firestore
export async function fetchServerData(): Promise<{ products: Product[]; orders: Order[]; settings: StoreSettings } | null> {
  try {
    const localProducts = getStoredProducts();

    // 1. Fetch products from Firestore
    const productsSnap = await getDocs(collection(db, 'products'));
    let products: Product[] = [];
    productsSnap.forEach((docSnap) => {
      products.push(docSnap.data() as Product);
    });

    // Seed or sync local products if Firestore is empty
    if (products.length === 0 && localProducts.length > 0) {
      await saveStoredProducts(localProducts);
      products = localProducts;
    } else if (products.length === 0) {
      const initial = DEMO_PRODUCTS;
      await saveStoredProducts(initial);
      products = initial;
    }

    // 2. Fetch orders from Firestore
    const ordersSnap = await getDocs(collection(db, 'orders'));
    let orders: Order[] = [];
    ordersSnap.forEach((docSnap) => {
      orders.push(docSnap.data() as Order);
    });

    // 3. Fetch settings from Firestore
    const settingsDoc = await getDoc(doc(db, 'settings', 'store_settings'));
    let settings: StoreSettings = DEFAULT_SETTINGS;
    if (settingsDoc.exists()) {
      settings = { ...DEFAULT_SETTINGS, ...settingsDoc.data() } as StoreSettings;
    } else {
      await setDoc(doc(db, 'settings', 'store_settings'), cleanForFirestore(DEFAULT_SETTINGS));
    }

    // Cache in localStorage
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}

    return { products, orders, settings };
  } catch (err) {
    console.warn('Firestore fetch failed, checking server API or local cache:', err);
    try {
      const res = await fetch('/api/data?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {}
    return null;
  }
}

// Live real-time subscription to Firebase Firestore for instant multi-device syncing
export function subscribeToFirestore(
  onDataUpdate: (data: { products?: Product[]; orders?: Order[]; settings?: StoreSettings }) => void
) {
  try {
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const products: Product[] = [];
        snapshot.forEach((docSnap) => {
          products.push(docSnap.data() as Product);
        });
        if (products.length > 0) {
          try {
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
          } catch (e) {}
          onDataUpdate({ products });
        }
      },
      (err) => console.warn('Products live sync error:', err)
    );

    const unsubOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          orders.push(docSnap.data() as Order);
        });
        try {
          localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        } catch (e) {}
        onDataUpdate({ orders });
      },
      (err) => console.warn('Orders live sync error:', err)
    );

    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'store_settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          const settings = { ...DEFAULT_SETTINGS, ...docSnap.data() } as StoreSettings;
          try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
          } catch (e) {}
          onDataUpdate({ settings });
        }
      },
      (err) => console.warn('Settings live sync error:', err)
    );

    return () => {
      unsubProducts();
      unsubOrders();
      unsubSettings();
    };
  } catch (e) {
    console.warn('Firestore live subscription setup error:', e);
    return () => {};
  }
}

// Convert and compress image File object to Base64 string (Max 1200px, 0.82 JPEG quality)
export function fileToBase64(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl || !file.type.startsWith('image/')) {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => resolve(dataUrl);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Format numbers in Persian/Toman currency format
export function formatToman(amount: number): string {
  if (isNaN(amount)) return '۰ تومان';
  const formatted = amount.toLocaleString('fa-IR');
  return `${formatted} تومان`;
}

// Convert English numbers to Persian digits for display
export function toPersianDigits(str: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/\d/g, (x) => persianDigits[parseInt(x)]);
}

// Generate human-readable short order IDs
export function generateOrderCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SJ-${num}`;
}

// Export full backup of products, orders, and settings
export function exportBackupData(): string {
  const backup = {
    products: getStoredProducts(),
    orders: getStoredOrders(),
    settings: getStoredSettings(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(backup, null, 2);
}

// Import full backup
export function importBackupData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data && Array.isArray(data.products)) {
      saveStoredProducts(data.products);
    }
    if (data && Array.isArray(data.orders)) {
      saveStoredOrders(data.orders);
    }
    if (data && data.settings && typeof data.settings === 'object') {
      saveStoredSettings(data.settings);
    }
    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
}

