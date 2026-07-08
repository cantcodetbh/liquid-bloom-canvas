import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

// Classic 3D simplex noise (Ashima) — used to deform vertices for liquid feel
const noise = (() => {
  // Lightweight pseudo simplex via layered sin/cos for cheap smooth deformation
  return (x: number, y: number, z: number, t: number) => {
    const a = Math.sin(x * 1.3 + t) * Math.cos(y * 1.7 - t * 0.9);
    const b = Math.sin(y * 1.1 - t * 0.8) * Math.cos(z * 1.5 + t * 0.7);
    const c = Math.sin(z * 1.4 + t * 0.6) * Math.cos(x * 1.2 - t);
    return (a + b + c) / 3;
  };
})();

function Blob() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.15, 64), []);
  const original = useMemo(() => {
    const pos = geometry.attributes.position.array as Float32Array;
    return new Float32Array(pos);
  }, [geometry]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.35;
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const ox = original[i];
      const oy = original[i + 1];
      const oz = original[i + 2];
      const n = noise(ox * 1.4, oy * 1.4, oz * 1.4, t);
      const disp = 1 + n * 0.14;
      pos[i] = ox * disp;
      pos[i + 1] = oy * disp;
      pos[i + 2] = oz * disp;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.5;
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <MeshTransmissionMaterial
        samples={6}
        resolution={512}
        transmission={1}
        roughness={0.05}
        thickness={1.4}
        ior={1.4}
        chromaticAberration={0.35}
        anisotropy={0.4}
        distortion={0.4}
        distortionScale={0.3}
        temporalDistortion={0.1}
        backside
        backsideThickness={0.6}
        clearcoat={1}
        clearcoatRoughness={0.1}
        attenuationDistance={1}
        attenuationColor="#ffffff"
        color="#ffffff"
      />
    </mesh>
  );
}

export function LiquidSphere() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 3.2], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 3, 3]} intensity={1.2} />
      <directionalLight position={[-3, -2, -1]} intensity={0.6} color="#8ab4ff" />
      <Suspense fallback={null}>
        <Blob />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  );
}
