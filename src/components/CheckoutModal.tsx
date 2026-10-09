import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CartItem } from '../types';
import { X, CheckCircle2, Download, ShieldCheck, FileCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discount: number;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discount,
  onClearCart
}) => {
  const [email, setEmail] = useState('ownerofapexstore@gmail.com');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'apple-pay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice, 0);
  const total = Math.max(0, subtotal - discount);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      const randomOrderId = 'APX-' + Math.floor(100000 + Math.random() * 900000);
      setOrderId(randomOrderId);

      // Trigger celebratory confetti burst!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#a855f7', '#38bdf8', '#ffffff']
      });

      onClearCart();
    }, 1200);
  };

  const handleDownloadAsset = (title: string) => {
    // Generate simulated download file
    const element = document.createElement('a');
    const file = new Blob(
      [
        `Apex Visual Studio - Asset License & Archive Manifest\nAsset: ${title}\nLicense Order: ${orderId}\nLicensee: ${email}\nVerification Hash: sha256-apex-${Date.now()}\n\nWelcome to Apex 3D Graphics. Your production archive package has been verified.`
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, '-')}-archive-license.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">Instant Digital Checkout</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              Complete Your Asset Purchase
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Immediate download access and commercial licenses will be generated instantly.
            </p>

            <form onSubmit={handlePay} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  Delivery Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'card', label: 'Credit Card' },
                    { id: 'apple-pay', label: 'Apple Pay' },
                    { id: 'crypto', label: 'Crypto (USDC)' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                        paymentMethod === m.id
                          ? 'bg-neutral-800 text-cyan-300 border-cyan-500/40 shadow-sm'
                          : 'bg-neutral-900/60 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Simulation details */}
              {paymentMethod === 'card' && (
                <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-800/80 space-y-2">
                  <input
                    type="text"
                    defaultValue="4242 •••• •••• 4242"
                    readOnly
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-300"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      defaultValue="12 / 28"
                      readOnly
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-300"
                    />
                    <input
                      type="text"
                      defaultValue="CVC 982"
                      readOnly
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-300"
                    />
                  </div>
                </div>
              )}

              {/* Order Summary Recap */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Items count</span>
                  <span className="font-mono text-white">{items.length} Packages</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount applied</span>
                    <span className="font-mono">-${discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Total Amount</span>
                  <span className="font-mono text-cyan-400 text-base">${total}</span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing WebGL Digital License...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Unlock Assets (${total})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-4 space-y-5 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-wider">Payment Verified</span>
              <h2 className="text-2xl font-bold font-display text-white mt-1">
                Assets Unlocked & Ready
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Order <span className="font-mono text-neutral-200">{orderId}</span> has been confirmed. A receipt and license agreement have been dispatched to <span className="text-white font-medium">{email}</span>.
              </p>
            </div>

            {/* Asset Download Links */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-left space-y-2.5 max-h-56 overflow-y-auto">
              <span className="text-xs font-semibold text-neutral-300 block">Available Digital Archives:</span>
              {items.map((item) => (
                <div
                  key={item.asset.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800/80 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-white truncate">{item.asset.title}</div>
                    <div className="text-[11px] font-mono text-cyan-400">
                      {item.asset.specs.fileSize} · {item.license.toUpperCase()} LICENSE
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadAsset(item.asset.title)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download ZIP</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl font-medium text-xs bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
              >
                Return to Apex Store
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
