import React from 'react';
import { ShieldCheck, Download, Code2, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="text-base font-bold text-white font-display flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45 inline-block" />
              <span>Apex Visual Studio</span>
            </div>
            <p className="text-neutral-500 leading-relaxed max-w-xs">
              Pristine 3D geometry, real-time GLSL materials, and 60FPS motion systems engineered for modern digital creators.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px] font-mono mb-3">
              Asset Collections
            </h4>
            <ul className="space-y-2">
              <li><a href="#catalog" className="hover:text-white transition-colors">Procedural 3D Crystals</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Mercury Fluid Loops</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Tactical HUD Systems</a></li>
              <li><a href="#catalog" className="hover:text-white transition-colors">Raymarched GLSL Shaders</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px] font-mono mb-3">
              Licensing & Formats
            </h4>
            <ul className="space-y-2">
              <li><span className="text-neutral-400">Blender 4.0+ & Cinema 4D</span></li>
              <li><span className="text-neutral-400">Three.js & WebGL 2.0</span></li>
              <li><span className="text-neutral-400">Unreal Engine 5 & Unity 6</span></li>
              <li><span className="text-neutral-400">Perpetual Commercial Rights</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px] font-mono mb-3">
              Studio Guarantee
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Clean Topology</span>
              </li>
              <li className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Archive Delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Shader Source Included</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500">
          <p>© {new Date().getFullYear()} Apex Visual Studio. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built with Three.js & WebGL</span>
            <span>·</span>
            <span>Production Grade Visual Assets</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
