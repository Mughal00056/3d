export type AssetCategory = 'all' | '3d-geometry' | 'kinetic-vfx' | 'shaders-glsl' | 'cyber-hud' | 'particles-sim';

export type LicenseType = 'personal' | 'commercial' | 'extended';

export interface LicenseTier {
  type: LicenseType;
  name: string;
  multiplier: number;
  description: string;
}

export type GeometryType = 'quantum-prism' | 'hyper-torus' | 'cyber-icosahedron' | 'liquid-sphere' | 'mecha-chassis';

export type ShadingPreset = 'iridescent' | 'chrome' | 'hologram' | 'wireframe' | 'cyberpunk-neon';

export interface GraphicsAsset {
  id: string;
  title: string;
  category: Exclude<AssetCategory, 'all'>;
  tagline: string;
  description: string;
  price: number;
  featured?: boolean;
  thumbnailUrl: string;
  formats: string[];
  specs: {
    polyCount?: string;
    resolution?: string;
    softwareCompatible: string[];
    fileSize: string;
    frameCount?: string;
  };
  geometryType: GeometryType;
  tags: string[];
  downloadsCount: number;
  rating: number;
  releaseDate: string;
}

export interface CartItem {
  asset: GraphicsAsset;
  license: LicenseType;
  unitPrice: number;
  addedAt: number;
}
