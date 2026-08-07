import { Product, Order, StoreSettings, CategoryItem } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { getSupabaseClient } from '../lib/supabase';

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

function withTimeout<T>(promise: Promise<T>, ms: number = 2500): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export function getStoredProducts(): Product[] {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    if (!data) return DEMO_PRODUCTS;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_PRODUCTS;
  } catch (err) {
    console.error('Error reading products:', err);
    return DEMO_PRODUCTS;
  }
}

export async function saveStoredProducts(products: Product[]): Promise<boolean> {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving products locally:', err);
  }

  // Sync to Supabase FIRST (Unblocked in Iran, no VPN needed)
  const supabase = getSupabaseClient();
  if (supabase && products.length > 0) {
    (async () => {
      try {
        await supabase
          .from('products')
          .upsert(products.map((p) => ({ id: p.id, data: p, updated_at: new Date().toISOString() })));
      } catch (sbErr) {
        console.warn('Supabase products sync error:', sbErr);
      }
    })();
  }

  // Sync to Server API
  fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ products }),
  }).catch(() => {});

  // Non-blocking background Firestore save (never hangs if Google is filtered without VPN)
  (async () => {
    try {
      const existingSnap = await withTimeout(getDocs(collection(db, 'products')), 2500);
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
    } catch (err) {
      for (const p of products) {
        try {
          await setDoc(doc(db, 'products', p.id), cleanForFirestore(p));
        } catch (e) {}
      }
    }
  })();

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

// Helper to merge order lists seamlessly without losing any order across devices
export function mergeOrdersList(...lists: Order[][]): Order[] {
  const map = new Map<string, Order>();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const order of list) {
      if (!order || !order.id) continue;
      const existing = map.get(order.id);
      if (!existing) {
        map.set(order.id, order);
      } else {
        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const newTime = new Date(order.updatedAt || order.createdAt || 0).getTime();
        if (newTime >= existingTime) {
          map.set(order.id, { ...existing, ...order });
        } else {
          map.set(order.id, { ...order, ...existing });
        }
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

// Pending offline/hybrid sync queue
const PENDING_ORDERS_KEY = 'pending_sync_orders';

export function enqueuePendingOrders(orders: Order[]) {
  try {
    const existingStr = localStorage.getItem(PENDING_ORDERS_KEY);
    const existing: Order[] = existingStr ? JSON.parse(existingStr) : [];
    const merged = mergeOrdersList(existing, orders);
    localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(merged));
  } catch (e) {}
}

export async function processPendingSyncQueue() {
  try {
    const pendingStr = localStorage.getItem(PENDING_ORDERS_KEY);
    if (!pendingStr) return;
    const pendingOrders: Order[] = JSON.parse(pendingStr);
    if (!Array.isArray(pendingOrders) || pendingOrders.length === 0) return;

    let synced = false;

    // 1. Try Supabase (100% unblocked in Iran, no VPN needed)
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('orders').upsert(
          pendingOrders.map((o) => ({ id: o.id, data: o, updated_at: new Date().toISOString() }))
        );
        if (!error) synced = true;
      } catch (e) {}
    }

    // 2. Try Server API
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: pendingOrders }),
      });
      if (res.ok) synced = true;
    } catch (e) {}

    // 3. Try Firestore if accessible
    try {
      for (const o of pendingOrders) {
        await setDoc(doc(db, 'orders', o.id), cleanForFirestore(o));
      }
      synced = true;
    } catch (e) {}

    if (synced) {
      localStorage.removeItem(PENDING_ORDERS_KEY);
      console.log('Pending orders successfully synced in background!');
    }
  } catch (e) {}
}

