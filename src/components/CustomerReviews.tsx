import React from 'react';
import { CLIENT_TESTIMONIALS } from '../data/graphicsAssets';
import { Quote } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-neutral-900">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
          Trusted by VFX Studios & Spatial Engineers
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          Field-proven across AAA game releases, interactive web campaigns, and broadcast title design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CLIENT_TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 flex flex-col justify-between"
          >
            <div>
              <Quote className="w-5 h-5 text-cyan-400/60 mb-3" />
              <p className="text-sm text-neutral-300 leading-relaxed italic">
                "{t.quote}"
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800/60">
              <div className="font-semibold text-sm text-white font-display">
                {t.name}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                {t.role} · <span className="text-neutral-500">{t.organization}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
