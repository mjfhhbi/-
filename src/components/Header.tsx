import React, { useState } from 'react';
import { 
  Glasses, 
  ShoppingBag, 
  Settings, 
  Store, 
  Copy, 
  Check, 
  Search, 
  Sparkles,
  Link2,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Truck,
  UserCheck
} from 'lucide-react';
import { CategoryType, StoreSettings } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/storage';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentView: 'store' | 'admin';
  onViewChange: (view: 'store' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTrackerModal?: () => void;
  onOpenSupportModal?: () => void;
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  settings: StoreSettings;
  onShowToast: (msg: string) => void;
  isAdminAuthenticated?: boolean;
  onAdminLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  cartCount,
  onOpenCart,
  onOpenTrackerModal,
  onOpenSupportModal,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  settings,
  onShowToast,
  isAdminAuthenticated,
  onAdminLogout,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState<'dev' | 'store' | 'admin' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeCategories = settings?.categories && settings.categories.length > 0 
    ? settings.categories 
    : DEFAULT_CATEGORIES;

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'همه عینک‌ها' },
    ...activeCategories,
  ];

  const getDevUrl = () => {
    return window.location.origin;
  };

  const getStoreUrl = () => {
    let origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      origin = origin.replace('ais-dev-', 'ais-pre-');
    }
    return origin;
  };

  const getAdminUrl = () => {
    let origin = window.location.origin;
    return `${origin}?view=admin`;
  };

  const copyToClipboard = (type: 'dev' | 'store' | 'admin') => {
    let url = getStoreUrl();
    if (type === 'dev') url = getDevUrl();
    if (type === 'admin') url = getAdminUrl();
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).catch(() => {
        fallbackCopyTextToClipboard(url);
      });
    } else {
      fallbackCopyTextToClipboard(url);
    }

    setCopiedLink(type);
    onShowToast(type === 'dev' ? 'لینک توسعه کپی شد' : type === 'store' ? 'لینک عمومی فروشگاه کپی شد' : 'لینک پنل مدیریت کپی شد');
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const shareNative = async (type: 'store' | 'admin') => {
    const url = type === 'store' ? getStoreUrl() : getAdminUrl();
    const title = type === 'store' ? settings.storeName : `پنل مدیریت - ${settings.storeName}`;
    const text = type === 'store' ? 'لینک مشاهده محصولات و ثبت سفارش عینک' : 'لینک مدیریت فروشگاه عینک';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        console.log('Share canceled or failed', e);
      }
    }
    // Fallback: Copy to clipboard
    copyToClipboard(type);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      {/* Top Announcement & Quick Action Bar */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-b border-amber-500/20 py-1.5 px-3 sm:px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-amber-300 font-medium overflow-hidden whitespace-nowrap text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-400" />
            <span className="truncate">{settings.tagline}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onViewChange(currentView === 'store' ? 'admin' : 'store')}
              className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] transition-colors border border-zinc-700"
            >
              {currentView === 'store' ? (
                <>
                  <Settings className="w-3 h-3 text-amber-400" />
                  <span>پنل مدیریت</span>
                </>
              ) : (
                <>
                  <Store className="w-3 h-3 text-emerald-400" />
                  <span>ویترین فروشگاه</span>
                </>
              )}
            </button>

            {isAdminAuthenticated && onAdminLogout && (
              <button
                onClick={onAdminLogout}
                className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] transition-colors"
                title="خروج از حساب ادمین"
              >
                <span>خروج ادمین</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button 
              onClick={() => { onViewChange('store'); onSelectCategory('all'); }} 
              className="flex items-center gap-2 sm:gap-3 group text-right focus:outline-none"
            >
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                <Glasses className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3 sm:h-3.5 sm:w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-zinc-950">
                  <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-white"></span>
                </span>
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span className="hidden xs:inline">فروشگاه</span>
                  <span className="text-amber-400 font-mono tracking-wider">{settings.storeName}</span>
                </h1>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 font-light hidden xs:block">ارائه‌دهنده عینک‌های اورجینال استوک</p>
              </div>
            </button>
          </div>

          {/* Center Search Input (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="جستجو بر اساس نام عینک، جنس فریم، رنگ عدسی یا برند..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-800 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Customer Order Tracker Button */}
            {onOpenTrackerModal && (
              <button
                onClick={onOpenTrackerModal}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-colors"
                title="پیگیری سفارش و دریافت کد پستی"
              >
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden lg:inline">پیگیری سفارشات / ورود خریدار</span>
                <span className="hidden sm:inline lg:hidden text-[11px]">پیگیری</span>
              </button>
            )}

            {/* View Switch Pill (Desktop/Tablet) */}
            <div className="hidden sm:flex bg-zinc-900 p-1 rounded-xl border border-zinc-800/80">
              <button
                onClick={() => onViewChange('store')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentView === 'store'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>فروشگاه</span>
              </button>
              <button
                onClick={() => onViewChange('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentView === 'admin'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>پنل مدیریت</span>
              </button>
            </div>

            {/* Shopping Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/15"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">سبد خرید</span>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-zinc-950 text-amber-400 text-[11px] sm:text-xs font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-400/30"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl"
              aria-label="منوی موبایل"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجو عینک، جنس، رنگ عدسی..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Mobile Menu Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden mt-3 pt-3 border-t border-zinc-800/80 space-y-2 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onViewChange('store'); setMobileMenuOpen(false); }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    currentView === 'store'
                      ? 'bg-amber-500 text-zinc-950 border-amber-500'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>ویترین فروشگاه</span>
                </button>

                <button
                  onClick={() => { onViewChange('admin'); setMobileMenuOpen(false); }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    currentView === 'admin'
                      ? 'bg-amber-500 text-zinc-950 border-amber-500'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>پنل مدیریت</span>
                </button>
              </div>

              {onOpenTrackerModal && (
                <button
                  onClick={() => { onOpenTrackerModal(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between bg-zinc-900 hover:bg-zinc-850 text-amber-400 border border-amber-500/30 p-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>پیگیری سفارشات و کد رهگیری پستی</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">ورود خریدار</span>
                </button>
              )}

              <button
                onClick={() => { setShowShareModal(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between bg-zinc-900 text-sky-400 border border-zinc-800 p-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  <span>لینک‌های اختصاصی و آدرس عمومی</span>
                </div>
                <span className="text-[10px] bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">کپی لینک</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Navbar Bar (Only shown in Store View) */}
        {currentView === 'store' && (
          <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`relative shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-medium transition-colors ${
                    isSelected
                      ? 'text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/50'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-zinc-100 rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

    </header>
  );
};
