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
  let savedServer = false;

  // 1. Save to local storage instantly (0ms)
  try {
    const existing = getStoredOrders();
    const updated = mergeOrdersList([order], existing);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    savedLocal = true;
  } catch (err) {
    console.error('Error saving order to localStorage:', err);
  }

  // 2. Parallel sync to Node server API (/api/orders/new), Supabase (unblocked in Iran), and Firestore
  const syncPromises: Promise<boolean>[] = [];

  // A. Same-origin server API
  syncPromises.push(
    fetch('/api/orders/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    })
      .then((res) => res.ok)
      .catch(() => false)
  );

  // B. Supabase (unblocked in Iran, no VPN needed)
  const supabase = getSupabaseClient();
  if (supabase) {
    syncPromises.push(
      (async () => {
        try {
          const { error } = await supabase
            .from('orders')
            .upsert([{ id: order.id, data: order, updated_at: new Date().toISOString() }]);
          return !error;
        } catch (e) {
          return false;
        }
      })()
    );
  }

  // C. Firebase Firestore
  syncPromises.push(
    setDoc(doc(db, 'orders', order.id), cleanForFirestore(order))
      .then(() => true)
      .catch(() => false)
  );

  try {
    const results = await withTimeout(Promise.allSettled(syncPromises), 2000);
    if (results && Array.isArray(results)) {
      savedServer = results.some((r) => r.status === 'fulfilled' && r.value === true);
    }
  } catch (e) {
    console.warn('Sync promise timeout/notice:', e);
  }

  if (!savedServer) {
    enqueuePendingOrders([order]);
  }

  return savedLocal || savedServer;
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

  let fetchedProducts: Product[] = [];
  let fetchedOrders: Order[] = [];
  let fetchedSettings: StoreSettings = localSettings;

  // 1. Try local Server API FIRST with a fast 1s timeout (100% unblocked in Iran, same-origin, no VPN needed)
  try {
    const apiPromise = fetch('/api/data?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null);
    const data = await withTimeout(apiPromise, 1000);
    if (data) {
      if (Array.isArray(data.products) && data.products.length > 0) {
        fetchedProducts = data.products;
      }
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        fetchedOrders = mergeOrdersList(fetchedOrders, data.orders);
      }
      if (data.settings) {
        fetchedSettings = { ...localSettings, ...data.settings };
      }
    }
  } catch (e) {
    console.warn('Server API fetch failed or timed out:', e);
  }

  // 2. Query Supabase for orders & products (100% unblocked in Iran, shared globally)
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const sbPromise = Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('store_settings').select('*').eq('id', 'main').maybeSingle()
      ]);

      const [pRes, oRes, sRes] = await withTimeout(sbPromise, 1200);

      if (pRes && !pRes.error && pRes.data && pRes.data.length > 0) {
        if (fetchedProducts.length === 0) {
          fetchedProducts = pRes.data.map((row: any) => row.data || row);
        }
      }
      if (oRes && !oRes.error && oRes.data && oRes.data.length > 0) {
        const sbOrders = oRes.data.map((row: any) => row.data || row);
        fetchedOrders = mergeOrdersList(fetchedOrders, sbOrders);
      }
      if (sRes && !sRes.error && sRes.data) {
        fetchedSettings = { ...fetchedSettings, ...(sRes.data.data || sRes.data) };
      }
    } catch (sbErr) {
      console.warn('Supabase fetch notice:', sbErr);
    }
  }

  // 3. Query Firestore for orders & products
  try {
    const fsPromise = (async () => {
      const settingsDoc = await getDoc(doc(db, 'settings', 'store_settings'));
      let settings: StoreSettings = localSettings;
      if (settingsDoc.exists()) {
        settings = { ...DEFAULT_SETTINGS, ...settingsDoc.data() } as StoreSettings;
      }

      const productsSnap = await getDocs(collection(db, 'products'));
      let products: Product[] = [];
      productsSnap.forEach((docSnap) => {
        products.push(docSnap.data() as Product);
      });

      const ordersSnap = await getDocs(collection(db, 'orders'));
      let orders: Order[] = [];
      ordersSnap.forEach((docSnap) => {
        orders.push(docSnap.data() as Order);
      });

      return { products, orders, settings };
    })();

    const fsData = await withTimeout(fsPromise, 1000);
    if (fsData) {
      if (fetchedProducts.length === 0 && fsData.products.length > 0) {
        fetchedProducts = fsData.products;
      }
      if (fsData.orders.length > 0) {
        fetchedOrders = mergeOrdersList(fetchedOrders, fsData.orders);
      }
    }
  } catch (err) {
    console.warn('Firestore fetch notice:', err);
  }

  // Combine ALL order sources so no order placed with or without VPN is ever lost!
  const finalOrders = mergeOrdersList(localOrders, fetchedOrders);
  const finalProducts = fetchedProducts.length > 0 ? fetchedProducts : localProducts;
  const finalSettings = fetchedSettings || localSettings;

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

// Live real-time subscription for instant multi-device syncing without VPN requirements
export function subscribeToFirestore(
  onDataUpdate: (data: { products?: Product[]; orders?: Order[]; settings?: StoreSettings }) => void,
  onError?: (errMessage: string) => void
) {
  let lastStateHash = '';

  // 1. Supabase Realtime Subscription if configured
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

  // Poll server API / local data every 8 seconds (unblocked on all Iranian ISPs, lightweight)
  const pollServer = async () => {
    try {
      const serverData = await fetchServerData();
      if (serverData) {
        const currentHash = JSON.stringify({
          pCount: serverData.products.length,
          pMod: serverData.products.map(p => `${p.id}_${p.stock}_${p.price}_${p.title}`).join('|'),
          oCount: serverData.orders.length,
          oMod: serverData.orders.map(o => `${o.id}_${o.status}`).join('|'),
          sMod: JSON.stringify(serverData.settings.categories)
        });

        if (currentHash !== lastStateHash) {
          lastStateHash = currentHash;
          onDataUpdate(serverData);
        }
      }
    } catch (e) {}
  };

  // Poll on tab focus & periodically every 8s
  pollServer();
  const intervalId = setInterval(pollServer, 8000);

  const handleFocus = () => {
    pollServer();
  };
  window.addEventListener('focus', handleFocus);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener('focus', handleFocus);
    if (supabaseChannel && supabase) {
      try {
        supabase.removeChannel(supabaseChannel);
      } catch (e) {}
    }
  };
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

