import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

// Smooth pseudo-noise for organic vertex displacement
const noise = (x: number, y: number, z: number, t: number) => {
  const a = Math.sin(x * 1.3 + t) * Math.cos(y * 1.7 - t * 0.9);
  const b = Math.sin(y * 1.1 - t * 0.8) * Math.cos(z * 1.5 + t * 0.7);
  const c = Math.sin(z * 1.4 + t * 0.6) * Math.cos(x * 1.2 - t);
  return (a + b + c) / 3;
};

type BlobProps = {
  radius: number;
  offsetPhase: number;
  seed: number;
  // Position offset function based on time (drives split/merge)
  positionFn: (t: number) => [number, number, number];
  // Scale multiplier over time (stretch toward partner during merge)
  stretchFn?: (t: number) => [number, number, number];
};

function WaterBlob({ radius, offsetPhase, seed, positionFn, stretchFn }: BlobProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(
    () => new THREE.IcosahedronGeometry(radius, 48),
    [radius],
  );
  const original = useMemo(() => {
    const pos = geometry.attributes.position.array as Float32Array;
    return new Float32Array(pos);
  }, [geometry]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.35 + offsetPhase;
    const pos = geometry.attributes.position.array as Float32Array;

    // Distance-to-partner factor: when spheres are close, elongate toward each other
    const partner = positionFn(t);
    const self = positionFn(t + Math.PI); // opposite phase for reference
    const dx = self[0] - partner[0];
    const dist = Math.hypot(dx, self[1] - partner[1]);
    // stretch strength high when close, low when far
    const merge = Math.max(0, 1 - dist / 1.6);

    for (let i = 0; i < pos.length; i += 3) {
      const ox = original[i];
      const oy = original[i + 1];
      const oz = original[i + 2];

      const n1 = noise(ox * 1.6 + seed, oy * 1.6, oz * 1.6, t);
      const n2 = noise(ox * 3.4 + seed * 2, oy * 3.4, oz * 3.4, t * 1.4);
      const n3 = noise(ox * 6.0, oy * 6.0, oz * 6.0, t * 0.8);
      // organic water wobble
      const disp = 1 + n1 * 0.22 + n2 * 0.12 + n3 * 0.05;

      // Stretch along X toward partner when close (surface-tension pull)
      const pullDir = Math.sign(-dx || 1);
      const pull = merge * 0.35 * (ox * pullDir > 0 ? 1 : 0) * (Math.abs(ox) / radius);

      pos[i] = ox * disp + pull * pullDir;
      pos[i + 1] = oy * disp;
      pos[i + 2] = oz * disp;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    if (meshRef.current) {
      const p = positionFn(t);
      meshRef.current.position.set(p[0], p[1], p[2]);
      meshRef.current.rotation.y = t * 0.25;
      meshRef.current.rotation.x = Math.sin(t * 0.35) * 0.2;
      if (stretchFn) {
        const s = stretchFn(t);
        meshRef.current.scale.set(s[0], s[1], s[2]);
      }
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <MeshTransmissionMaterial
        samples={8}
        resolution={512}
        transmission={1}
        roughness={0.02}
        thickness={0.35}
        ior={1.33}
        chromaticAberration={1.4}
        anisotropy={0.1}
        distortion={0.35}
        distortionScale={0.6}
        temporalDistortion={0.08}
        backside
        backsideThickness={0.2}
        clearcoat={1}
        clearcoatRoughness={0}
        attenuationDistance={4}
        attenuationColor="#c9f0e4"
        color="#ffffff"
        reflectivity={0.15}
      />
    </mesh>
  );
}

function Water() {
  // Two blobs that drift apart and merge back — zero-g water splitting
  const positionA = (t: number): [number, number, number] => {
    // separation oscillates 0 (merged) -> 1.4 (apart)
    const sep = (1 - Math.cos(t * 0.5)) * 0.7;
    const bobY = Math.sin(t * 0.7) * 0.15;
    return [-sep, bobY, 0];
  };
  const positionB = (t: number): [number, number, number] => {
    const sep = (1 - Math.cos(t * 0.5)) * 0.7;
    const bobY = Math.cos(t * 0.6) * 0.12;
    return [sep, -bobY, 0];
  };

  const stretchA = (t: number): [number, number, number] => {
    const sep = (1 - Math.cos(t * 0.5)) * 0.7;
    const merge = Math.max(0, 1 - sep / 0.9);
    // when merging: fatter along X, squished on Y (surface tension)
    return [1 + merge * 0.25, 1 - merge * 0.1, 1 - merge * 0.05];
  };
  const stretchB = stretchA;

  return (
    <>
      <WaterBlob
        radius={0.85}
        offsetPhase={0}
        seed={0}
        positionFn={positionA}
        stretchFn={stretchA}
      />
      <WaterBlob
        radius={0.78}
        offsetPhase={Math.PI * 0.5}
        seed={11}
        positionFn={positionB}
        stretchFn={stretchB}
      />
    </>
  );
}

export function LiquidSphere() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Soft, non-metallic lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 3]} intensity={0.35} />
      <directionalLight position={[-3, -2, 2]} intensity={0.2} color="#a8e6d5" />
      <Suspense fallback={null}>
        <Water />
        {/* No background: environment only lights the water */}
        <Environment preset="apartment" background={false} />
      </Suspense>
    </Canvas>
  );
}
