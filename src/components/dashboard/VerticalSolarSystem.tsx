import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Stars, Html, Text } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

type PlanetSpec = {
  radius: number; // orbit radius
  size: number; // planet size
  speed: number; // orbital speed
  name: string;
  textureUrl?: string;
  color?: string;
};

function Planet({ spec }: { spec: PlanetSpec }) {
  const ref = useRef<THREE.Mesh>(null);
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!spec.textureUrl) return;
    const loader = new THREE.TextureLoader();
    loader.load(spec.textureUrl, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      setTex(t);
    });
  }, [spec.textureUrl]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const t = (performance.now() / 1000) * spec.speed;
    ref.current.position.x = Math.cos(t) * spec.radius;
    ref.current.position.y = Math.sin(t) * spec.radius; // vertical orbit (XY plane)
    ref.current.rotation.y += delta * 0.5;
  });

  // Orbit ring
  const points = Array.from({ length: 128 }).map((_, i) => {
    const a = (i / 128) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * spec.radius, Math.sin(a) * spec.radius, 0);
  });

  return (
    <group>
      <Line points={points} color="#cbd5e1" transparent opacity={0.8} />
      <mesh ref={ref}>
        <sphereGeometry args={[spec.size, 32, 32]} />
        {tex ? (
          <meshStandardMaterial map={tex} metalness={0.1} roughness={0.6} emissive="#222222" emissiveIntensity={0.15} />
        ) : (
          <meshStandardMaterial color={spec.color || "#9ca3af"} metalness={0.15} roughness={0.5} emissive="#1f2937" emissiveIntensity={0.2} />
        )}
      </mesh>
      {/* Always-visible planet label on the globe's front side */}
      <Text
        position={[0, 0, spec.size + 0.02]}
        fontSize={Math.max(0.12, spec.size * 0.35)}
        color="#ffffff"
        outlineWidth={0.004}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
        depthTest={false}
        renderOrder={999}
      >
        {spec.name}
      </Text>
      <Html center distanceFactor={15} position={[0, -spec.size - 0.34, 0]}>
        <div className="text-[8px] text-white/95 bg-black/60 px-1.5 py-[2px] rounded">{spec.name}</div>
      </Html>
    </group>
  );
}

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.2;
  });
  return (
    <group>
      <pointLight color="#ffd166" intensity={2.2} distance={50} />
      <mesh ref={ref}>
        <sphereGeometry args={[1.2, 48, 48]} />
        <meshStandardMaterial emissive="#ffd166" emissiveIntensity={1.5} color="#ffbb33" />
      </mesh>
      <Html center distanceFactor={20} position={[0, -1.5, 0]}>
        <div className="text-[12px] text-white/90 bg-black/50 px-2 py-1 rounded font-bold">Sun</div>
      </Html>
    </group>
  );
}

