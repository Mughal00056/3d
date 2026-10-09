import React from 'react';
import { GraphicsAsset } from '../types';
import { Eye, ShoppingBag, Heart, Star, Sparkles } from 'lucide-react';

interface AssetCardProps {
  asset: GraphicsAsset;
  onOpenViewer: (asset: GraphicsAsset) => void;
  onAddToCart: (asset: GraphicsAsset) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (assetId: string) => void;
  isAddedToCart?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onOpenViewer,
  onAddToCart,
  isFavorited = false,
  onToggleFavorite,
  isAddedToCart = false
}) => {
  return (
    <div className="group relative flex flex-col bg-neutral-900/40 hover:bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700/80 rounded-2xl overflow-hidden transition-all duration-300">
      
      {/* Thumbnail Showcase Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
        <img
          src={asset.thumbnailUrl}
          alt={asset.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80" />

        {/* Favorite Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(asset.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all ${
            isFavorited
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-neutral-950/60 text-neutral-400 hover:text-white border-neutral-800 hover:bg-neutral-900/80'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-400' : ''}`} />
        </button>

        {/* 3D Inspect Trigger Floating Overlay */}
        <button
          onClick={() => onOpenViewer(asset)}
          className="absolute inset-x-4 bottom-4 py-2 px-3 rounded-xl bg-neutral-950/85 hover:bg-cyan-500 hover:text-black text-neutral-200 border border-neutral-700/80 hover:border-cyan-400 backdrop-blur-md text-xs font-semibold flex items-center justify-center gap-2 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 shadow-lg shadow-black/50"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Launch 3D WebGL Studio</span>
        </button>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Clean Unboxed Metadata (Zero-Pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <span className="font-mono text-cyan-400 uppercase tracking-wide">
              {asset.category.replace('-', ' ')}
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="flex items-center gap-1 text-neutral-300">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-mono">{asset.rating}</span>
            </span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="font-mono text-neutral-400">{asset.downloadsCount.toLocaleString()} downloads</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-white font-display group-hover:text-cyan-300 transition-colors line-clamp-1">
            {asset.title}
          </h3>

          {/* Tagline */}
          <p className="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {asset.tagline}
          </p>

          {/* Formats list (Clean text chips) */}
          <div className="mt-3 flex flex-wrap gap-1">
            {asset.formats.slice(0, 3).map((fmt) => (
              <span key={fmt} className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                {fmt}
              </span>
            ))}
            {asset.formats.length > 3 && (
              <span className="text-[11px] font-mono text-neutral-500 self-center">
                +{asset.formats.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Price & Add to Cart */}
        <div className="mt-5 pt-3.5 border-t border-neutral-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-neutral-500 block">From</span>
            <span className="text-xl font-bold font-mono text-white">
              ${asset.price}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenViewer(asset)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
              title="Inspect 3D Geometry"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => onAddToCart(asset)}
              className={`py-2 px-3.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all ${
                isAddedToCart
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-neutral-100 hover:bg-white text-neutral-950 active:scale-95 shadow-sm'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isAddedToCart ? 'In Cart' : 'Add'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
