import React, { useState } from 'react';
import { Order, StoreSettings } from '../types';
import { formatToman } from '../utils/storage';
import { X, Glasses, FileText, Check, Printer, ShieldCheck, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InvoiceModalProps {
  order: Order | null;
  settings?: StoreSettings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, settings, onClose }) => {
  const [copiedText, setCopiedText] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyInvoiceDetails = () => {
    const itemsText = order.items
      .map((i) => `• ${i.product.title} (${i.quantity} عدد) - ${formatToman(i.product.price * i.quantity)}`)
      .join('\n');
    const text = `🧾 فاکتور دیجیتال رسمی ${settings?.storeName || 'استوک جهانی'}\nشماره فاکتور: ${order.orderCode}\nتاریخ: ${new Date(order.createdAt).toLocaleDateString('fa-IR')}\nخریدار: ${order.customer.fullName} (${order.customer.phone})\nآدرس: ${order.customer.province} - ${order.customer.city} - ${order.customer.address}\nکدپستی: ${order.customer.postalCode}\n\nمحصولات:\n${itemsText}\n\nمبلغ کل: ${formatToman(order.finalAmount)}\nوضعیت: ${order.status === 'confirmed' ? 'تایید شده' : order.status === 'shipping' ? 'ارسال شده با پست' : 'در حال بررسی'}`;
    
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'در حال بررسی و تایید واریز';
      case 'confirmed':
        return 'تایید شده و آماده بسته‌بندی';
      case 'shipping':
        return 'تحویل پست شده (کد رهگیری دارد)';
      case 'delivered':
        return 'تحویل داده شده به مشتری';
      case 'cancelled':
        return 'لغو شده';
      default:
        return 'نامشخص';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto text-right dir-rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl overflow-hidden my-auto space-y-5"
        >
          {/* Action Header Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">فاکتور و رسید دیجیتال خرید</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyInvoiceDetails}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copiedText ? 'کپی شد' : 'کپی خلاصه فاکتور'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>چاپ یا دانلود PDF</span>
              </button>

              <button
                onClick={onClose}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-1.5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div id="printable-invoice" className="bg-white text-zinc-900 p-6 rounded-xl border border-zinc-200 space-y-5 font-sans print:p-0 print:border-none relative">
            
            {/* Stamp Overlay */}
            <div className="absolute top-10 left-10 pointer-events-none opacity-20 transform -rotate-12 border-4 border-emerald-600 rounded-full p-3 text-center text-emerald-700 font-black text-xs hidden sm:block">
              <ShieldCheck className="w-8 h-8 mx-auto" />
              <span>تأیید شده دیجیتال</span>
              <span className="block text-[9px]">{settings?.storeName || 'استوک جهانی'}</span>
            </div>

            {/* Invoice Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-300 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500 text-zinc-950 rounded-xl flex items-center justify-center font-bold">
                  <Glasses className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-900">{settings?.storeName || 'فروشگاه عینک استوک جهانی'}</h2>
                  <p className="text-xs text-zinc-600 mt-0.5">مرکز تخصصی فروش عینک‌های اورجینال، برند و استوک اروپایی</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 dir-ltr text-right">تلفن تماس: {settings?.phone || '09120000000'}</p>
                </div>
              </div>

              <div className="text-left bg-zinc-100 p-3 rounded-xl border border-zinc-200 text-xs space-y-1 w-full sm:w-auto">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">شماره فاکتور:</span>
                  <span className="font-bold text-zinc-900 font-mono dir-ltr">{order.orderCode}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">تاریخ ثبت:</span>
                  <span className="font-medium text-zinc-800">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">وضعیت:</span>
                  <span className="font-bold text-amber-700">{getStatusLabel(order.status)}</span>
                </div>
              </div>
            </div>

            {/* Buyer Info */}
            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="text-zinc-500 block text-[11px]">خریدار / تحویل‌گیرنده:</span>
                <span className="font-bold text-zinc-900 text-sm block mt-0.5">{order.customer.fullName}</span>
                <span className="text-zinc-600 font-mono dir-ltr text-right block mt-0.5">{order.customer.phone}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[11px]">آدرس پستی و کد پستی:</span>
                <span className="font-medium text-zinc-800 block mt-0.5">
                  {order.customer.province}، {order.customer.city}، {order.customer.address}
                </span>
                <span className="text-zinc-600 font-mono block mt-0.5">
                  کد پستی ۱۰ رقمی: {order.customer.postalCode}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <table className="w-full text-xs text-right border-collapse">
                <thead>
                  <tr className="bg-zinc-200 text-zinc-800 border-b border-zinc-300">
                    <th className="py-2.5 px-3 font-bold rounded-r-lg">#</th>
                    <th className="py-2.5 px-3 font-bold">شرح کالا / عینک</th>
                    <th className="py-2.5 px-3 font-bold text-center">تعداد</th>
                    <th className="py-2.5 px-3 font-bold text-left">قیمت واحد</th>
                    <th className="py-2.5 px-3 font-bold text-left rounded-l-lg">قیمت کل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="py-2.5 px-3 font-mono text-zinc-500">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-zinc-900 block">{item.product.title}</span>
                        {item.product.code && <span className="text-[10px] text-zinc-500 block">کد کالا: {item.product.code}</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-left font-mono">{formatToman(item.product.price)}</td>
                      <td className="py-2.5 px-3 text-left font-bold font-mono">{formatToman(item.product.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Summary */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-zinc-300">
              <div className="text-xs text-zinc-600 space-y-1 w-full sm:w-auto">
                <div>روش پرداخت: <span className="font-bold text-zinc-800">{order.paymentMethod === 'card_to_card' ? 'کارت به کارت' : 'واریز آنلاین / شبا'}</span></div>
                <div>روش ارسال: <span className="font-bold text-zinc-800">پست پیشتاز (پس‌کرایه)</span></div>
                {order.postalTrackingCode && (
                  <div>کد مرسوله پستی: <span className="font-bold font-mono text-amber-700">{order.postalTrackingCode}</span></div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-left w-full sm:w-64 space-y-1">
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>جمع کل کالاهـا:</span>
                  <span className="font-mono">{formatToman(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>هزینه ارسال:</span>
                  <span>رایگان / پس‌کرایه</span>
                </div>
                <div className="flex justify-between text-sm font-black text-zinc-900 pt-2 border-t border-amber-200">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-amber-800 font-mono">{formatToman(order.finalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-[11px] text-zinc-500 pt-4 border-t border-zinc-200">
              با تشکر از خرید شما از فروشگاه عینک استوک جهانی - تمامی عینک‌ها قبل از ارسال تست سلامت و تمیزی کامل می‌شوند.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

