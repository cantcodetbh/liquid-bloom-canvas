import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

// Full-viewport teal backdrop so the transmission material samples the
// hero's teal colour instead of the transparent (black) canvas clear.
function TealBackdrop() {
  const { viewport } = useThree();
  return (
    <mesh position={[0, 0, -4]}>
      <planeGeometry args={[viewport.width * 4, viewport.height * 4]} />
      <meshBasicMaterial color="#2D9B83" toneMapped={false} />
    </mesh>
  );
}

// Wordmark plane rendered in-scene so MeshTransmissionMaterial refracts it.
function BackgroundWordmark() {
  const { viewport } = useThree();
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
      "800 900px 'Inter Tight', ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("nodeyard", c.width / 2, c.height / 2 + 30);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Fit wordmark to ~98% of viewport width, keeping the 4:1 texture ratio.
  const width = viewport.width * 0.98;
  const height = width / 4;

  return (
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

function WaterBlob() {
  const meshRef = useRef<THREE.Mesh>(null);
  const radius = 1.05;
  const geometry = useMemo(
    () => new THREE.IcosahedronGeometry(radius, 64),
    [],
  );
  const original = useMemo(() => {
    const pos = geometry.attributes.position.array as Float32Array;
    return new Float32Array(pos);
  }, [geometry]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.35;
    const pos = geometry.attributes.position.array as Float32Array;

    // "Necking" cycle 0..1..0 — at peak the blob pinches in the middle and
    // stretches outward, looking like it's about to split into two, then
    // eases back into a single sphere.
    const neck = (1 - Math.cos(t * 0.6)) * 0.5; // 0..1

    for (let i = 0; i < pos.length; i += 3) {
      const ox = original[i];
      const oy = original[i + 1];
      const oz = original[i + 2];

      // Organic wobble
      const n1 = noise(ox * 1.6, oy * 1.6, oz * 1.6, t);
      const n2 = noise(ox * 3.2, oy * 3.2, oz * 3.2, t * 1.5);
      const disp = 1 + n1 * 0.14 + n2 * 0.07;

      let x = ox * disp;
      let y = oy * disp;
      let z = oz * disp;

      // Dumbbell / peanut deformation along X:
      // Squeeze the middle (small |x|) in Y and Z, and push lobes outward in X.
      const nx = ox / radius; // -1..1
      const pinch = 1 - neck * 0.55 * (1 - nx * nx); // stronger at centre
      y *= pinch;
      z *= pinch;
      x += Math.sign(nx || 1) * neck * 0.35 * Math.abs(nx);

      pos[i] = x;
      pos[i + 1] = y;
      pos[i + 2] = z;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.25;
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.18;
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <MeshTransmissionMaterial
        samples={12}
        resolution={1024}
        transmission={1}
        roughness={0}
        thickness={0.5}
        ior={1.33}
        chromaticAberration={1.4}
        anisotropy={0}
        distortion={0.35}
        distortionScale={0.5}
        temporalDistortion={0.08}
        backside
        backsideThickness={0.25}
        clearcoat={0}
        clearcoatRoughness={1}
        attenuationDistance={12}
        attenuationColor="#e8fff8"
        color="#ffffff"
        reflectivity={0}
        metalness={0}
      />
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
      <ambientLight intensity={1.2} />
      <Suspense fallback={null}>
        <TealBackdrop />
        <BackgroundWordmark />
        <WaterBlob />
      </Suspense>
    </Canvas>
  );
}
