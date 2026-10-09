import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GraphicsAsset, LicenseType } from '../types';
import { LICENSE_TIERS } from '../data/graphicsAssets';
import { X, RotateCcw, Maximize2, ShoppingBag, Check, Layers, Sliders, Sun, ShieldCheck } from 'lucide-react';

interface Asset3DViewerModalProps {
  asset: GraphicsAsset;
  onClose: () => void;
  onAddToCart: (asset: GraphicsAsset, license: LicenseType) => void;
  isAddedToCart?: boolean;
}

export const Asset3DViewerModal: React.FC<Asset3DViewerModalProps> = ({
  asset,
  onClose,
  onAddToCart,
  isAddedToCart = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedLicense, setSelectedLicense] = useState<LicenseType>('commercial');
  const [materialMode, setMaterialMode] = useState<'pbr' | 'wireframe' | 'chrome' | 'hologram' | 'normals'>('pbr');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [lightIntensity, setLightIntensity] = useState<number>(2.5);
  const [explosionFactor, setExplosionFactor] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const outerMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const mainLightRef = useRef<THREE.PointLight | null>(null);

  // Mouse drag orbital rotation state
  const isDraggingRef = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 6.5, theta: 0.8, phi: 1.1 });
  const animFrameRef = useRef<number>(0);

  // Calculate price based on selected license
  const calculatedPrice = Math.round(asset.price * LICENSE_TIERS[selectedLicense].multiplier);

  // Setup Three.js 3D Studio scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06070a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Studio lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x06b6d4, 2.5);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xa855f7, 3, 25);
    pointLight.position.set(-6, -4, 4);
    scene.add(pointLight);
    mainLightRef.current = pointLight;

    const rimLight = new THREE.PointLight(0xffffff, 2, 20);
    rimLight.position.set(0, 5, -6);
    scene.add(rimLight);

    // Ground Grid Helper
    const gridHelper = new THREE.GridHelper(14, 28, 0x06b6d4, 0x1f2937);
    gridHelper.position.y = -2.2;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Build Model Hierarchy based on asset.geometryType
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    let outerGeom: THREE.BufferGeometry;
    let coreGeom: THREE.BufferGeometry;

    switch (asset.geometryType) {
      case 'quantum-prism':
        outerGeom = new THREE.OctahedronGeometry(1.9, 2);
        coreGeom = new THREE.IcosahedronGeometry(1.1, 1);
        break;
      case 'hyper-torus':
        outerGeom = new THREE.TorusKnotGeometry(1.3, 0.45, 128, 32, 2, 3);
        coreGeom = new THREE.TorusGeometry(0.7, 0.15, 16, 64);
        break;
      case 'cyber-icosahedron':
        outerGeom = new THREE.IcosahedronGeometry(1.85, 1);
        coreGeom = new THREE.DodecahedronGeometry(1.1, 0);
        break;
      case 'liquid-sphere':
        outerGeom = new THREE.SphereGeometry(1.7, 64, 64);
        coreGeom = new THREE.OctahedronGeometry(1.0, 2);
        break;
      case 'mecha-chassis':
      default:
        outerGeom = new THREE.BoxGeometry(2.0, 1.4, 2.4, 4, 4, 4);
        coreGeom = new THREE.CylinderGeometry(0.6, 0.6, 1.8, 32);
        break;
    }

    // Default PBR Material
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.5,
      ior: 1.55
    });

    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.85,
      wireframe: true
    });

    const outerMesh = new THREE.Mesh(outerGeom, outerMat);
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);

    modelGroup.add(outerMesh);
    modelGroup.add(coreMesh);

    outerMeshRef.current = outerMesh;
    coreMeshRef.current = coreMesh;

    // Mouse drag handlers for Orbit controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      prevMousePos.current = { x: e.clientX, y: e.clientY };

      sphericalRef.current.theta -= dx * 0.008;
      sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, sphericalRef.current.phi - dy * 0.008));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(3.5, Math.min(14, sphericalRef.current.radius + e.deltaY * 0.005));
    };

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDraggingRef.current) {
        sphericalRef.current.theta += delta * 0.4;
      }

      // Convert spherical coordinates to camera Cartesian position
      const r = sphericalRef.current.radius;
      const theta = sphericalRef.current.theta;
      const phi = sphericalRef.current.phi;

      camera.position.x = r * Math.sin(phi) * Math.sin(theta);
      camera.position.y = r * Math.cos(phi);
      camera.position.z = r * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [asset.geometryType]);

  // Handle Material Preset changes
  useEffect(() => {
    if (!outerMeshRef.current || !coreMeshRef.current) return;

    let newOuterMat: THREE.Material;
    let newCoreMat: THREE.Material;

    switch (materialMode) {
      case 'wireframe':
        newOuterMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true });
        newCoreMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true });
        break;
      case 'chrome':
        newOuterMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.98, roughness: 0.08 });
        newCoreMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.9 });
        break;
      case 'hologram':
        newOuterMat = new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.6,
          roughness: 0.1,
          transmission: 0.85,
          thickness: 1.2,
          transparent: true,
          opacity: 0.7
        });
        newCoreMat = new THREE.MeshBasicMaterial({ color: 0xec4899, wireframe: true });
        break;
      case 'normals':
        newOuterMat = new THREE.MeshNormalMaterial({ wireframe: false });
        newCoreMat = new THREE.MeshNormalMaterial({ wireframe: true });
        break;
      case 'pbr':
      default:
        newOuterMat = new THREE.MeshPhysicalMaterial({
          color: 0x1e293b,
          metalness: 0.85,
          roughness: 0.15,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          transmission: 0.5,
          ior: 1.55
        });
        newCoreMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.85,
          wireframe: true
        });
        break;
    }

    outerMeshRef.current.material = newOuterMat;
    coreMeshRef.current.material = newCoreMat;
  }, [materialMode]);

  // Handle Grid Visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Handle Light Intensity
  useEffect(() => {
    if (mainLightRef.current) {
      mainLightRef.current.intensity = lightIntensity;
    }
  }, [lightIntensity]);

  // Handle Explosion Factor
  useEffect(() => {
    if (outerMeshRef.current && coreMeshRef.current) {
      const scaleOuter = 1.0 + explosionFactor * 0.8;
      const scaleCore = 1.0 - explosionFactor * 0.4;
      outerMeshRef.current.scale.set(scaleOuter, scaleOuter, scaleOuter);
      coreMeshRef.current.scale.set(scaleCore, scaleCore, scaleCore);
    }
  }, [explosionFactor]);

  // Handle Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl h-[90vh] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left: 3D Interactive WebGL Canvas Viewport */}
        <div className="relative flex-1 h-[55%] lg:h-full bg-neutral-950 overflow-hidden">
          {/* Canvas Mount */}
          <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Viewport Top Floating Controls */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-md bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 font-medium backdrop-blur-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>3D Real-time WebGL Lab</span>
            </div>
            <span className="text-xs text-neutral-500 hidden sm:inline">Drag to orbit · Scroll to zoom</span>
          </div>

          {/* Viewport Bottom Controls Toolbar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 p-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Material Switcher */}
            <div className="flex items-center gap-1">
              <span className="text-neutral-400 font-medium mr-1 hidden sm:inline">Shader:</span>
              {(['pbr', 'chrome', 'hologram', 'normals', 'wireframe'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMaterialMode(mode)}
                  className={`px-2.5 py-1 rounded font-medium capitalize transition-colors ${
                    materialMode === mode
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-3">
              {/* Explosion Slider */}
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Explode:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={explosionFactor}
                  onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  title="Explosion factor"
                />
              </div>

              {/* Light Intensity */}
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={lightIntensity}
                  onChange={(e) => setLightIntensity(parseFloat(e.target.value))}
                  className="w-14 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  title="Lighting strength"
                />
              </div>

              {/* Grid Toggle */}
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  showGrid ? 'bg-neutral-800 text-neutral-200 border-neutral-700' : 'text-neutral-500 border-transparent'
                }`}
              >
                Grid
              </button>

              {/* Auto Rotate Toggle */}
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  autoRotate ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'text-neutral-500 border-transparent'
                }`}
              >
                Auto-Spin
              </button>
            </div>
          </div>
        </div>

        {/* Right: Technical Specifications & License Acquisition Pane */}
        <div className="w-full lg:w-96 p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-900/60 overflow-y-auto">
          <div>
            {/* Header & Close */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-800">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  {asset.category.replace('-', ' ')}
                </span>
                <h2 className="text-xl font-bold text-white font-display mt-0.5">
                  {asset.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
              {asset.description}
            </p>

            {/* Asset Technical Specifications */}
            <div className="mt-5 space-y-2 py-3 border-y border-neutral-800 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Polygon Complexity</span>
                <span className="font-mono text-neutral-200">{asset.specs.polyCount || 'Procedural WebGL'}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Resolution / Texture</span>
                <span className="font-mono text-neutral-200">{asset.specs.resolution || 'Mathematical GLSL'}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Package Archive Size</span>
                <span className="font-mono text-neutral-200">{asset.specs.fileSize}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Software Compatibility</span>
                <span className="text-neutral-300 text-right truncate max-w-[180px]">
                  {asset.specs.softwareCompatible.slice(0, 3).join(', ')}
                </span>
              </div>
            </div>

            {/* Included File Formats */}
            <div className="mt-4">
              <span className="text-xs text-neutral-400 font-medium block mb-1.5">Delivered Formats:</span>
              <div className="flex flex-wrap gap-1.5">
                {asset.formats.map((fmt) => (
                  <span key={fmt} className="px-2 py-0.5 text-xs bg-neutral-800/80 text-neutral-300 rounded border border-neutral-700/60 font-mono">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* License Selection Tier */}
            <div className="mt-5">
              <span className="text-xs text-neutral-300 font-semibold block mb-2">Select Commercial Rights:</span>
              <div className="space-y-2">
                {(Object.keys(LICENSE_TIERS) as LicenseType[]).map((type) => {
                  const tier = LICENSE_TIERS[type];
                  const isSelected = selectedLicense === type;
                  const tierPrice = Math.round(asset.price * tier.multiplier);
                  return (
                    <div
                      key={type}
                      onClick={() => setSelectedLicense(type)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-neutral-800/90 border-cyan-500/60 shadow-sm shadow-cyan-500/10'
                          : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                          {tier.name}
                        </span>
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          ${tierPrice}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-neutral-400 leading-tight">
                        {tier.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action & Checkout bottom bar */}
          <div className="mt-6 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-neutral-400">Total Investment</span>
              <span className="text-2xl font-bold font-mono text-white">
                ${calculatedPrice}
              </span>
            </div>

            <button
              onClick={() => onAddToCart(asset, selectedLicense)}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                isAddedToCart
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20 active:scale-[0.99]'
              }`}
            >
              {isAddedToCart ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Project Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart (${calculatedPrice})</span>
                </>
              )}
            </button>

            <div className="mt-2 text-center text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Instant ZIP download link + verified license certificate</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
