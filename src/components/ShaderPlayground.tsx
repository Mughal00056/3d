import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sliders, Copy, Check, Sparkles, Volume2, Play } from 'lucide-react';

export const ShaderPlayground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Interactive shader parameters
  const [distortion, setDistortion] = useState<number>(1.8);
  const [speed, setSpeed] = useState<number>(1.2);
  const [aberration, setAberration] = useState<number>(0.6);
  const [colorMode, setColorMode] = useState<'cyan-violet' | 'solar-gold' | 'chrome' | 'emerald'>('cyan-violet');
  const [copied, setCopied] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  const uniformsRef = useRef<{
    uTime: { value: number };
    uDistortion: { value: number };
    uAberration: { value: number };
    uColorMode: { value: number };
    uPulse: { value: number };
  }>({
    uTime: { value: 0 },
    uDistortion: { value: 1.8 },
    uAberration: { value: 0.6 },
    uColorMode: { value: 0 },
    uPulse: { value: 0 }
  });

  const animFrameRef = useRef<number>(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Custom Vertex Shader
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      uniform float uTime;
      uniform float uDistortion;
      uniform float uPulse;

      void main() {
        vUv = uv;
        vNormal = normal;
        
        vec3 pos = position;
        float displacement = sin(pos.x * uDistortion + uTime * 2.0) * 
                             cos(pos.y * uDistortion + uTime * 1.5) * 
                             sin(pos.z * uDistortion + uTime * 1.8) * 0.25;
        
        displacement += uPulse * 0.15 * sin(length(pos) * 6.0 - uTime * 6.0);
        
        pos += normal * displacement;
        vPosition = pos;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    // Custom Fragment Shader with Iridescence & Chromatic Aberration
    const fragmentShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      uniform float uTime;
      uniform float uAberration;
      uniform float uColorMode;

      vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec3 norm = normalize(vNormal);
        vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0) - vPosition);
        float fresnel = pow(1.0 - max(dot(norm, viewDir), 0.0), 3.0);

        float t = length(vPosition) * 0.5 + uTime * 0.3 + fresnel * uAberration;

        vec3 color;
        if (uColorMode < 0.5) {
          // Cyan & Violet
          color = palette(t, vec3(0.1, 0.2, 0.4), vec3(0.5, 0.4, 0.6), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.33, 0.67));
        } else if (uColorMode < 1.5) {
          // Solar Gold
          color = palette(t, vec3(0.4, 0.2, 0.0), vec3(0.6, 0.4, 0.1), vec3(1.0, 1.0, 0.8), vec3(0.1, 0.2, 0.3));
        } else if (uColorMode < 2.5) {
          // Chrome Silver
          color = vec3(0.7) + vec3(0.3) * cos(6.28318 * (vec3(1.0) * t + vec3(0.2, 0.4, 0.6)));
        } else {
          // Emerald Bioluminescent
          color = palette(t, vec3(0.05, 0.3, 0.2), vec3(0.2, 0.6, 0.4), vec3(1.0, 1.2, 1.0), vec3(0.2, 0.5, 0.8));
        }

        color += fresnel * 0.6;
        gl_FragColor = vec4(color, 0.95);
      }
    `;

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current,
      wireframe: false,
      transparent: true
    });

    const geometry = new THREE.IcosahedronGeometry(1.6, 24);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    const wireframeGeom = new THREE.IcosahedronGeometry(1.62, 6);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const wireMesh = new THREE.Mesh(wireframeGeom, wireframeMat);
    scene.add(wireMesh);

    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      uniformsRef.current.uTime.value += delta * speed;
      mesh.rotation.y += delta * 0.3 * speed;
      mesh.rotation.x += delta * 0.2 * speed;
      wireMesh.rotation.copy(mesh.rotation);

      if (pulseActive) {
        uniformsRef.current.uPulse.value = Math.sin(elapsed * 8) * 0.5 + 0.5;
      } else {
        uniformsRef.current.uPulse.value = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update uniforms when React states change
  useEffect(() => {
    uniformsRef.current.uDistortion.value = distortion;
  }, [distortion]);

  useEffect(() => {
    uniformsRef.current.uAberration.value = aberration;
  }, [aberration]);

  useEffect(() => {
    const modeIdx =
      colorMode === 'cyan-violet' ? 0 : colorMode === 'solar-gold' ? 1 : colorMode === 'chrome' ? 2 : 3;
    uniformsRef.current.uColorMode.value = modeIdx;
  }, [colorMode]);

  const copyShaderSnippet = () => {
    const snippet = `// Apex GLSL Real-Time Iridescence Shader
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;

vec3 getApexIridescence(vec3 normal, vec3 viewDir, float t) {
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
  vec3 a = vec3(0.1, 0.2, 0.4);
  vec3 b = vec3(0.5, 0.4, 0.6);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.0, 0.33, 0.67);
  return a + b * cos(6.28318 * (c * (length(vPosition) * 0.5 + t + fresnel * ${aberration.toFixed(2)}) + d));
}`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden relative">
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Text & Parameter Sliders */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-800/80 border border-neutral-700/60 text-xs font-medium text-cyan-400 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive GLSL Shader Sandbox</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Live Procedural Shader Engine
              </h2>
              <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                Test real-time mathematical vertex displacement and chromatic dispersion algorithms before purchasing. All shader assets include clean WebGL & Three.js boilerplate.
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-4 p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs">
              {/* Color Mode selection */}
              <div>
                <label className="text-neutral-400 font-medium block mb-2">Spectral Color Palette:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cyan-violet', label: 'Cyan & Violet' },
                    { id: 'solar-gold', label: 'Solar Amber' },
                    { id: 'chrome', label: 'Liquid Chrome' },
                    { id: 'emerald', label: 'Bioluminescent' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setColorMode(item.id as any)}
                      className={`py-1.5 px-3 rounded-lg border font-medium transition-all ${
                        colorMode === item.id
                          ? 'bg-neutral-800 text-cyan-300 border-cyan-500/40 shadow-sm'
                          : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distortion slider */}
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Surface Turbulence</span>
                  <span className="font-mono text-cyan-400">{distortion.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={distortion}
                  onChange={(e) => setDistortion(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Aberration slider */}
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Chromatic Dispersion</span>
                  <span className="font-mono text-cyan-400">{aberration.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={aberration}
                  onChange={(e) => setAberration(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Speed slider */}
              <div>
                <div className="flex justify-between text-neutral-400 mb-1">
                  <span>Wave Velocity</span>
                  <span className="font-mono text-cyan-400">{speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Pulse & Reset toggles */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                <button
                  onClick={() => setPulseActive(!pulseActive)}
                  className={`flex-1 py-2 px-3 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                    pulseActive
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{pulseActive ? 'Beat Modulating' : 'Audio Modulator'}</span>
                </button>

                <button
                  onClick={copyShaderSnippet}
                  className="py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-medium flex items-center gap-1.5 transition-colors"
                  title="Copy GLSL code function"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy GLSL'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Interactive 3D Canvas Box */}
          <div className="lg:col-span-7 h-[420px] sm:h-[480px] w-full relative rounded-2xl bg-neutral-950/90 border border-neutral-800 overflow-hidden shadow-inner flex items-center justify-center">
            <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-pointer" />
            <div className="absolute top-3 right-3 px-2 py-1 bg-neutral-900/80 border border-neutral-800 rounded text-[11px] font-mono text-neutral-400 backdrop-blur-sm pointer-events-none">
              GLSL · Dynamic Normal Fresnel
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
