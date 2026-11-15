import React from 'react';
import { ExternalLink } from 'lucide-react';

export const AMAZON_URL = 'https://www.amazon.in/dp/B0HQ5D3NBT';
export const FLIPKART_URL = 'https://www.flipkart.com/zeba-period-pain-relif-patch-plaster/p/itm9ca5d6d579d66?pid=BPRHSHKNEHHETAMX';

export function AmazonIcon({ className = 'w-5 h-5' }) {
  return (
    <img
      src="/images/amazon.webp"
      alt="Amazon"
      width="24"
      height="24"
      className={`${className} object-contain rounded-md flex-shrink-0 bg-white p-0.5 shadow-xs`}
    />
  );
}

export function FlipkartIcon({ className = 'w-5 h-5' }) {
  return (
    <img
      src="/images/flipkart.jpg"
      alt="Flipkart"
      width="24"
      height="24"
      className={`${className} object-contain rounded-md flex-shrink-0 bg-white p-0.5 shadow-xs`}
    />
  );
}

/**
 * Reusable Marketplace Buttons Component
 * Provides direct purchase links to Amazon and Flipkart
 */
export default function MarketplaceButtons({
  layout = 'row', // 'row' | 'grid' | 'inline'
  size = 'md',    // 'sm' | 'md' | 'lg'
  showLabel = false,
  label = 'Also Available On:',
  className = '',
  amazonText = 'Buy on Amazon',
  flipkartText = 'Buy on Flipkart',
  showExternalIcon = true
}) {
  const sizeClasses = {
    sm: 'py-2 px-3 text-[11px] rounded-xl space-x-1.5',
    md: 'py-2.5 px-4 text-xs rounded-xl space-x-2',
    lg: 'py-3.5 px-5 text-sm rounded-2xl space-x-2.5'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#805A82]">
            {label}
          </span>
          <div className="h-px bg-brand-primaryPink/20 flex-1" />
        </div>
      )}

      <div
        className={
          layout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5'
            : layout === 'inline'
            ? 'flex items-center flex-wrap gap-2'
            : 'flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5'
        }
      >
        {/* Amazon Button */}
        <a
          href={AMAZON_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center font-bold tracking-wide transition-all shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer group bg-[#131921] hover:bg-[#232F3E] text-white border border-white/10 ${sizeClasses[size]}`}
          title="Buy ZEBA Heating Pads on Amazon India"
        >
          <AmazonIcon className={`${iconSizes[size]} flex-shrink-0`} />
          <span className="truncate">{amazonText}</span>
          {showExternalIcon && (
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-0.5" />
          )}
        </a>

        {/* Flipkart Button */}
        <a
          href={FLIPKART_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center font-bold tracking-wide transition-all shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer group bg-[#2874F0] hover:bg-[#1a5bc9] text-white border border-blue-400/30 ${sizeClasses[size]}`}
          title="Buy ZEBA Heating Pads on Flipkart"
        >
          <FlipkartIcon className={`${iconSizes[size]} flex-shrink-0`} />
          <span className="truncate">{flipkartText}</span>
          {showExternalIcon && (
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-0.5" />
          )}
        </a>
      </div>
    </div>
  );
}