export default function VerticalSolarSystem() {
  // Public texture URLs (royalty-free/demo)
  const texturesBase = "https://threejs.org/examples/textures/planets/";
  const planets: PlanetSpec[] = [
    { name: "Mercury", radius: 3, size: 0.2, speed: 0.9, textureUrl: texturesBase + "mercury.jpg", color: "#9ca3af" },
    { name: "Venus", radius: 4.2, size: 0.28, speed: 0.7, textureUrl: texturesBase + "venus.jpg", color: "#eab308" },
    { name: "Earth", radius: 6.8, size: 0.32, speed: 0.55, textureUrl: "/assets/earth-ui.jpg", color: "#2563eb" },
    { name: "Mars", radius: 9, size: 0.3, speed: 0.45, textureUrl: texturesBase + "mars_1k_color.jpg", color: "#ef4444" },
    { name: "Jupiter", radius: 12, size: 0.8, speed: 0.3, textureUrl: texturesBase + "jupiter.jpg", color: "#f59e0b" },
    { name: "Saturn", radius: 15, size: 0.7, speed: 0.25, textureUrl: texturesBase + "saturn.jpg", color: "#eab308" },
    { name: "Uranus", radius: 18, size: 0.4, speed: 0.2, textureUrl: texturesBase + "uranus.jpg", color: "#60a5fa" },
    { name: "Neptune", radius: 21, size: 0.4, speed: 0.15, textureUrl: texturesBase + "neptune.jpg", color: "#3b82f6" },
  ];

  // Specialized Earth with local satellites and debris
  function EarthWithSatellites() {
    const earthRef = useRef<THREE.Mesh>(null);
    const [earthTex, setEarthTex] = useState<THREE.Texture | null>(null);
    useEffect(() => {
      const loader = new THREE.TextureLoader();
      loader.load("/assets/earth-ui.jpg", (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        setEarthTex(t);
      });
    }, []);

    // Animate Earth's revolution around the sun
    useFrame(() => {
      if (!earthRef.current) return;
      const t = performance.now() / 1000;
      const radius = 6.8;
      earthRef.current.position.x = Math.cos(t * 0.55) * radius;
      earthRef.current.position.y = Math.sin(t * 0.55) * radius; // vertical orbit around the sun (XY plane)
      earthRef.current.rotation.y += 0.01;
    });

    // Satellites and debris orbiting the Earth
    function LocalTraffic() {
      const groupRef = useRef<THREE.Group>(null);
      useFrame(() => {
        if (!groupRef.current || !earthRef.current) return;
        const epos = earthRef.current.position;
        groupRef.current.position.set(epos.x, epos.y, epos.z);
        groupRef.current.rotation.y += 0.01;
      });

      const debris = Array.from({ length: 120 }).map((_, i) => ({
        r: 1.6 + (i % 4) * 0.15,
        size: 0.015 + (i % 3) * 0.005,
        speed: 0.8 + (i % 5) * 0.05,
        phase: (i / 120) * Math.PI * 2,
      }));

      return (
        <group ref={groupRef}>
          {/* More named satellites */}
          {[0.9, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2].map((r, idx) => (
            <group key={idx}>
              <mesh position={[r, 0, 0]}> 
                <boxGeometry args={[0.05, 0.05, 0.12]} />
                <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={0.3} />
              </mesh>
            </group>
          ))}
          {/* Debris ring */}
          {debris.map((d, i) => {
            const a = (performance.now() / 1000) * d.speed + d.phase;
            const x = Math.cos(a) * d.r;
            const y = Math.sin(a) * d.r;
            return (
              <mesh key={i} position={[x, y, (i % 2) * 0.05 - 0.025]}>
                <sphereGeometry args={[d.size, 6, 6]} />
                <meshStandardMaterial color="#9ca3af" />
              </mesh>
            );
          })}
        </group>
      );
    }

    // Earth orbit ring
    const ringPts = useMemo(() => {
      const radius = 6.8;
      return Array.from({ length: 160 }).map((_, i) => {
        const a = (i / 160) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
      });
    }, []);

    return (
      <group>
        <Line points={ringPts} color="#cbd5e1" transparent opacity={0.8} />
        <mesh ref={earthRef}>
          <sphereGeometry args={[0.32, 48, 48]} />
          {earthTex ? (
            <meshStandardMaterial map={earthTex} metalness={0.2} roughness={0.9} />
          ) : (
            <meshStandardMaterial color="#2563eb" />
          )}
        </mesh>
        <LocalTraffic />
      </group>
    );
  }

  return (
    <div className="w-full h-full rounded-none border-0 bg-transparent p-0">
      <Canvas className="h-screen" camera={{ position: [0, 0, 55], fov: 55 }}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <directionalLight position={[-8, -6, 4]} intensity={0.8} color="#a1c4fd" />
        <Stars radius={100} depth={40} count={4000} factor={3} saturation={0} fade speed={0.6} />
        <Sun />
        <EarthWithSatellites />
        {planets.map((p, i) => (
          <Planet key={i} spec={p} />
        ))}
        <OrbitControls enablePan={false} minDistance={20} maxDistance={70} />
      </Canvas>
    </div>
  );
}