export async function saveStoredOrders(orders: Order[]): Promise<boolean> {
  // 1. Synchronous immediate local storage update (0ms delay for user UI)
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders locally:', err);
  }

  // 2. Immediate Supabase sync (Unblocked in Iran, no VPN needed)
  const supabase = getSupabaseClient();
  if (supabase && orders.length > 0) {
    (async () => {
      try {
        const { error } = await supabase
          .from('orders')
          .upsert(orders.map((o) => ({ id: o.id, data: o, updated_at: new Date().toISOString() })));
        if (error) {
          console.warn('Supabase order save warning:', error);
          enqueuePendingOrders(orders);
        }
      } catch (err) {
        console.warn('Supabase order save network error:', err);
        enqueuePendingOrders(orders);
      }
    })();
  }

  // 3. Immediate Server API sync (/api/orders)
  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orders }),
  }).catch(() => {
    enqueuePendingOrders(orders);
  });

  // 4. Non-blocking background Firestore sync (never freezes if Google is filtered without VPN)
  (async () => {
    try {
      const existingSnap = await withTimeout(getDocs(collection(db, 'orders')), 2500);
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
      for (const o of orders) {
        try {
          await setDoc(doc(db, 'orders', o.id), cleanForFirestore(o));
        } catch (e) {}
      }
    }
  })();

  return true;
}

export async function saveSingleOrder(order: Order): Promise<boolean> {
  let savedLocal = false;

  // 1. Save to local storage instantly (0ms)
  try {
    const existing = getStoredOrders();
    const updated = mergeOrdersList([order], existing);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    savedLocal = true;
  } catch (err) {
    console.error('Error saving order to localStorage:', err);
  }

  const cleanOrder = cleanForFirestore(order);

  // 2. Fire Server API, Firestore, and Supabase ALL IN PARALLEL!
  const apiPromise = fetch('/api/orders/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order: cleanOrder }),
  })
    .then((res) => res.ok)
    .catch(() => false);

  const firestorePromise = setDoc(doc(db, 'orders', order.id), cleanOrder)
    .then(() => true)
    .catch(() => false);

  const supabase = getSupabaseClient();
  const supabasePromise = supabase
    ? Promise.resolve(
        supabase
          .from('orders')
          .upsert([{ id: order.id, data: cleanOrder, updated_at: new Date().toISOString() }])
      )
        .then(({ error }) => !error)
        .catch(() => false)
    : Promise.resolve(false);

  let savedRemote = false;
  try {
    const results = await withTimeout(
      Promise.allSettled([apiPromise, firestorePromise, supabasePromise]),
      3500
    );
    if (results && Array.isArray(results)) {
      savedRemote = results.some((r) => r.status === 'fulfilled' && r.value === true);
    }
  } catch (e) {
    console.warn('Remote order save timeout notice:', e);
  }

  if (!savedRemote) {
    enqueuePendingOrders([order]);
  }

  return savedLocal || savedRemote;
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
    console.error('Error saving settings locally:', err);
  }

  // Sync to Supabase FIRST (Unblocked in Iran, no VPN needed)
  const supabase = getSupabaseClient();
  if (supabase) {
    (async () => {
      try {
        await supabase
          .from('store_settings')
          .upsert({ id: 'main', data: settings, updated_at: new Date().toISOString() });
      } catch (sbErr) {
        console.warn('Supabase settings sync error:', sbErr);
      }
    })();
  }

  // Sync to Server API
  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings }),
  }).catch(() => {});

  // Background non-blocking Firestore sync
  setDoc(doc(db, 'settings', 'store_settings'), cleanForFirestore(settings)).catch(() => {});

  return true;
}

export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  // Delete from Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (sbErr) {}
  }

  // Delete from backend server API (works everywhere without VPN)
  fetch('/api/products/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  }).catch(() => {});

  // Also attempt Firestore delete in background
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    console.warn('Firestore delete product background error:', err);
  }
  return true;
}

export async function deleteOrderFromFirestore(orderId: string): Promise<boolean> {
  // Delete from Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('orders').delete().eq('id', orderId);
    } catch (sbErr) {}
  }

  // Delete from backend server API (works everywhere without VPN)
  fetch('/api/orders/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  }).catch(() => {});

  // Also attempt Firestore delete in background
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (err) {
    console.warn('Firestore delete order background error:', err);
  }
  return true;
}

