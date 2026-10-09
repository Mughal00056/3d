import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Sparkles } from 'lucide-react';
import { AssetCategory } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onSelectCategory: (cat: AssetCategory) => void;
  onScrollToLab: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onSelectCategory,
  onScrollToLab
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (cat: AssetCategory) => {
    onSelectCategory(cat);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
        
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 rotate-45 inline-block" />
          <span>Apex Visual Studio</span>
        </a>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-400">
          <button
            onClick={() => handleNavClick('all')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            All Graphics
          </button>
          <button
            onClick={() => handleNavClick('3d-geometry')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            3D Geometry
          </button>
          <button
            onClick={() => handleNavClick('kinetic-vfx')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Kinetic Loops
          </button>
          <button
            onClick={() => handleNavClick('shaders-glsl')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            GLSL Shaders
          </button>
          <button
            onClick={() => {
              onScrollToLab();
              setMobileMenuOpen(false);
            }}
            className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shader Lab</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCart}
            className="relative px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-2"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.2 font-mono text-[11px] font-bold bg-cyan-400 text-neutral-950 rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-neutral-950 px-4 py-4 space-y-3">
          <button
            onClick={() => handleNavClick('all')}
            className="block w-full text-left py-2 text-sm text-neutral-300 hover:text-white"
          >
            All Graphics
          </button>
          <button
            onClick={() => handleNavClick('3d-geometry')}
            className="block w-full text-left py-2 text-sm text-neutral-300 hover:text-white"
          >
            3D Geometry
          </button>
          <button
            onClick={() => handleNavClick('kinetic-vfx')}
            className="block w-full text-left py-2 text-sm text-neutral-300 hover:text-white"
          >
            Kinetic Loops
          </button>
          <button
            onClick={() => handleNavClick('shaders-glsl')}
            className="block w-full text-left py-2 text-sm text-neutral-300 hover:text-white"
          >
            GLSL Shaders
          </button>
          <button
            onClick={() => {
              onScrollToLab();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm text-cyan-400 font-medium"
          >
            Launch Shader Lab
          </button>
        </div>
      )}
    </header>
  );
};
