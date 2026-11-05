import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface Spatial3DConfig {
  geometryType: 'torusknot' | 'icosahedron' | 'tesseract' | 'sphere' | 'waveRing';
  wireframe: boolean;
  roughness: number;
  transmission: number;
  rotationSpeed: number;
  rimColor: string;
  immersion: number; // 0 - 100
  showParticles: boolean;
  interactive: boolean;
}

interface SpatialCanvas3DProps {
  config: Spatial3DConfig;
  onPointerMove?: (x: number, y: number) => void;
}

export const SpatialCanvas3D: React.FC<SpatialCanvas3DProps> = ({ config, onPointerMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });
  const reqIdRef = useRef<number | null>(null);
  const rimLightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.8);
    fillLight.position.set(-4, -2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(new THREE.Color(config.rimColor), 3, 20);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Starfield / Particle Cloud
    const particleCount = 1000;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 25;
      particlePositions[i + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20;
      particleScales[i / 3] = Math.random() * 0.05 + 0.01;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Build Initial 3D Geometry
    const buildGeometry = (type: string): THREE.BufferGeometry => {
      switch (type) {
        case 'torusknot':
          return new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32, 2, 3);
        case 'icosahedron':
          return new THREE.IcosahedronGeometry(1.6, 2);
        case 'tesseract':
          return new THREE.BoxGeometry(2, 2, 2, 4, 4, 4);
        case 'sphere':
          return new THREE.SphereGeometry(1.6, 48, 48);
        case 'waveRing':
          return new THREE.TorusGeometry(1.5, 0.4, 32, 100);
        default:
          return new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32);
      }
    };

    const geometry = buildGeometry(config.geometryType);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: config.roughness,
      transmission: config.transmission,
      ior: 1.5,
      thickness: 1.2,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(config.rimColor),
      transparent: true,
      opacity: 0.88,
      wireframe: config.wireframe,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Wireframe Cage Overlay for spatial holograms
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(config.rimColor),
      transparent: true,
      opacity: 0.25,
      linewidth: 1,
    });
    const wireframeMesh = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    mesh.add(wireframeMesh);
    wireframeMeshRef.current = wireframeMesh;

    // Mouse Tracking
    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
      if (onPointerMove) onPointerMove(x, y);
    };

    window.addEventListener('mousemove', handlePointerMove);

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (meshRef.current) {
        const speed = config.rotationSpeed;
        meshRef.current.rotation.x += delta * speed * 0.4;
        meshRef.current.rotation.y += delta * speed * 0.6;

        // Subtle tilt responding to cursor
        meshRef.current.rotation.z = mouseRef.current.x * 0.2;
        meshRef.current.position.x = mouseRef.current.x * 0.5;
        meshRef.current.position.y = mouseRef.current.y * 0.5;
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y += delta * 0.03;
        particlesRef.current.rotation.x += delta * 0.015;
        // Parallax shift
        particlesRef.current.position.x = -mouseRef.current.x * 0.8;
        particlesRef.current.position.y = -mouseRef.current.y * 0.8;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Geometry & Materials when config changes
  useEffect(() => {
    if (!sceneRef.current || !meshRef.current) return;

    const buildGeometry = (type: string): THREE.BufferGeometry => {
      switch (type) {
        case 'torusknot':
          return new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32, 2, 3);
        case 'icosahedron':
          return new THREE.IcosahedronGeometry(1.6, 2);
        case 'tesseract':
          return new THREE.BoxGeometry(2, 2, 2, 4, 4, 4);
        case 'sphere':
          return new THREE.SphereGeometry(1.6, 48, 48);
        case 'waveRing':
          return new THREE.TorusGeometry(1.5, 0.4, 32, 100);
        default:
          return new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32);
      }
    };

    const newGeom = buildGeometry(config.geometryType);
    meshRef.current.geometry.dispose();
    meshRef.current.geometry = newGeom;

    if (wireframeMeshRef.current) {
      wireframeMeshRef.current.geometry.dispose();
      wireframeMeshRef.current.geometry = new THREE.WireframeGeometry(newGeom);
    }

    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    mat.wireframe = config.wireframe;
    mat.roughness = config.roughness;
    mat.transmission = config.transmission;
    mat.specularColor = new THREE.Color(config.rimColor);

    if (rimLightRef.current) {
      rimLightRef.current.color.set(config.rimColor);
    }

    if (particlesRef.current) {
      particlesRef.current.visible = config.showParticles;
      const pMat = particlesRef.current.material as THREE.PointsMaterial;
      pMat.opacity = Math.max(0.1, config.immersion / 100);
    }
  }, [config.geometryType, config.wireframe, config.roughness, config.transmission, config.rimColor, config.showParticles, config.immersion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        opacity: Math.max(0.15, config.immersion / 100),
        transition: 'opacity 0.4s ease',
      }}
    />
  );
};
