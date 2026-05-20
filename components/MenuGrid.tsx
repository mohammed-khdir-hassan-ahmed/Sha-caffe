'use client';

import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { imageKitLoader, getResponsiveSizes } from '@/lib/imagekit-loader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import OptimizedMenuItem from './OptimizedMenuItem';
import { useLocale } from 'next-intl';
import { type MenuItem } from '@/lib/db';

interface MenuGridProps {
  items: MenuItem[];
}

function normalizeSizes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((size) => String(size).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((size) => String(size).trim())
          .filter(Boolean);
      }
    } catch {
      return value
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export default function MenuGrid({ items }: MenuGridProps) {
  const locale = useLocale();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const getDisplayName = (item: MenuItem) => {
    if (locale === 'ar') {
      return (item as any).name_arb || item.name_en || item.name_ckb || 'Menu Item';
    } else if (locale === 'ku') {
      return item.name_ckb || item.name_en || 'Menu Item';
    } else {
      return item.name_en || item.name_ckb || 'Menu Item';
    }
  };

  const getDescription = (item: MenuItem) => {
    if (locale === 'ar') {
      return (item as any).description_arb || (item as any).description_en || (item as any).description_ckb || '';
    } else if (locale === 'ku') {
      return (item as any).description_ckb || (item as any).description_en || (item as any).description_arb || '';
    } else {
      return (item as any).description_en || (item as any).description_ckb || (item as any).description_arb || '';
    }
  };

  const itemSizes = selectedItem ? normalizeSizes((selectedItem as any).sizes) : [];
  const sizeRows = [];
  for (let i = 0; i < itemSizes.length; i += 2) {
    sizeRows.push(itemSizes.slice(i, i + 2));
  }

  const isSoldOut = selectedItem ? ((selectedItem as any).is_sold_out || false) : false;

  const getSoldOutText = () => {
    if (locale === 'ar') return 'نفد';
    if (locale === 'ku') return 'لەێستادا بەردەست نیە';
    return 'Sold Out';
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((item, index) => (
          <OptimizedMenuItem
            key={item.id}
            item={item}
            onSelect={setSelectedItem}
            priority={index < 4}
            index={index}
          />
        ))}
      </div>

      {selectedItem && (
        <Dialog
          open={true}
          onOpenChange={() => {
            setSelectedItem(null);
            setSelectedSize(null);
            setQuantity(1);
          }}
        >
          <DialogContent className="max-h-[85vh] overflow-y-auto max-w-xs md:max-w-sm" dir="ltr">
            <DialogTitle className="sr-only">
              {getDisplayName(selectedItem)}
            </DialogTitle>

            <div className="rounded-lg overflow-hidden mb-4 -mt-6 -mx-6 bg-gray-100 relative">
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <span className="text-white font-bold text-lg md:text-xl bg-red-600 px-4 py-2 rounded-lg shadow-lg">
                    {getSoldOutText()}
                  </span>
                </div>
              )}
              <Image
                loader={imageKitLoader}
                src={selectedItem.image_url}
                alt={getDisplayName(selectedItem)}
                width={500}
                height={400}
                sizes={getResponsiveSizes('detail')}
                priority
                placeholder="blur"
                blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 400'%3E%3Crect fill='%23f3f4f6' width='500' height='400'/%3E%3C/svg%3E"
                quality={80}
                className={`w-full h-60 md:h-72 object-cover ${isSoldOut ? 'grayscale' : ''}`}
              />
            </div>

            <div className="mb-4">
              <h2 className={`text-lg md:text-xl font-bold text-gray-900 ${locale === 'ar' ? 'text-right' : ''} ${isSoldOut ? 'line-through text-gray-500' : ''}`}>
                {getDisplayName(selectedItem)}
              </h2>
              {isSoldOut && (
                <p className="text-red-600 font-bold text-sm mt-2">
                  {getSoldOutText()}
                </p>
              )}
            </div>

            {getDescription(selectedItem) && (
              <div className="mb-4 text-sm text-gray-600">
                {getDescription(selectedItem)}
              </div>
            )}

            {/* Size Selection in Modal */}
            {itemSizes.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  سایز
                </label>
                <div className="flex flex-col gap-2">
                  {sizeRows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex gap-2">
                      {row.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                          className={`flex-1 px-3 py-2 text-sm font-bold rounded-md transition-all ${
                            selectedSize === size
                              ? 'bg-[#386641] text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg p-2 mb-3 w-full mx-auto">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="hover:bg-gray-200 rounded p-2 transition"
                style={{ minWidth: 40, minHeight: 40 }}
              >
                <Minus className="w-6 h-6 md:w-7 md:h-7" />
              </button>
              <span className="text-xl md:text-2xl font-bold w-10 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="hover:bg-gray-200 rounded p-2 transition"
                style={{ minWidth: 40, minHeight: 40 }}
              >
                <Plus className="w-6 h-6 md:w-7 md:h-7" />
              </button>
            </div>

            <Button 
              onClick={() => {
                setSelectedItem(null);
                setSelectedSize(null);
                setQuantity(1);
              }}
              className="w-full bg-[#386641] hover:bg-[#2a4d30] text-white py-3 font-bold"
            >
              {locale === 'en' ? 'Close' : 'داخستن'}
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
