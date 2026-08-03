import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// CORS middleware for all devices & webviews
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Support large payloads (for base64 product images)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const DEFAULT_SETTINGS = {
  storeName: "stock_jahani",
  tagline: "فروشگاه تخصصی عینک‌های آفتابی و طبی استوک اورجینال",
  bannerMessage: "✨ ارسال با پست پیشتاز به سراسر کشور | تضمین سلامت فریم و عدسی",
  welcomeText: "تجربه‌ای متفاوت از کیفیت و استایل با عینک استوک جهانی",
  welcomeSubtext: "مجموعه کامل عینک‌های آفتابی و طبی اورجینال، فریم‌های استوک کائوچویی و فلزی ساخت اروپا با عدسی‌های پلاریزه و استاندارد کامل UV400.",
  noticeText: "💡 خریداران گرامی: پس از ثبت سفارش، کد ۲۴ رقمی رهگیری پستی به همراه وضعیت خریدهای شما در بخش «پیگیری سفارشات» قرار خواهد گرفت.",
  aboutText: "فروشگاه عینک استوک جهانی عرضه کننده مستقیم جدیدترین فریم‌های طبی و آفتابی استوک اورجینال اروپا با بالاترین کیفیت و نازل‌ترین قیمت.",
  rulesText: "تمامی بسته‌ها در هاردکیس مقاوم ضدضربه با پُست پیشتاز ارسال شده و کد رهگیری مرسوله پستی پس از ارسال در همین سایت نمایش داده می‌شود.",
  categories: [
    { id: 'sunglasses', label: 'عینک آفتابی' },
    { id: 'optical', label: 'عینک طبی' },
    { id: 'sport', label: 'ورزشی و اسپرت' },
    { id: 'unisex', label: 'یونی‌سکس' },
    { id: 'accessories', label: 'لوازم جانبی' },
  ],
  instagram: "stock_jahani",
  phone: "09120000000",
  address: "تهران، خیابان ولیعصر، مرکز خرید عینک استوک جهانی",
  freeShippingThreshold: 0,
  adminPasscode: "1383",
  cardNumber: "6037-9975-1234-5678",
  cardHolderName: "بهنام جهانی"
};

const DEFAULT_PRODUCTS = [
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

function getWritableDataFilePath(): string {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const testFile = path.join(DATA_DIR, ".write_test");
    fs.writeFileSync(testFile, "test");
    fs.unlinkSync(testFile);
    return DATA_FILE;
  } catch (e) {
    // Fallback to OS tmp folder if project directory is read-only
    return path.join(require("os").tmpdir(), "stock_jahani_store.json");
  }
}

function readData() {
  const filePath = getWritableDataFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      return {
        products: Array.isArray(parsed.products) ? parsed.products : DEFAULT_PRODUCTS,
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
      };
    }
  } catch (err) {
    console.error("Error reading store file:", err);
  }
  return { products: DEFAULT_PRODUCTS, orders: [], settings: DEFAULT_SETTINGS };
}

function writeData(data: any) {
  const filePath = getWritableDataFilePath();
  try {
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing store file:", err);
  }
}

// API Endpoints
app.get("/api/data", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const data = readData();
  res.json(data);
});

app.post("/api/products", (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "Invalid products" });
  }
  const current = readData();
  current.products = products;
  writeData(current);
  res.json({ success: true, count: products.length });
});

app.post("/api/orders", (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders)) {
    return res.status(400).json({ error: "Invalid orders" });
  }
  const current = readData();
  current.orders = orders;
  writeData(current);
  res.json({ success: true, count: orders.length });
});

app.post("/api/orders/new", (req, res) => {
  const { order } = req.body;
  if (!order || !order.id) {
    return res.status(400).json({ error: "Invalid order data" });
  }
  const current = readData();
  current.orders = [order, ...current.orders.filter((o: any) => o.id !== order.id)];
  writeData(current);
  res.json({ success: true, order });
});

app.post("/api/settings", (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== "object") {
    return res.status(400).json({ error: "Invalid settings" });
  }
  const current = readData();
  current.settings = { ...current.settings, ...settings };
  writeData(current);
  res.json({ success: true, settings: current.settings });
});

app.post("/api/sync-all", (req, res) => {
  const { products, orders, settings } = req.body;
  const current = readData();
  if (Array.isArray(products)) current.products = products;
  if (Array.isArray(orders)) current.orders = orders;
  if (settings && typeof settings === "object") current.settings = { ...current.settings, ...settings };
  writeData(current);
  res.json({ success: true, data: current });
});

app.post("/api/products/delete", (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: "productId is required" });
  }
  const current = readData();
  current.products = current.products.filter((p: any) => p.id !== productId);
  writeData(current);
  res.json({ success: true, count: current.products.length });
});

app.post("/api/orders/delete", (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "orderId is required" });
  }
  const current = readData();
  current.orders = current.orders.filter((o: any) => o.id !== orderId);
  writeData(current);
  res.json({ success: true, count: current.orders.length });
});

export default app;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