// Fetch all shared data from server API, Supabase, or Firestore and merge seamlessly
export async function fetchServerData(): Promise<{ products: Product[]; orders: Order[]; settings: StoreSettings }> {
  // Process any pending offline/network retry queue first
  processPendingSyncQueue();

  const localProducts = getStoredProducts();
  const localOrders = getStoredOrders();
  const localSettings = getStoredSettings();

  // Task 1: Server API
  const apiTask = (async () => {
    try {
      const res = await fetch('/api/data?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Server API fetch notice:', e);
    }
    return null;
  })();

  // Task 2: Supabase
  const supabaseTask = (async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    try {
      const [pRes, oRes, sRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('store_settings').select('*').eq('id', 'main').maybeSingle()
      ]);

      const products = pRes && !pRes.error && pRes.data ? pRes.data.map((r: any) => r.data || r) : [];
      const orders = oRes && !oRes.error && oRes.data ? oRes.data.map((r: any) => r.data || r) : [];
      const settings = sRes && !sRes.error && sRes.data ? (sRes.data.data || sRes.data) : null;

      return { products, orders, settings };
    } catch (e) {
      console.warn('Supabase fetch notice:', e);
    }
    return null;
  })();

  // Task 3: Firestore
  const firestoreTask = (async () => {
    try {
      const [ordersSnap, productsSnap, settingsDoc] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'products')),
        getDoc(doc(db, 'settings', 'store_settings'))
      ]);

      const orders: Order[] = [];
      ordersSnap.forEach((docSnap) => {
        if (docSnap.exists()) orders.push(docSnap.data() as Order);
      });

      const products: Product[] = [];
      productsSnap.forEach((docSnap) => {
        if (docSnap.exists()) products.push(docSnap.data() as Product);
      });

      const settings = settingsDoc.exists() ? ({ ...DEFAULT_SETTINGS, ...settingsDoc.data() } as StoreSettings) : null;

      return { products, orders, settings };
    } catch (e) {
      console.warn('Firestore fetch notice:', e);
    }
    return null;
  })();

  // Run all 3 tasks in parallel with a 6-second timeout
  let allRemoteOrders: Order[] = [];
  let allRemoteProducts: Product[] = [];
  let mergedSettings: StoreSettings = localSettings;

  try {
    const results = await withTimeout(
      Promise.allSettled([apiTask, supabaseTask, firestoreTask]),
      6000
    );

    if (results && Array.isArray(results)) {
      for (const res of results) {
        if (res.status === 'fulfilled' && res.value) {
          const val = res.value;
          if (Array.isArray(val.orders) && val.orders.length > 0) {
            allRemoteOrders = mergeOrdersList(allRemoteOrders, val.orders);
          }
          if (Array.isArray(val.products) && val.products.length > 0) {
            allRemoteProducts = val.products;
          }
          if (val.settings) {
            mergedSettings = { ...mergedSettings, ...val.settings };
          }
        }
      }
    }
  } catch (e) {
    console.warn('Parallel data fetch timeout notice:', e);
  }

  // Combine local storage + all remote sources so no order is EVER missed!
  const finalOrders = mergeOrdersList(localOrders, allRemoteOrders);
  const finalProducts = allRemoteProducts.length > 0 ? allRemoteProducts : localProducts;
  const finalSettings = mergedSettings;

  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(finalProducts));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(finalOrders));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(finalSettings));
  } catch (e) {}

  return {
    products: finalProducts,
    orders: finalOrders,
    settings: finalSettings,
  };
}

