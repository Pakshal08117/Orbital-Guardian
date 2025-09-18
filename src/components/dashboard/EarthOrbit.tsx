import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

function EarthModel() {
  const groupRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [earthTex, setEarthTex] = useState<THREE.Texture | null>(null);
  const [normalTex, setNormalTex] = useState<THREE.Texture | null>(null);
  const [roughnessTex, setRoughnessTex] = useState<THREE.Texture | null>(null);
  const [cloudsTex, setCloudsTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/assets/earth-ui.jpg", (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      setEarthTex(t);
    });
    // Enhance relief and oceans sparkle (normal/roughness)
    loader.load(
      "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg",
      (t) => {
        t.colorSpace = THREE.LinearSRGBColorSpace;
        setNormalTex(t);
      }
    );
    loader.load(
      "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg",
      (t) => {
        t.colorSpace = THREE.LinearSRGBColorSpace;
        setRoughnessTex(t);
      }
    );
    loader.load(
      "https://unpkg.com/three-globe@2.24.10/example/img/earth-clouds.png",
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        setCloudsTex(t);
      }
    );
  }, []);

  // Tiny label that fades when occluded or on the backside of the globe
  function OccludingLabel({ text, distanceFactor, position }: { text: string; distanceFactor: number; position: [number, number, number] }) {
    const [occluded, setOccluded] = useState(false);
    const { camera } = useThree();
    const [front, setFront] = useState(true);
    const [opacity, setOpacity] = useState(1);
    useFrame(() => {
      if (!earthRef.current) return;
      const center = new THREE.Vector3();
      earthRef.current.getWorldPosition(center);
      const labelWorld = new THREE.Vector3(position[0], position[1], position[2]).applyMatrix4(earthRef.current.matrixWorld);
      const normal = new THREE.Vector3().subVectors(labelWorld, center).normalize();
      const toCam = new THREE.Vector3().subVectors(camera.position, center).normalize();
      // Add a small threshold to avoid flicker on the horizon
      setFront(normal.dot(toCam) > 0.1);
      // Smooth opacity to reduce popping
      const target = !occluded && normal.dot(toCam) > 0.1 ? 1 : 0;
      setOpacity((prev) => prev + (target - prev) * 0.2);
    });
    return (
      <Html
        center
        position={position}
        distanceFactor={distanceFactor}
        occlude={[earthRef]}
        onOcclude={(o) => setOccluded(o)}
        style={{ opacity, pointerEvents: 'none', willChange: 'opacity' }}
        zIndexRange={[10, 0]}
      >
        <div className="text-[3px] whitespace-nowrap text-white/85 bg-black/40 px-[2px] py-[1px] rounded">
          {text}
        </div>
      </Html>
    );
  }

  // Rotate the entire scene slowly (360 degrees loop)
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.03;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.04;
  });

  // Generate debris ring - increased density
  const debris = useMemo(() => {
    const items: { position: [number, number, number]; size: number; name?: string }[] = [];
    const ringRadius = 3.2;
    for (let i = 0; i < 1000; i++) {
      const a = (i / 1000) * Math.PI * 2 + Math.random() * 0.02;
      const tilt = (Math.random() - 0.5) * 0.35; // slight inclination spread
      const r = ringRadius + (Math.random() - 0.5) * 0.25;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = Math.sin(tilt) * 0.4;
      const name = i < 8 ? `DEB-${(i + 1).toString().padStart(3, '0')}` : undefined;
      items.push({ position: [x, y, z], size: 0.015 + Math.random() * 0.025, name });
    }
    return items;
  }, []);

  // More stylized satellites and rocket fragments
  const hardware = useMemo(() => {
    return [
      { type: "sat", name: "SAT-101", pos: [2.2, 0.2, 0] as [number, number, number] },
      { type: "sat", name: "SAT-202", pos: [-2.4, -0.1, 1.0] as [number, number, number] },
      { type: "rb", name: "R/B-13", pos: [1.4, 0.5, -1.6] as [number, number, number] },
      { type: "sat", name: "SAT-303", pos: [0.8, 1.8, -0.5] as [number, number, number] },
      { type: "sat", name: "SAT-404", pos: [-1.2, 1.5, 0.8] as [number, number, number] },
      { type: "rb", name: "R/B-25", pos: [2.8, -0.3, 0.2] as [number, number, number] },
      { type: "sat", name: "SAT-505", pos: [-0.5, -1.8, 1.2] as [number, number, number] },
      { type: "sat", name: "SAT-606", pos: [1.8, -1.2, -0.8] as [number, number, number] },
      { type: "rb", name: "R/B-37", pos: [-2.0, 0.8, -1.0] as [number, number, number] },
      { type: "sat", name: "SAT-707", pos: [0.3, 2.1, 0.6] as [number, number, number] },
    ];
  }, []);

  return (
    <group ref={groupRef}>
      {/* Earth */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[1.6, 64, 64]} />
        {earthTex ? (
          <meshPhysicalMaterial 
            map={earthTex}
            normalMap={normalTex || undefined}
            roughnessMap={roughnessTex || undefined}
            clearcoat={0.6}
            clearcoatRoughness={0.35}
            metalness={0.1}
            roughness={0.8}
          />
        ) : (
          <meshStandardMaterial color="#1e3a8a" />
        )}
      </mesh>
      {/* Clouds */}
      {cloudsTex && (
        <mesh ref={cloudsRef} scale={1.02} castShadow>
          <sphereGeometry args={[1.6, 64, 64]} />
          <meshStandardMaterial map={cloudsTex} transparent opacity={0.35} depthWrite={false} />
        </mesh>
      )}
      {/* Atmosphere glow */}
      <mesh scale={1.08}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Debris ring */}
      {debris.map((d, i) => (
        <group key={i} position={d.position}>
          <mesh castShadow>
            <sphereGeometry args={[d.size, 6, 6]} />
            <meshStandardMaterial color="#ffb449" emissive="#c2410c" emissiveIntensity={0.2} />
          </mesh>
          {d.name && (
            <OccludingLabel text={d.name} distanceFactor={55} position={[0, 0.08, 0]} />
          )}
        </group>
      ))}

      {/* Satellites and rocket fragments */}
      {hardware.map((h, i) => (
        <group key={i} position={h.pos}>
          {h.type === "sat" ? (
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.08, 0.25]} />
              <meshStandardMaterial color="#60a5fa" metalness={0.6} roughness={0.4} />
            </mesh>
          ) : (
            <mesh castShadow rotation={[Math.PI / 8, 0.4, 0]}>
              <cylinderGeometry args={[0.04, 0.06, 0.5, 10]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.5} />
            </mesh>
          )}
          <OccludingLabel text={h.name} distanceFactor={48} position={[0, 0.18, 0]} />
        </group>
      ))}

      {/* Orbital lines around Earth (inclined rings) */}
      {[
        { radius: 2.0, tilt: 0.4 },
        { radius: 2.4, tilt: -0.2 },
        { radius: 2.8, tilt: 0.0 },
      ].map((o, idx) => {
        const pts = Array.from({ length: 160 }).map((_, i) => {
          const a = (i / 160) * Math.PI * 2;
          const x = Math.cos(a) * o.radius;
          const y = Math.sin(a) * o.radius * Math.sin(o.tilt);
          const z = Math.sin(a) * o.radius * Math.cos(o.tilt);
          return new THREE.Vector3(x, y, z);
        });
        return (
          <Line key={idx} points={pts} color="#64748b" transparent opacity={0.35} />
        );
      })}


      {/* Biosphere glow points ("living bodies") */}
      {(() => {
        const biospots = [
          { lat: 6, lon: -58 },    // Amazon
          { lat: 0, lon: 25 },     // Congo
          { lat: 20, lon: 78 },    // India
          { lat: 34, lon: 104 },   // China basin
          { lat: -15, lon: 147 },  // Coral seas
        ];
        const R = 1.62;
        const deg2rad = (d: number) => (d * Math.PI) / 180;
        const toVec3 = (lat: number, lon: number) => {
          const phi = deg2rad(90 - lat);
          const theta = deg2rad(lon + 180);
          return new THREE.Vector3(
            -(R * Math.sin(phi) * Math.cos(theta)),
            R * Math.cos(phi),
            R * Math.sin(phi) * Math.sin(theta)
          );
        };
        return biospots.map((b, i) => {
          const v = toVec3(b.lat, b.lon);
          return (
            <mesh key={i} position={[v.x, v.y, v.z]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial emissive="#22c55e" emissiveIntensity={0.6} color="#16a34a" />
            </mesh>
          );
        });
      })()}
    </group>
  );
}

export default function EarthOrbit() {
  return (
    <div className="w-full h-screen rounded-none border-0 bg-transparent p-0 relative">
      {/* Minimal HUD tracker */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 text-xs text-white/80 bg-black/40 rounded px-2 py-1 pointer-events-none">
        Earth • Satellites • Debris — live track
      </div>
      <div className="absolute bottom-2 left-2 z-10 text-[10px] text-white/70 bg-black/30 rounded px-2 py-[2px] pointer-events-none">
        EarthOrbit v1.3
      </div>
      <Canvas shadows className="h-full" camera={{ position: [0, 2.2, 6], fov: 50 }}>
        {/* Star field */}
        <Stars radius={120} depth={50} count={5000} factor={3} saturation={0} fade speed={0.6} />
        {/* Lighting and soft shadows */}
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[5, 4, 5]} 
          intensity={1.6} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <EarthModel />
        <OrbitControls 
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.08}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          minDistance={3.8}
          maxDistance={10}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}


