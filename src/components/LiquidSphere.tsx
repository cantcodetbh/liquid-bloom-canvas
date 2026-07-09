import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

// Cheap smooth noise for organic vertex displacement
const noise = (x: number, y: number, z: number, t: number) => {
  const a = Math.sin(x * 1.3 + t) * Math.cos(y * 1.7 - t * 0.9);
  const b = Math.sin(y * 1.1 - t * 0.8) * Math.cos(z * 1.5 + t * 0.7);
  const c = Math.sin(z * 1.4 + t * 0.6) * Math.cos(x * 1.2 - t);
  return (a + b + c) / 3;
};

// Wordmark plane rendered in-scene so MeshTransmissionMaterial refracts it.
function BackgroundWordmark() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4096;
    c.height = 1024;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#F6F0E6";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font =
      "800 780px 'Inter Tight', ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("nodeyard", c.width / 2, c.height / 2 + 30);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[22, 5.5]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

type BlobProps = {
  radius: number;
  offsetPhase: number;
  seed: number;
  positionFn: (t: number) => [number, number, number];
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
    const t = state.clock.getElapsedTime() * 0.3 + offsetPhase;
    const pos = geometry.attributes.position.array as Float32Array;

    const partner = positionFn(t);
    const other = positionFn(t + Math.PI);
    const dx = other[0] - partner[0];
    const dist = Math.hypot(dx, other[1] - partner[1]);
    const merge = Math.max(0, 1 - dist / 1.6);

    for (let i = 0; i < pos.length; i += 3) {
      const ox = original[i];
      const oy = original[i + 1];
      const oz = original[i + 2];

      const n1 = noise(ox * 1.6 + seed, oy * 1.6, oz * 1.6, t);
      const n2 = noise(ox * 3.4 + seed * 2, oy * 3.4, oz * 3.4, t * 1.4);
      const disp = 1 + n1 * 0.22 + n2 * 0.11;

      const pullDir = Math.sign(-dx || 1);
      const pull =
        merge * 0.4 * (ox * pullDir > 0 ? 1 : 0) * (Math.abs(ox) / radius);

      pos[i] = ox * disp + pull * pullDir;
      pos[i + 1] = oy * disp;
      pos[i + 2] = oz * disp;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    if (meshRef.current) {
      const p = positionFn(t);
      meshRef.current.position.set(p[0], p[1], p[2]);
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
      if (stretchFn) {
        const s = stretchFn(t);
        meshRef.current.scale.set(s[0], s[1], s[2]);
      }
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      {/* Pure water: no reflections, no clearcoat, mostly transparent,
          heavy chromatic dispersion so the wordmark bends through it. */}
      <MeshTransmissionMaterial
        samples={10}
        resolution={1024}
        transmission={1}
        roughness={0}
        thickness={0.6}
        ior={1.33}
        chromaticAberration={1.6}
        anisotropy={0}
        distortion={0.25}
        distortionScale={0.4}
        temporalDistortion={0.05}
        backside
        backsideThickness={0.3}
        clearcoat={0}
        clearcoatRoughness={1}
        attenuationDistance={10}
        attenuationColor="#ffffff"
        color="#ffffff"
        reflectivity={0}
        metalness={0}
      />
    </mesh>
  );
}

function Water() {
  const positionA = (t: number): [number, number, number] => {
    const sep = (1 - Math.cos(t * 0.5)) * 0.75;
    const bobY = Math.sin(t * 0.7) * 0.12;
    return [-sep, bobY, 0];
  };
  const positionB = (t: number): [number, number, number] => {
    const sep = (1 - Math.cos(t * 0.5)) * 0.75;
    const bobY = Math.cos(t * 0.6) * 0.1;
    return [sep, -bobY, 0];
  };
  const stretchA = (t: number): [number, number, number] => {
    const sep = (1 - Math.cos(t * 0.5)) * 0.75;
    const merge = Math.max(0, 1 - sep / 0.9);
    return [1 + merge * 0.28, 1 - merge * 0.12, 1 - merge * 0.06];
  };

  return (
    <>
      <WaterBlob
        radius={0.9}
        offsetPhase={0}
        seed={0}
        positionFn={positionA}
        stretchFn={stretchA}
      />
      <WaterBlob
        radius={0.82}
        offsetPhase={Math.PI * 0.5}
        seed={11}
        positionFn={positionB}
        stretchFn={stretchA}
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
      {/* Flat ambient only — no directional highlights, no environment,
          so the material shows refraction of the wordmark rather than
          reflecting studio lights (which read as chrome/pearl). */}
      <ambientLight intensity={1} />
      <Suspense fallback={null}>
        <BackgroundWordmark />
        <Water />
      </Suspense>
    </Canvas>
  );
}
