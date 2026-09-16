import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Float, PresentationControls } from "@react-three/drei";
import * as THREE from "three";

function Flacon({ oilColor }: { oilColor: string }) {
  const geoms = useMemo(() => {
    // Sharp Octagonal Body
    const body = new THREE.CylinderGeometry(0.85, 1.1, 1.9, 8, 1, false);
    const base = new THREE.CylinderGeometry(1.1, 0.95, 0.15, 8, 1, false);
    const neck = new THREE.CylinderGeometry(0.32, 0.4, 0.35, 16);

    // Elegant Multi-faceted Cap
    const capBase = new THREE.CylinderGeometry(0.38, 0.42, 0.12, 8);
    const capMid = new THREE.CylinderGeometry(0.5, 0.38, 0.35, 8);
    const capTop = new THREE.CylinderGeometry(0, 0.5, 0.35, 8);

    const liquid = new THREE.CylinderGeometry(0.76, 1.0, 1.35, 8);

    return { body, base, neck, capBase, capMid, capTop, liquid };
  }, []);

  return (
    <group position={[0, -0.2, 0]}>
      {/* Crystal - Ultra Clear Physical Glass */}
      <mesh geometry={geoms.body}>
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0.08}
          transmission={0.8}
          transparent
          opacity={0.88}
          ior={1.52}
          reflectivity={0.9}
        />
      </mesh>

      {/* Crystal Base */}
      <mesh geometry={geoms.base} position={[0, -1.0, 0]}>
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.05}
          metalness={0.08}
          transmission={0.8}
          transparent
          opacity={0.9}
          ior={1.52}
        />
      </mesh>

      {/* Oil Volume */}
      <mesh geometry={geoms.liquid} position={[0, -0.22, 0]}>
        <meshStandardMaterial
          color={oilColor}
          emissive={oilColor}
          emissiveIntensity={0.55}
          roughness={0.15}
          metalness={0.2}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Hardware - Imperial Gilded Gold Neck & Cap (Seamlessly Aligned) */}
      <mesh geometry={geoms.neck} position={[0, 1.05, 0]}>
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Cap Base Ring */}
      <mesh geometry={geoms.capBase} position={[0, 1.25, 0]}>
        <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.15} />
      </mesh>

      {/* Cap Faceted Jewel Mid */}
      <mesh geometry={geoms.capMid} position={[0, 1.46, 0]}>
        <meshStandardMaterial color="#f1d27b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Cap Crown Top */}
      <mesh geometry={geoms.capTop} position={[0, 1.78, 0]}>
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Scene({ oilColor }: { oilColor: string }) {
  return (
    <>
      <ambientLight intensity={0.65} />

      {/* Key Gilded Light */}
      <directionalLight position={[6, 8, 6]} intensity={2.0} color="#f1d27b" />

      {/* Fill Light */}
      <directionalLight position={[-6, 4, -4]} intensity={1.0} color="#ffffff" />

      {/* Rim Light */}
      <pointLight position={[0, 4, -6]} intensity={1.4} color="#d4af37" />

      <PresentationControls
        snap
        speed={1.2}
        zoom={1}
        polar={[-0.1, 0.3]}
        azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
        damping={0.85}
        cursor={false}
      >
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
          <group position={[0, 0, 0]} scale={1.1}>
            <Flacon oilColor={oilColor} />
          </group>
        </Float>
      </PresentationControls>

      <Environment preset="city" />
    </>
  );
}

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function BottleScene({
  className,
  oilColor = "#d4af37",
}: {
  className?: string;
  oilColor?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [failed, setFailed] = useState(false);
  const ok = useMemo(supportsWebGL, []);

  // Performance optimization: Only render frames when visible in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin: "100px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!ok || failed) {
    return (
      <div ref={containerRef} className={className} aria-label="SPIRIT OF ARABIAN crystal flacon">
        <div className="absolute inset-0 flex items-center justify-center bg-ink/20 backdrop-blur-md">
          <div
            className="h-60 w-60 rounded-full"
            style={{
              background: `radial-gradient(circle, ${oilColor}33 0%, transparent 70%)`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <Canvas
        dpr={[1, 1.25]}
        frameloop={inView ? "always" : "never"}
        camera={{ position: [0, 0, 7.5], fov: 36 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        style={{ touchAction: "pan-y", pointerEvents: "auto" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => setFailed(true));
        }}
      >
        <Suspense fallback={null}>
          <Scene oilColor={oilColor} />
        </Suspense>
      </Canvas>
    </div>
  );
}
