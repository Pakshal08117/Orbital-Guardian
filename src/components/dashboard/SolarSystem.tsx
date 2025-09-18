import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Stars, Html } from "@react-three/drei";
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
    ref.current.position.z = Math.sin(t) * spec.radius;
    ref.current.rotation.y += delta * 0.5;
  });

  // Orbit ring
  const points = Array.from({ length: 128 }).map((_, i) => {
    const a = (i / 128) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(a) * spec.radius, 0, Math.sin(a) * spec.radius);
  });

  return (
    <group>
      <Line points={points} color="#4b5563" transparent opacity={0.35} />
      <mesh ref={ref}>
        <sphereGeometry args={[spec.size, 32, 32]} />
        {tex ? (
          <meshStandardMaterial map={tex} metalness={0.2} roughness={0.9} />
        ) : (
          <meshStandardMaterial color={spec.color || "#9ca3af"} metalness={0.2} roughness={0.7} />
        )}
      </mesh>
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
    </group>
  );
}

export default function SolarSystem() {
  // Public texture URLs (royalty-free/demo)
  const texturesBase = "https://threejs.org/examples/textures/planets/";
  const planets: PlanetSpec[] = [
    { name: "Mercury", radius: 3, size: 0.2, speed: 0.9, textureUrl: texturesBase + "mercury.jpg", color: "#9ca3af" },
    { name: "Venus", radius: 4.2, size: 0.28, speed: 0.7, textureUrl: texturesBase + "venus.jpg", color: "#eab308" },
    { name: "Mars", radius: 9, size: 0.3, speed: 0.45, textureUrl: texturesBase + "mars_1k_color.jpg", color: "#ef4444" },
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
      earthRef.current.position.z = Math.sin(t * 0.55) * radius;
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

      const debris = Array.from({ length: 60 }).map((_, i) => ({
        r: 1.6 + (i % 4) * 0.15,
        size: 0.015 + (i % 3) * 0.005,
        speed: 0.8 + (i % 5) * 0.05,
        phase: (i / 60) * Math.PI * 2,
      }));

      return (
        <group ref={groupRef}>
          {/* A few named satellites */}
          {[0.9, 1.2, 1.4].map((r, idx) => (
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
            const z = Math.sin(a) * d.r;
            return (
              <mesh key={i} position={[x, (i % 2) * 0.05 - 0.025, z]}>
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
        return new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius);
      });
    }, []);

    return (
      <group>
        <Line points={ringPts} color="#6b7280" transparent opacity={0.25} />
        <mesh ref={earthRef}>
          <sphereGeometry args={[1.2, 48, 48]} />
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
    <div className="w-full rounded-none border-0 bg-transparent p-0">
      <Canvas className="h-screen" camera={{ position: [0, 6, 14], fov: 55 }}>
        <ambientLight intensity={0.2} />
        <Stars radius={100} depth={40} count={4000} factor={3} saturation={0} fade speed={0.6} />
        <Sun />
        <EarthWithSatellites />
        {planets.map((p, i) => (
          <Planet key={i} spec={p} />
        ))}
        <OrbitControls enablePan={false} minDistance={10} maxDistance={36} />
      </Canvas>
    </div>
  );
}


