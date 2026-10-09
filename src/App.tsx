import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AssetCategory, GraphicsAsset, CartItem, LicenseType, GeometryType } from './types';
import { GRAPHICS_ASSETS, LICENSE_TIERS } from './data/graphicsAssets';
import { Navbar } from './components/Navbar';
import { Hero3DCanvas } from './components/Hero3DCanvas';
import { AssetCard } from './components/AssetCard';
import { Asset3DViewerModal } from './components/Asset3DViewerModal';
import { ShaderPlayground } from './components/ShaderPlayground';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerReviews } from './components/CustomerReviews';
import { Footer } from './components/Footer';
import { Search, SlidersHorizontal, Heart, Sparkles, Check, ArrowUpDown } from 'lucide-react';

export default function App() {
  // State for filtering & searching
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // User interactions
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_favorites');
      return saved ? JSON.parse(saved) : ['apex-quantum-prism'];
    } catch {
      return ['apex-quantum-prism'];
    }
  });

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('apex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Active 3D Viewer Asset
  const [activeViewerAsset, setActiveViewerAsset] = useState<GraphicsAsset | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);
  const labRef = useRef<HTMLDivElement>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('apex_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('apex_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleFavorite = (assetId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(assetId);
      const next = exists ? prev.filter((id) => id !== assetId) : [...prev, assetId];
      showToast(exists ? 'Removed from saved favorites' : 'Saved to favorites');
      return next;
    });
  };

  const handleAddToCart = (asset: GraphicsAsset, license: LicenseType = 'personal') => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.asset.id === asset.id);
      const unitPrice = Math.round(asset.price * LICENSE_TIERS[license].multiplier);

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          license,
          unitPrice
        };
        showToast(`Updated "${asset.title}" in cart`);
        return updated;
      } else {
        showToast(`Added "${asset.title}" to cart`);
        return [
          ...prev,
          {
            asset,
            license,
            unitPrice,
            addedAt: Date.now()
          }
        ];
      }
    });
  };

  const handleRemoveFromCart = (assetId: string) => {
    setCartItems((prev) => prev.filter((item) => item.asset.id !== assetId));
  };

  const handleUpdateCartLicense = (assetId: string, license: LicenseType) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.asset.id === assetId) {
          return {
            ...item,
            license,
            unitPrice: Math.round(item.asset.price * LICENSE_TIERS[license].multiplier)
          };
        }
        return item;
      })
    );
  };

  const handleOpenViewerByGeometry = (geomType: GeometryType) => {
    const found = GRAPHICS_ASSETS.find((a) => a.geometryType === geomType) || GRAPHICS_ASSETS[0];
    setActiveViewerAsset(found);
  };

  // Filtered & sorted assets
  const filteredAssets = useMemo(() => {
    return GRAPHICS_ASSETS.filter((asset) => {
      // Category filter
      if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
        return false;
      }
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(asset.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = asset.title.toLowerCase().includes(query);
        const matchesTagline = asset.tagline.toLowerCase().includes(query);
        const matchesTag = asset.tags.some((t) => t.toLowerCase().includes(query));
        const matchesFormat = asset.formats.some((f) => f.toLowerCase().includes(query));
        return matchesTitle || matchesTagline || matchesTag || matchesFormat;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [selectedCategory, searchQuery, sortBy, showFavoritesOnly, favorites]);

  return (
    <div className="min-h-screen bg-[#050608] text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 py-2.5 px-4 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-3.5 h-3.5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar following Strict 3-Zone Contract */}
      <Navbar
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onScrollToLab={() => labRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      <main className="flex-1">
        
        {/* Interactive Three.js Hero Section */}
        <section className="pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Hero3DCanvas
            onExploreCatalog={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })}
            onOpenViewer={handleOpenViewerByGeometry}
          />
        </section>

        {/* Store Catalog & Showcase Grid */}
        <section ref={catalogRef} id="catalog" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Digital Production Assets
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                Curated 3D Models & Motion Packages
              </h2>
              <p className="text-sm text-neutral-400 mt-1 max-w-xl">
                Real-time procedural assets, 4K ProRes kinetic fluid loops, and GLSL materials with perpetual studio licenses.
              </p>
            </div>

            {/* Quick Favorites count */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 self-start md:self-auto transition-colors ${
                showFavoritesOnly
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-white border-neutral-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>Saved Wishlist ({favorites.length})</span>
            </button>
          </div>

          {/* Interactive Filters & Search Controls */}
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 mb-8 space-y-4">
            
            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Graphics' },
                { id: '3d-geometry', label: '3D Geometry' },
                { id: 'kinetic-vfx', label: 'Kinetic Loops' },
                { id: 'shaders-glsl', label: 'GLSL Shaders' },
                { id: 'cyber-hud', label: 'Cyber HUD' },
                { id: 'particles-sim', label: 'Particles FX' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as AssetCategory)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                    selectedCategory === tab.id
                      ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Bar & Sorting */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800/60">
              
              {/* Search input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assets, formats, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-neutral-400">
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="featured">Featured / Curated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated (Stars)</option>
                </select>
              </div>

            </div>

          </div>

          {/* Asset Grid */}
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onOpenViewer={(a) => setActiveViewerAsset(a)}
                  onAddToCart={(a) => handleAddToCart(a, 'personal')}
                  isFavorited={favorites.includes(asset.id)}
                  onToggleFavorite={toggleFavorite}
                  isAddedToCart={cartItems.some((ci) => ci.asset.id === asset.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-neutral-900/20 border border-neutral-800 rounded-2xl">
              <Sparkles className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
              <h3 className="text-base font-semibold text-white">No assets matched your filter</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Try searching for different keywords or clear the category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setShowFavoritesOnly(false);
                }}
                className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white rounded-xl transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

        </section>

        {/* Live Procedural GLSL Shader Sandbox */}
        <div ref={labRef}>
          <ShaderPlayground />
        </div>

        {/* Customer Proof & Testimonials */}
        <CustomerReviews />

      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive 3D WebGL Studio Lab Modal */}
      {activeViewerAsset && (
        <Asset3DViewerModal
          asset={activeViewerAsset}
          onClose={() => setActiveViewerAsset(null)}
          onAddToCart={(asset, license) => {
            handleAddToCart(asset, license);
            setActiveViewerAsset(null);
            setIsCartOpen(true);
          }}
          isAddedToCart={cartItems.some((ci) => ci.asset.id === activeViewerAsset.id)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onUpdateLicense={handleUpdateCartLicense}
        onProceedToCheckout={(discount) => {
          setAppliedDiscount(discount);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        discount={appliedDiscount}
        onClearCart={() => setCartItems([])}
      />

    </div>
  );
}
