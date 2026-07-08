import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";


// Cheap smooth noise for vertex displacement
const noise = (x: number, y: number, z: number, t: number) => {
  const a = Math.sin(x * 1.3 + t) * Math.cos(y * 1.7 - t * 0.9);
  const b = Math.sin(y * 1.1 - t * 0.8) * Math.cos(z * 1.5 + t * 0.7);
  const c = Math.sin(z * 1.4 + t * 0.6) * Math.cos(x * 1.2 - t);
  return (a + b + c) / 3;
};

function Blob() {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.15, 64), []);
  const original = useMemo(() => {
    const pos = geometry.attributes.position.array as Float32Array;
    return new Float32Array(pos);
  }, [geometry]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.4;
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const ox = original[i];
      const oy = original[i + 1];
      const oz = original[i + 2];
      const n = noise(ox * 1.8, oy * 1.8, oz * 1.8, t);
      const n2 = noise(ox * 3.2 + 5, oy * 3.2, oz * 3.2, t * 1.3);
      const disp = 1 + n * 0.28 + n2 * 0.12;
      pos[i] = ox * disp;
      pos[i + 1] = oy * disp;
      pos[i + 2] = oz * disp;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.5;
      meshRef.current.rotation.x = Math.sin(t * 0.45) * 0.28;
      const s = 1 + Math.sin(t * 0.6) * 0.06;
      meshRef.current.scale.set(s, 1 + Math.cos(t * 0.5) * 0.05, s);
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <MeshTransmissionMaterial
        samples={10}
        resolution={1024}
        transmission={1}
        roughness={0.15}
        thickness={1.1}
        ior={1.42}
        chromaticAberration={0.9}
        anisotropy={0.6}
        distortion={0.6}
        distortionScale={0.5}
        temporalDistortion={0.18}
        backside
        backsideThickness={0.6}
        clearcoat={0}
        clearcoatRoughness={1}
        attenuationDistance={1.2}
        attenuationColor="#2D9B83"
        color="#f4fbf7"
      />
    </mesh>
  );
}


// A large text plane behind the sphere so the transmission material
// refracts the "nodeyard" wordmark through the glass.
// Wordmark rendered to a canvas texture on a plane behind the sphere,
// so the transmission material physically refracts the "nodeyard" text.
function BackgroundWordmark() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4096;
    c.height = 768;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#F6F0E6";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 640px 'Inter Tight', system-ui, sans-serif";
    ctx.fillText("nodeyard", c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <mesh position={[0, 0, -1.4]}>
      <planeGeometry args={[18, 3.4]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
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
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 3, 3]} intensity={0.5} />
      <directionalLight position={[-3, -2, -1]} intensity={0.3} color="#2D9B83" />
      <Suspense fallback={null}>
        <BackgroundWordmark />
        <Blob />
        <Environment preset="apartment" background={false} />
      </Suspense>
    </Canvas>
  );
}

