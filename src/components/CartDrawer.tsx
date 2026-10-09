import React, { useState } from 'react';
import { CartItem, LicenseType } from '../types';
import { LICENSE_TIERS } from '../data/graphicsAssets';
import { X, Trash2, ShieldCheck, Tag, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (assetId: string) => void;
  onUpdateLicense: (assetId: string, license: LicenseType) => void;
  onProceedToCheckout: (appliedDiscount: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateLicense,
  onProceedToCheckout
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice, 0);

  let discountAmount = 0;
  if (promoApplied === 'APEX20') {
    discountAmount = Math.round(subtotal * 0.2);
  } else if (promoApplied === 'VFXPRO') {
    discountAmount = Math.min(subtotal, 25);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (clean === 'APEX20' || clean === 'VFXPRO') {
      setPromoApplied(clean);
      setPromoError(null);
    } else {
      setPromoError('Invalid code. Try "APEX20" for 20% off.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-neutral-800 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white font-display">
                Studio Asset Cart ({items.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-neutral-500">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-1 opacity-40 mb-3" />
                <p className="text-base font-medium text-neutral-400">Your cart is empty</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Browse our procedural 3D models, GLSL shaders, and kinetic fluid loops.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.asset.id}
                  className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.asset.thumbnailUrl}
                      alt={item.asset.title}
                      className="w-16 h-16 rounded-lg object-cover bg-neutral-900 shrink-0 border border-neutral-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {item.asset.title}
                      </h4>
                      <div className="text-[11px] font-mono text-cyan-400 mt-0.5 uppercase">
                        {item.asset.category.replace('-', ' ')}
                      </div>
                      <div className="text-xs font-mono font-bold text-white mt-1">
                        ${item.unitPrice}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.asset.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* License Selector within cart */}
                  <div className="pt-2 border-t border-neutral-800/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-400">License Rights:</span>
                      <select
                        value={item.license}
                        onChange={(e) => onUpdateLicense(item.asset.id, e.target.value as LicenseType)}
                        className="bg-neutral-950 text-neutral-200 border border-neutral-700 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-cyan-400"
                      >
                        <option value="personal">Personal (${Math.round(item.asset.price * LICENSE_TIERS.personal.multiplier)})</option>
                        <option value="commercial">Commercial (${Math.round(item.asset.price * LICENSE_TIERS.commercial.multiplier)})</option>
                        <option value="extended">Extended (${Math.round(item.asset.price * LICENSE_TIERS.extended.multiplier)})</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-6 border-t border-neutral-800 bg-neutral-950/90 space-y-4">
              {/* Promo code form */}
              <form onSubmit={applyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo code (try APEX20)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 uppercase focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <div className="text-[11px] text-emerald-400">
                    Promo code {promoApplied} applied!
                  </div>
                )}
                {promoError && (
                  <div className="text-[11px] text-rose-400">
                    {promoError}
                  </div>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs pt-2">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-200">${subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({promoApplied})</span>
                    <span className="font-mono">-${discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Total</span>
                  <span className="font-mono text-cyan-400">${finalTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => onProceedToCheckout(discountAmount)}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.99]"
              >
                <span>Proceed to Instant Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                <span>Instant digital delivery + lifetime updates</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
