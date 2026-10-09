import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GeometryType, ShadingPreset } from '../types';
import { Sparkles, Activity, Layers, RotateCcw, Eye, Zap } from 'lucide-react';

interface Hero3DCanvasProps {
  onExploreCatalog?: () => void;
  onOpenViewer?: (geomType: GeometryType) => void;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ onExploreCatalog, onOpenViewer }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Interactive control states
  const [geometryType, setGeometryType] = useState<GeometryType>('quantum-prism');
  const [shadingPreset, setShadingPreset] = useState<ShadingPreset>('iridescent');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [audioPulseActive, setAudioPulseActive] = useState<boolean>(false);
  const [exploded, setExploded] = useState<boolean>(false);

  // References for animation loop updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainMeshRef = useRef<THREE.Mesh | null>(null);
  const innerMeshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const lightsRef = useRef<{
    point1: THREE.PointLight;
    point2: THREE.PointLight;
    ambient: THREE.AmbientLight;
  } | null>(null);

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animFrameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());

  // Setup Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Renderer with high performance & antialiasing
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x06b6d4, 4, 20); // Cyan
    pointLight1.position.set(5, 4, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xa855f7, 4, 20); // Purple / Violet
    pointLight2.position.set(-5, -4, 4);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xec4899, 2.5, 15); // Magenta
    pointLight3.position.set(0, 6, -3);
    scene.add(pointLight3);

    lightsRef.current = {
      point1: pointLight1,
      point2: pointLight2,
      ambient: ambientLight
    };

    // Particles system
    const particleCount = 700;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const colorA = new THREE.Color(0x06b6d4); // Cyan
    const colorB = new THREE.Color(0xa855f7); // Violet
    const colorC = new THREE.Color(0x38bdf8); // Sky

    for (let i = 0; i < particleCount; i++) {
      const radius = 3.5 + Math.random() * 5.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = i % 3 === 0 ? colorA : i % 3 === 1 ? colorB : colorC;
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particleSystemRef.current = particles;

    // Mouse Tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 1.2;
      mouseRef.current.targetY = y * 1.2;
    };

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handleMouseMove);

    // Render loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      const elapsedTime = clockRef.current.getElapsedTime();

      // Damped mouse rotation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Audio beat simulation pulse
      let beatScale = 1.0;
      if (audioPulseActive) {
        // Synthesize dynamic rhythm: 128 BPM = ~2.13 beats/sec
        const beatCycle = Math.sin(elapsedTime * 8);
        const subBeat = Math.sin(elapsedTime * 16) * 0.5;
        beatScale = 1.0 + Math.max(0, beatCycle + subBeat) * 0.12;

        if (lightsRef.current) {
          lightsRef.current.point1.intensity = 4 + Math.max(0, beatCycle) * 3;
          lightsRef.current.point2.intensity = 4 + Math.max(0, subBeat) * 2.5;
        }
      }

      // Rotate particles
      if (particleSystemRef.current) {
        particleSystemRef.current.rotation.y = elapsedTime * 0.06 * rotationSpeed;
        particleSystemRef.current.rotation.x = Math.sin(elapsedTime * 0.03) * 0.2;
      }

      // Main Mesh Animation
      if (mainMeshRef.current) {
        const mesh = mainMeshRef.current;
        mesh.rotation.y += delta * 0.45 * rotationSpeed;
        mesh.rotation.x += delta * 0.3 * rotationSpeed;
        mesh.rotation.z = Math.sin(elapsedTime * 0.5) * 0.15;

        // Apply mouse orientation
        mesh.position.x = mouseRef.current.x * 0.6;
        mesh.position.y = mouseRef.current.y * 0.6;

        // Exploded shell animation
        const targetScale = (exploded ? 1.4 : 1.0) * beatScale;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

        // Dynamic vertex wave if liquid sphere
        if (geometryType === 'liquid-sphere' && mesh.geometry) {
          const pos = mesh.geometry.attributes.position;
          const count = pos.count;
          for (let i = 0; i < count; i++) {
            const u = i / count;
            const wave = Math.sin(elapsedTime * 3 + u * 10) * 0.003;
            pos.setY(i, pos.getY(i) + wave);
          }
          pos.needsUpdate = true;
        }
      }

      // Inner Core Mesh Animation
      if (innerMeshRef.current) {
        const inner = innerMeshRef.current;
        inner.rotation.y -= delta * 0.7 * rotationSpeed;
        inner.rotation.z += delta * 0.5 * rotationSpeed;
        inner.position.x = mouseRef.current.x * 0.6;
        inner.position.y = mouseRef.current.y * 0.6;
        const innerTargetScale = (exploded ? 0.6 : 0.8) * beatScale;
        inner.scale.lerp(new THREE.Vector3(innerTargetScale, innerTargetScale, innerTargetScale), 0.08);
      }

      // Wireframe overlay mesh
      if (wireframeMeshRef.current) {
        const wire = wireframeMeshRef.current;
        if (mainMeshRef.current) {
          wire.rotation.copy(mainMeshRef.current.rotation);
          wire.position.copy(mainMeshRef.current.position);
          const wireTargetScale = (exploded ? 1.6 : 1.03) * beatScale;
          wire.scale.lerp(new THREE.Vector3(wireTargetScale, wireTargetScale, wireTargetScale), 0.08);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update Geometry & Materials when type or preset changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up previous main mesh & wireframe
    if (mainMeshRef.current) {
      scene.remove(mainMeshRef.current);
      mainMeshRef.current.geometry.dispose();
      if (Array.isArray(mainMeshRef.current.material)) {
        mainMeshRef.current.material.forEach((m) => m.dispose());
      } else {
        mainMeshRef.current.material.dispose();
      }
      mainMeshRef.current = null;
    }

    if (innerMeshRef.current) {
      scene.remove(innerMeshRef.current);
      innerMeshRef.current.geometry.dispose();
      if (Array.isArray(innerMeshRef.current.material)) {
        innerMeshRef.current.material.forEach((m) => m.dispose());
      } else {
        innerMeshRef.current.material.dispose();
      }
      innerMeshRef.current = null;
    }

    if (wireframeMeshRef.current) {
      scene.remove(wireframeMeshRef.current);
      wireframeMeshRef.current.geometry.dispose();
      if (Array.isArray(wireframeMeshRef.current.material)) {
        wireframeMeshRef.current.material.forEach((m) => m.dispose());
      } else {
        wireframeMeshRef.current.material.dispose();
      }
      wireframeMeshRef.current = null;
    }

    // Create appropriate geometry
    let mainGeometry: THREE.BufferGeometry;
    let innerGeometry: THREE.BufferGeometry;

    switch (geometryType) {
      case 'quantum-prism':
        mainGeometry = new THREE.OctahedronGeometry(2.0, 2);
        innerGeometry = new THREE.IcosahedronGeometry(1.2, 1);
        break;
      case 'hyper-torus':
        mainGeometry = new THREE.TorusKnotGeometry(1.4, 0.42, 128, 32, 2, 3);
        innerGeometry = new THREE.TorusGeometry(0.8, 0.15, 16, 64);
        break;
      case 'cyber-icosahedron':
        mainGeometry = new THREE.IcosahedronGeometry(2.1, 1);
        innerGeometry = new THREE.DodecahedronGeometry(1.3, 0);
        break;
      case 'liquid-sphere':
        mainGeometry = new THREE.SphereGeometry(1.9, 64, 64);
        innerGeometry = new THREE.OctahedronGeometry(1.1, 2);
        break;
      case 'mecha-chassis':
      default:
        mainGeometry = new THREE.BoxGeometry(2.2, 2.2, 2.2, 4, 4, 4);
        innerGeometry = new THREE.OctahedronGeometry(1.4, 1);
        break;
    }

    // Create Materials based on ShadingPreset
    let mainMaterial: THREE.Material;
    let innerMaterial: THREE.Material;

    switch (shadingPreset) {
      case 'chrome':
        mainMaterial = new THREE.MeshStandardMaterial({
          color: 0xcccccc,
          metalness: 0.95,
          roughness: 0.12,
          wireframe: wireframe
        });
        innerMaterial = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.8,
          wireframe: true
        });
        break;
      case 'hologram':
        mainMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.5,
          roughness: 0.1,
          transmission: 0.7,
          thickness: 1.5,
          transparent: true,
          opacity: 0.65,
          wireframe: wireframe
        });
        innerMaterial = new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          wireframe: true
        });
        break;
      case 'cyberpunk-neon':
        mainMaterial = new THREE.MeshStandardMaterial({
          color: 0x111827,
          roughness: 0.25,
          metalness: 0.85,
          emissive: 0xa855f7,
          emissiveIntensity: 0.35,
          wireframe: wireframe
        });
        innerMaterial = new THREE.MeshBasicMaterial({
          color: 0x06b6d4,
          wireframe: true
        });
        break;
      case 'wireframe':
        mainMaterial = new THREE.MeshBasicMaterial({
          color: 0x06b6d4,
          wireframe: true
        });
        innerMaterial = new THREE.MeshBasicMaterial({
          color: 0xec4899,
          wireframe: true
        });
        break;
      case 'iridescent':
      default:
        mainMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x0f172a,
          emissive: 0x1e1b4b,
          emissiveIntensity: 0.3,
          roughness: 0.15,
          metalness: 0.6,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          transmission: 0.6,
          ior: 1.6,
          wireframe: wireframe
        });
        innerMaterial = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0xa855f7,
          emissiveIntensity: 0.9,
          wireframe: true
        });
        break;
    }

    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
    scene.add(mainMesh);
    mainMeshRef.current = mainMesh;

    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);
    innerMeshRef.current = innerMesh;

    // Edge wireframe accent
    const edgesGeom = new THREE.EdgesGeometry(mainGeometry, 24);
    const wireframeLine = new THREE.LineSegments(
      edgesGeom,
      new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: wireframe ? 0.8 : 0.35
      })
    );
    scene.add(wireframeLine);
    wireframeMeshRef.current = wireframeLine;
  }, [geometryType, shadingPreset, wireframe]);

  return (
    <div className="relative w-full h-[580px] lg:h-[700px] overflow-hidden rounded-2xl bg-neutral-950/70 border border-neutral-800/80 shadow-2xl">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Subtle background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[380px] h-[380px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Overlay Headings & Value Proposition */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 max-w-xl pointer-events-none z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-md bg-neutral-900/80 border border-neutral-700/60 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-neutral-300">Apex Interactive 3D WebGL Engine</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white font-display leading-[1.15]">
          Hyper-Realistic 3D Assets & Kinetic Visuals
        </h1>

        <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-lg">
          Explore real-time procedural geometry, raymarched GLSL shaders, and 60FPS fluid loops engineered for motion studios, VFX artists, and spatial web experiences.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 pointer-events-auto">
          <button
            onClick={onExploreCatalog}
            className="px-5 py-2.5 text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] rounded-lg transition-all shadow-lg shadow-cyan-500/20"
          >
            Explore 3D Store Catalog
          </button>
          <button
            onClick={() => onOpenViewer?.(geometryType)}
            className="px-4 py-2.5 text-sm font-medium text-neutral-200 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg transition-all backdrop-blur-sm inline-flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            Launch 3D Studio Lab
          </button>
        </div>
      </div>

      {/* Floating 3D Parameter Dock (Top Right) */}
      <div className="absolute top-6 right-6 hidden md:flex flex-col gap-2 p-3 bg-neutral-950/80 border border-neutral-800/90 backdrop-blur-md rounded-xl text-xs z-10">
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-neutral-800 text-neutral-400">
          <span className="font-medium text-neutral-300">WebGL Viewport</span>
          <span className="font-mono text-cyan-400">60 FPS</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-neutral-400">
          <span>Geometry Type</span>
          <span className="font-mono text-neutral-200 capitalize">{geometryType.replace('-', ' ')}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-neutral-400">
          <span>Shading Preset</span>
          <span className="font-mono text-neutral-200 capitalize">{shadingPreset}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-neutral-400">
          <span>GPU Particles</span>
          <span className="font-mono text-neutral-200">700 Units</span>
        </div>
      </div>

      {/* Bottom Interactive Tweak Bar */}
      <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 p-3 bg-neutral-950/85 border border-neutral-800/90 backdrop-blur-lg rounded-xl z-10 flex flex-wrap items-center justify-between gap-3">
        {/* Geometry Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-xs text-neutral-400 font-medium mr-1.5 flex items-center gap-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Shape:
          </span>
          {(['quantum-prism', 'hyper-torus', 'cyber-icosahedron', 'liquid-sphere'] as GeometryType[]).map((type) => (
            <button
              key={type}
              onClick={() => setGeometryType(type)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                geometryType === type
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-transparent'
              }`}
            >
              {type === 'quantum-prism' && 'Prism Core'}
              {type === 'hyper-torus' && 'Hyper Torus'}
              {type === 'cyber-icosahedron' && 'Icosahedron'}
              {type === 'liquid-sphere' && 'Liquid Wave'}
            </button>
          ))}
        </div>

        {/* Shading & FX Controls */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {/* Shading mode selector */}
          <div className="flex items-center gap-1 bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800">
            {(['iridescent', 'chrome', 'hologram', 'cyberpunk-neon'] as ShadingPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => setShadingPreset(preset)}
                className={`px-2 py-0.5 text-xs rounded font-medium transition-colors whitespace-nowrap ${
                  shadingPreset === preset
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {preset === 'iridescent' && 'Iridescent'}
                {preset === 'chrome' && 'Chrome'}
                {preset === 'hologram' && 'Holo'}
                {preset === 'cyberpunk-neon' && 'Neon'}
              </button>
            ))}
          </div>

          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-all ${
              wireframe
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Wireframe
          </button>

          {/* Explode mesh toggle */}
          <button
            onClick={() => setExploded(!exploded)}
            className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-all ${
              exploded
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Explode
          </button>

          {/* Audio Beat Simulator */}
          <button
            onClick={() => setAudioPulseActive(!audioPulseActive)}
            className={`px-2.5 py-1 text-xs rounded-md border font-medium flex items-center gap-1.5 transition-all ${
              audioPulseActive
                ? 'bg-pink-500/20 border-pink-500/50 text-pink-300 shadow-sm shadow-pink-500/20'
                : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
            title="Simulate dynamic audio beat pulsing"
          >
            <Activity className={`w-3.5 h-3.5 ${audioPulseActive ? 'animate-bounce text-pink-400' : ''}`} />
            <span>{audioPulseActive ? 'Beat: 128 BPM' : 'Beat Mode'}</span>
          </button>

          {/* Speed slider */}
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-neutral-900/80 border border-neutral-800 rounded-lg text-xs text-neutral-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title="Rotation velocity"
            />
          </div>

          {/* Reset button */}
          <button
            onClick={() => {
              setGeometryType('quantum-prism');
              setShadingPreset('iridescent');
              setWireframe(false);
              setRotationSpeed(1.0);
              setAudioPulseActive(false);
              setExploded(false);
            }}
            className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors"
            title="Reset scene"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