// Live real-time subscription for instant multi-device syncing with or without VPN
export function subscribeToFirestore(
  onDataUpdate: (data: { products?: Product[]; orders?: Order[]; settings?: StoreSettings }) => void,
  onError?: (errMessage: string) => void
) {
  let lastStateHash = '';

  // 1. Firestore Real-Time Snapshot Listener for Instant Push Updates (for VPN or unblocked network)
  let unsubOrders: (() => void) | null = null;
  let unsubProducts: (() => void) | null = null;
  let unsubSettings: (() => void) | null = null;

  try {
    unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const fsOrders: Order[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          fsOrders.push(docSnap.data() as Order);
        }
      });
      if (fsOrders.length > 0) {
        const localOrders = getStoredOrders();
        const merged = mergeOrdersList(localOrders, fsOrders);
        try {
          localStorage.setItem(ORDERS_KEY, JSON.stringify(merged));
        } catch (e) {}
        onDataUpdate({ orders: merged });
      }
    }, (err) => {
      console.warn('Firestore orders snapshot notice:', err);
    });
  } catch (e) {
    console.warn('Firestore orders setup notice:', e);
  }

  try {
    unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const fsProducts: Product[] = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.exists()) {
          fsProducts.push(docSnap.data() as Product);
        }
      });
      if (fsProducts.length > 0) {
        try {
          localStorage.setItem(PRODUCTS_KEY, JSON.stringify(fsProducts));
        } catch (e) {}
        onDataUpdate({ products: fsProducts });
      }
    }, (err) => {
      console.warn('Firestore products snapshot notice:', err);
    });
  } catch (e) {
    console.warn('Firestore products setup notice:', e);
  }

  try {
    unsubSettings = onSnapshot(doc(db, 'settings', 'store_settings'), (docSnap) => {
      if (docSnap.exists()) {
        const fsSettings = { ...DEFAULT_SETTINGS, ...docSnap.data() } as StoreSettings;
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(fsSettings));
        } catch (e) {}
        onDataUpdate({ settings: fsSettings });
      }
    }, (err) => {
      console.warn('Firestore settings snapshot notice:', err);
    });
  } catch (e) {
    console.warn('Firestore settings setup notice:', e);
  }

  // 2. Supabase Realtime Subscription if configured
  const supabase = getSupabaseClient();
  let supabaseChannel: any = null;

  if (supabase) {
    try {
      supabaseChannel = supabase
        .channel('public-store-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, async () => {
          const freshData = await fetchServerData();
          if (freshData) {
            onDataUpdate(freshData);
          }
        })
        .subscribe();
    } catch (sbRealtimeErr) {
      console.warn('Supabase realtime channel error:', sbRealtimeErr);
    }
  }

  // 3. Fast 3-second Same-Origin Polling for Non-VPN / Iranian ISP users
  const pollServer = async () => {
    try {
      const serverData = await fetchServerData();
      if (serverData) {
        const currentHash = JSON.stringify({
          pCount: serverData.products.length,
          pMod: serverData.products.map(p => `${p.id}_${p.stock}_${p.price}_${p.title}`).join('|'),
          oCount: serverData.orders.length,
          oMod: serverData.orders.map(o => `${o.id}_${o.status}_${o.createdAt}`).join('|'),
          sMod: JSON.stringify(serverData.settings.categories)
        });

        if (currentHash !== lastStateHash) {
          lastStateHash = currentHash;
          onDataUpdate(serverData);
        }
      }
    } catch (e) {}
  };

  pollServer();
  const intervalId = setInterval(pollServer, 3000);

  const handleFocus = () => {
    pollServer();
  };
  window.addEventListener('focus', handleFocus);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener('focus', handleFocus);
    if (unsubOrders) unsubOrders();
    if (unsubProducts) unsubProducts();
    if (unsubSettings) unsubSettings();
    if (supabaseChannel && supabase) {
      try {
        supabase.removeChannel(supabaseChannel);
      } catch (e) {}
    }
  };
}

// Convert and compress image File object to Base64 string (Max 750px, 0.70 JPEG quality for fast upload)
export function fileToBase64(file: File, maxWidth = 750, quality = 0.70): Promise<string> {
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

