import { GraphicsAsset, LicenseTier } from '../types';
import heroImg from '../assets/images/apex_hero_holographic_1791521150004.jpg';
import quantumImg from '../assets/images/apex_quantum_mesh_1791521161814.jpg';
import fluidImg from '../assets/images/apex_kinetic_fluid_1791521175840.jpg';
import hudImg from '../assets/images/apex_cyber_hud_1791521191461.jpg';

export const LICENSE_TIERS: Record<string, LicenseTier> = {
  personal: {
    type: 'personal',
    name: 'Personal & Indie',
    multiplier: 1.0,
    description: 'For non-commercial personal projects, indie student showcases, and portfolio reels.'
  },
  commercial: {
    type: 'commercial',
    name: 'Commercial Studio',
    multiplier: 1.8,
    description: 'Single commercial client release, web apps, game titles up to $250k revenue, and commercial VFX.'
  },
  extended: {
    type: 'extended',
    name: 'Extended Enterprise',
    multiplier: 3.5,
    description: 'Unlimited broadcast, global streaming, SaaS distribution, AAA games, and redistributed templates.'
  }
};

export const GRAPHICS_ASSETS: GraphicsAsset[] = [
  {
    id: 'apex-quantum-prism',
    title: 'Quantum Prism Core Suite',
    category: '3d-geometry',
    tagline: 'Procedural faceted crystal architecture with sub-surface light refractions',
    description: 'A modular cybernetic prism core designed with procedural parametric bevels, custom dual-layer internal lattice, and real-time dispersion shaders. Ready for Blender, Cinema 4D, Unreal Engine 5, and WebGL.',
    price: 49,
    featured: true,
    thumbnailUrl: quantumImg,
    formats: ['.blend', '.fbx', '.obj', '.usdz', '.gltf'],
    specs: {
      polyCount: '48,200 Triangles',
      resolution: '8K PBR Textures',
      softwareCompatible: ['Blender 4.0+', 'Cinema 4D 2024', 'Unreal Engine 5.4', 'Three.js'],
      fileSize: '420 MB'
    },
    geometryType: 'quantum-prism',
    tags: ['Procedural', 'Crystals', 'Cyberpunk', 'Hard-Surface', 'Optics'],
    downloadsCount: 1420,
    rating: 4.96,
    releaseDate: 'October 2026'
  },
  {
    id: 'apex-kinetic-fluid',
    title: 'Mercury Zero-G Liquid Dynamics',
    category: 'kinetic-vfx',
    tagline: 'Seamless 60FPS fluid loops in liquid chrome, mercury, and iridescent glass',
    description: 'Kinetic fluid ribbons captured in high-tension zero-gravity motion. Includes 16 seamless loops with alpha transparency channels, normal maps, and alembic mesh caches for custom lighting setups.',
    price: 65,
    featured: true,
    thumbnailUrl: fluidImg,
    formats: ['ProRes 4444 (Alpha)', '.abc (Alembic)', '.c4d', 'PNG Sequence'],
    specs: {
      resolution: '4096 x 2160 (4K DCI)',
      frameCount: '1,800 Frames (60 fps)',
      softwareCompatible: ['After Effects', 'Premiere Pro', 'DaVinci Resolve', 'Houdini'],
      fileSize: '1.4 GB'
    },
    geometryType: 'liquid-sphere',
    tags: ['Kinetic', 'Fluids', 'Mercury', 'Abstract Motion', 'Seamless Loop'],
    downloadsCount: 2180,
    rating: 4.98,
    releaseDate: 'September 2026'
  },
  {
    id: 'apex-cyber-hud',
    title: 'Tactical Aerospace HUD Suite',
    category: 'cyber-hud',
    tagline: 'Vector coordinate telemetry, 3D target reticles, and holographic UI matrices',
    description: 'Precision aerospace and sci-fi HUD kit containing 120+ modular vector elements, animated circular reticles, velocity vector monitors, and interactive SVG/WebGL components for futuristic user interfaces.',
    price: 39,
    featured: true,
    thumbnailUrl: hudImg,
    formats: ['Vector SVG', 'After Effects (.aep)', 'JSON Lottie', 'Three.js Shaders'],
    specs: {
      resolution: 'Infinite Vector / 4K Pre-rendered',
      softwareCompatible: ['Figma', 'After Effects', 'Web (React / Canvas)', 'Unreal Engine UMG'],
      fileSize: '310 MB'
    },
    geometryType: 'mecha-chassis',
    tags: ['Holographic', 'HUD', 'Sci-Fi UI', 'Telemetry', 'Vector Graphics'],
    downloadsCount: 3100,
    rating: 4.94,
    releaseDate: 'October 2026'
  },
  {
    id: 'apex-hologram-glass',
    title: 'Spectral Iridescence & Glass Shaders',
    category: 'shaders-glsl',
    tagline: 'Real-time raymarching thin-film interference and chromatic dispersion',
    description: 'An advanced library of 18 production-ready GLSL & HLSL shader graphs. Features physical Cauchy dispersion, metallic thin-film iridescence, frosted micro-roughness, and WebGL 2.0 fallback compatibility.',
    price: 55,
    featured: true,
    thumbnailUrl: heroImg,
    formats: ['.glsl', '.hlsl', 'Unreal Material Functions', 'Unity ShaderGraph'],
    specs: {
      resolution: 'Procedural Real-Time',
      softwareCompatible: ['Three.js', 'PlayCanvas', 'Unreal Engine 5', 'Unity 6'],
      fileSize: '85 MB'
    },
    geometryType: 'hyper-torus',
    tags: ['GLSL', 'Shaders', 'Iridescent', 'Raymarching', 'Glass Dispersion'],
    downloadsCount: 1890,
    rating: 4.99,
    releaseDate: 'August 2026'
  },
  {
    id: 'apex-quantum-particles',
    title: 'Stardust Nebula Particle Simulator',
    category: 'particles-sim',
    tagline: 'GPU-accelerated force-field particle systems with curl noise turbulence',
    description: 'Dynamic particle field presets calculated via GPU compute shaders. Create cosmic nebula storms, kinetic shockwaves, and responsive cursor force fields with up to 100,000 concurrent particles.',
    price: 45,
    thumbnailUrl: heroImg,
    formats: ['Three.js InstancedBuffer', 'Houdini .hip', 'Bake .vdb', 'GLTF Buffer'],
    specs: {
      polyCount: '100k GPU Particles',
      softwareCompatible: ['Three.js / WebGL', 'Houdini', 'Blender Geometry Nodes'],
      fileSize: '190 MB'
    },
    geometryType: 'cyber-icosahedron',
    tags: ['Particles', 'Compute Shaders', 'VFX', 'Simulation', 'Turbulence'],
    downloadsCount: 970,
    rating: 4.92,
    releaseDate: 'October 2026'
  },
  {
    id: 'apex-hyper-torus',
    title: 'Hyper-Dimensional Torus Knot Mesh',
    category: '3d-geometry',
    tagline: 'High-frequency topological continuous loop with kinetic UV unwrapping',
    description: 'A topologically pristine 3D torus knot mesh with optimized quad topology, quad-subdivision support, seamless UV mapping for streaming animated displacement textures, and studio render presets.',
    price: 35,
    thumbnailUrl: fluidImg,
    formats: ['.blend', '.fbx', '.obj', '.usd'],
    specs: {
      polyCount: '32,400 Quads',
      resolution: '4K Normal + Displacement Maps',
      softwareCompatible: ['Blender', 'Maya', 'Cinema 4D', 'ZBrush'],
      fileSize: '240 MB'
    },
    geometryType: 'hyper-torus',
    tags: ['3D Geometry', 'Topology', 'Mathematical', 'Abstract', 'Hard-Surface'],
    downloadsCount: 1250,
    rating: 4.89,
    releaseDate: 'July 2026'
  }
];

export const CLIENT_TESTIMONIALS = [
  {
    name: 'Soren Lindqvist',
    role: 'Lead Visual Director',
    organization: 'Nordic Motion Labs (Stockholm)',
    quote: 'The procedural crystal assets and Three.js shader implementations slashed our title sequence delivery from 3 weeks to 4 days. Unmatched optical fidelity.'
  },
  {
    name: 'Elena Rostova',
    role: 'Senior Technical Artist',
    organization: 'Cybernetics Interactive',
    quote: 'Apex’s geometry packs are genuinely production-ready. Pristine quad topology, flawless UV unwrap, and instant WebGL exports without polygon clutter.'
  },
  {
    name: 'Marcus Vance',
    role: 'Creative Technologist',
    organization: 'Vance Spatial Systems (SF)',
    quote: 'We embedded their shader code straight into our interactive spatial web app. 60 FPS rock-solid performance on both desktop and mobile WebGL.'
  }
];
