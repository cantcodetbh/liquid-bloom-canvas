import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  const { camera, viewport } = useThree();
  const wordmarkRef = useRef<THREE.Mesh>(null);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined" || !("fonts" in document)) {
      setFontsReady(true);
      return;
    }

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const texture = useMemo(() => {
    const text = "nodeyard";
    const c = document.createElement("canvas");
    c.width = 4096;
    c.height = 1024;

    const ctx = c.getContext("2d")!;
    const horizontalPadding = c.width * 0.002;
    const maxTextWidth = c.width - horizontalPadding * 2;

    ctx.clearRect(0, 0, c.width, c.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let fontSize = 920;
    const setFont = () => {
      ctx.font = `800 ${fontSize}px 'Inter Tight', ui-sans-serif, system-ui, sans-serif`;
    };

    setFont();

    while (ctx.measureText(text).width < maxTextWidth && fontSize < 1280) {
      fontSize += 8;
      setFont();
    }

    while (ctx.measureText(text).width > maxTextWidth && fontSize > 120) {
      fontSize -= 4;
      setFont();
    }

    const x = c.width / 2;
    const y = c.height / 2 + 28;

    // Subtle chromatic split baked into the wordmark texture. Kept tiny so it
    // reads as refraction/fringe, not cyberpunk karaoke.
    ctx.fillStyle = "rgba(255, 68, 94, 0.26)";
    ctx.fillText(text, x - 7, y);
    ctx.fillStyle = "rgba(68, 220, 255, 0.22)";
    ctx.fillText(text, x + 7, y);

    ctx.fillStyle = "#F6F0E6";
    ctx.fillText(text, x, y);

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return tex;
  }, [fontsReady]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  useFrame((state) => {
    if (!wordmarkRef.current) return;

    const t = state.clock.getElapsedTime();
    const slowZoom = 1.025 + Math.sin(t * 0.42) * 0.012;
    wordmarkRef.current.scale.set(slowZoom, slowZoom, 1);
  });

  const wordmarkZ = -2;
  const cameraZ = Math.max(camera.position.z, 0.001);
  const perspectiveCompensation = (cameraZ - wordmarkZ) / cameraZ;
  const edgeBleed = 1.04;

  // viewport.width is measured around z=0. Because this plane sits behind the
  // sphere at z=-2, compensate for perspective so the rendered wordmark reaches
  // the screen edges rather than shrinking in the distance.
  const width = viewport.width * perspectiveCompensation * edgeBleed;
  const height = width / 4;

  return (
    <mesh ref={wordmarkRef} position={[0, 0, wordmarkZ]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

function WaterBlob() {
  const meshRef = useRef<THREE.Mesh>(null);
  const radius = 1.32;
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

      // Organic wobble. Extra high-frequency layer gives the surface a slightly
      // noisier liquid membrane without turning it into a crumpled bin bag.
      const n1 = noise(ox * 1.6, oy * 1.6, oz * 1.6, t);
      const n2 = noise(ox * 3.2, oy * 3.2, oz * 3.2, t * 1.5);
      const n3 = noise(ox * 6.0, oy * 6.0, oz * 6.0, t * 2.4);
      const disp = 1 + n1 * 0.18 + n2 * 0.1 + n3 * 0.045;

      let x = ox * disp;
      let y = oy * disp;
      let z = oz * disp;

      // Dumbbell / peanut deformation along X:
      // Squeeze the middle (small |x|) in Y and Z, and push lobes outward in X.
      const nx = ox / radius; // -1..1
      const pinch = 1 - neck * 0.58 * (1 - nx * nx); // stronger at centre
      y *= pinch;
      z *= pinch;
      x += Math.sign(nx || 1) * neck * 0.42 * Math.abs(nx);

      pos[i] = x;
      pos[i + 1] = y;
      pos[i + 2] = z;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.28;
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.2;
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
        thickness={0.62}
        ior={1.33}
        chromaticAberration={1.12}
        anisotropy={0}
        distortion={0.48}
        distortionScale={0.72}
        temporalDistortion={0.12}
        backside
        backsideThickness={0.3}
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
