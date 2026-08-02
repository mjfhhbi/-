import React, { useState } from 'react';
import { Product } from '../types';
import { formatToman } from '../utils/storage';
import { ShoppingBag, Eye, Edit, Trash2, Shield, Glasses, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  isAdmin?: boolean;
  onEditProduct?: (p: Product) => void;
  onDeleteProduct?: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  isAdmin = false,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const hasImages = product.images && product.images.length > 0;
  const currentImg = hasImages ? product.images[currentImgIndex] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const calculateDiscount = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      const diff = product.originalPrice - product.price;
      return Math.round((diff / product.originalPrice) * 100);
    }
    return 0;
  };

  const discountPercent = calculateDiscount();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelectProduct(product)}
      className="group relative bg-zinc-900/90 border border-zinc-800/90 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg transition-colors duration-300 flex flex-col cursor-pointer"
    >
      {/* Top Image Preview Container */}
      <div className="relative aspect-[4/3] w-full bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-zinc-800/60">
        {currentImg ? (
          <img
            src={currentImg}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // fallback image handler
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-600 gap-2">
            <Glasses className="w-10 h-10 stroke-[1.2] text-zinc-700" />
            <span className="text-xs">آماده قرارگیری عکس عینک</span>
          </div>
        )}

        {/* Badges Over Image */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
          {product.uvProtection && (
            <span className="inline-flex items-center gap-1 bg-zinc-950/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>{product.uvProtection}</span>
            </span>
          )}
          {discountPercent > 0 && (
            <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
              <span>%{discountPercent} تخفیف</span>
            </span>
          )}
        </div>

        {/* Product Code Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-zinc-900/90 backdrop-blur-md text-zinc-400 font-mono text-[10px] px-2 py-0.5 rounded-md border border-zinc-800">
            {product.code || 'STK'}
          </span>
        </div>

        {/* Multiple Images Dots Indicator */}
        {hasImages && product.images.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImgIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentImgIndex === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-zinc-600/70 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Admin Quick Control Overlay */}
        {isAdmin && (
          <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
            {onEditProduct && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProduct(product);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 p-2.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg transition-transform hover:scale-110"
              >
                <Edit className="w-4 h-4" />
                <span>ویرایش</span>
              </button>
            )}
            {onDeleteProduct && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProduct(product.id);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white p-2.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg transition-transform hover:scale-110"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-right">
        <div>
          {/* Tags bar */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
            <span className="text-amber-400/90 font-medium">{product.frameType || 'فریم استوک'}</span>
            <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-[10px] text-zinc-300">
              {product.gender || 'اسپرت'}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
            {product.title}
          </h3>

          {product.lensColor && (
            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>عدسی: {product.lensColor}</span>
            </p>
          )}
        </div>

        {/* Pricing & Stock Footer */}
        <div className="pt-2 border-t border-zinc-800/60 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-zinc-500 line-through">
                {formatToman(product.originalPrice)}
              </span>
            )}
            <span className="text-base font-extrabold text-amber-400 tracking-tight">
              {formatToman(product.price)}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              product.stock <= 0
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-500 text-zinc-950 scale-105'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 hover:shadow-amber-500/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>اضافه شد</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{product.stock <= 0 ? 'ناموجود' : 'افزودن'}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
