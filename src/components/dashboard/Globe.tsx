import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Line, Text, Html, useTexture } from "@react-three/drei";
import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Satellite, ZoomIn, ZoomOut } from "lucide-react";
import { SpaceObject } from "@/types/orbital";
import { Button } from "@/components/ui/button";
import { TextureLoader } from "three";

function Orbits() {
  const circles = Array.from({ length: 6 }).map((_, i) => {
    const points: THREE.Vector3[] = [];
    const radius = 2.1 + i * 0.08;
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.02) {
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius * (0.6 + (i % 3) * 0.1); // slight ellipses
      points.push(new THREE.Vector3(x, y, 0));
    }
    return points;
  });

  return (
    <group rotation={[Math.PI / 3.5, 0, 0]}>
      {circles.map((pts, idx) => (
        <Line
          key={idx}
          points={pts}
          color="#4fd1c5"
          lineWidth={1}
          dashed={false}
          transparent
          opacity={0.6}
        />
      ))}
    </group>
  );
}

function Earth() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [hasError, setHasError] = useState(false);

  // Load your earth image as a sphere texture
  useEffect(() => {
    const loader = new TextureLoader();
    loader.load(
      "/assets/earth-ui.jpg",
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        setTexture(tex);
      },
      undefined,
      () => setHasError(true)
    );
  }, []);

  useFrame((_, delta) => {
    if (sphereRef.current) sphereRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[3, 64, 64]} />
        {texture && !hasError ? (
          <meshStandardMaterial map={texture} metalness={0.2} roughness={0.8} />
        ) : (
          <meshStandardMaterial color="#1e3a8a" roughness={0.7} metalness={0.2} />
        )}
      </mesh>
      {/* Soft atmosphere */}
      <mesh scale={1.07}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial color="#4ca6ff" transparent={true} opacity={0.06} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// Using the SpaceObject interface from types/orbital.ts
// Extended with local properties for visualization
interface VisualSpaceObject extends SpaceObject {
  visualPosition: [number, number, number];
  visualRisk: number;
}

function SpaceObjects() {
  const [objects, setObjects] = useState<VisualSpaceObject[]>([]);
  
  // Fetch real-time space object data
  useEffect(() => {
    // This would normally come from the realTimeService
    // For now, we'll simulate it with mock data
    const fetchSpaceObjects = async () => {
      try {
        // In a real implementation, this would be:
        // const data = await fetch('/api/space-objects');
        // const spaceObjects = await data.json();
        
        // Mock data for now - expanded with more satellites and debris
        const mockObjects: VisualSpaceObject[] = [
          // High-risk objects
          { id: 'SAT-2391', name: 'Starlink-4521', type: 'satellite', country: 'USA', launchDate: '2023-03-15', altitude: 550, inclination: 53.2, period: 95.5, status: 'active', riskLevel: 'high', lastUpdate: '2024-08-10T08:30:00Z', visualPosition: [2.8, 1.2, 0.5], visualRisk: 0.9 },
          { id: 'DEB-9921', name: 'Cosmos-1408 Fragment', type: 'debris', country: 'Russia', launchDate: '1982-09-20', altitude: 485, inclination: 82.6, period: 93.8, status: 'inactive', riskLevel: 'high', lastUpdate: '2024-08-10T07:45:00Z', visualPosition: [2.9, 1.1, 0.6], visualRisk: 0.9 },
          { id: 'SAT-4521', name: 'Sentinel-2B', type: 'satellite', country: 'ESA', launchDate: '2017-03-07', altitude: 786, inclination: 98.6, period: 100.4, status: 'active', riskLevel: 'medium', lastUpdate: '2024-08-10T08:15:00Z', visualPosition: [3.2, -0.8, 1.1], visualRisk: 0.7 },
          { id: 'DEB-5563', name: 'Fengyun-1C Fragment', type: 'debris', country: 'China', launchDate: '1999-05-10', altitude: 865, inclination: 98.8, period: 102.1, status: 'inactive', riskLevel: 'medium', lastUpdate: '2024-08-10T06:22:00Z', visualPosition: [3.1, -0.9, 1.2], visualRisk: 0.7 },
          
          // GPS and high-altitude satellites
          { id: 'SAT-7821', name: 'GPS III SV03', type: 'satellite', country: 'USA', launchDate: '2020-06-30', altitude: 20180, inclination: 55.0, period: 718.0, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:45:00Z', visualPosition: [-2.7, 0.5, -1.8], visualRisk: 0.3 },
          { id: 'SAT-7822', name: 'GPS III SV04', type: 'satellite', country: 'USA', launchDate: '2020-11-05', altitude: 20180, inclination: 55.0, period: 718.0, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:45:00Z', visualPosition: [-2.5, 0.7, -1.6], visualRisk: 0.3 },
          { id: 'SAT-7823', name: 'GPS III SV05', type: 'satellite', country: 'USA', launchDate: '2021-06-17', altitude: 20180, inclination: 55.0, period: 718.0, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:45:00Z', visualPosition: [-2.3, 0.3, -1.9], visualRisk: 0.3 },
          
          // More debris
          { id: 'DEB-2193', name: 'Iridium-33 Fragment', type: 'debris', country: 'USA', launchDate: '1997-09-14', altitude: 790, inclination: 86.4, period: 100.8, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T07:12:00Z', visualPosition: [-2.8, 0.6, -1.9], visualRisk: 0.3 },
          { id: 'DEB-2194', name: 'Iridium-33 Fragment-2', type: 'debris', country: 'USA', launchDate: '1997-09-14', altitude: 790, inclination: 86.4, period: 100.8, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T07:12:00Z', visualPosition: [-2.6, 0.8, -1.7], visualRisk: 0.3 },
          { id: 'DEB-2195', name: 'Iridium-33 Fragment-3', type: 'debris', country: 'USA', launchDate: '1997-09-14', altitude: 790, inclination: 86.4, period: 100.8, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T07:12:00Z', visualPosition: [-2.9, 0.4, -2.0], visualRisk: 0.3 },
          
          // Earth observation satellites
          { id: 'SAT-1042', name: 'Terra (EOS AM-1)', type: 'satellite', country: 'USA', launchDate: '1999-12-18', altitude: 705, inclination: 98.2, period: 98.9, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:20:00Z', visualPosition: [1.5, 2.2, -1.5], visualRisk: 0.0 },
          { id: 'SAT-1043', name: 'Aqua (EOS PM-1)', type: 'satellite', country: 'USA', launchDate: '2002-05-04', altitude: 705, inclination: 98.2, period: 98.9, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:20:00Z', visualPosition: [1.3, 2.4, -1.3], visualRisk: 0.0 },
          { id: 'SAT-1044', name: 'Aura (EOS CH-1)', type: 'satellite', country: 'USA', launchDate: '2004-07-15', altitude: 705, inclination: 98.2, period: 98.9, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:20:00Z', visualPosition: [1.7, 2.0, -1.7], visualRisk: 0.0 },
          
          // Communication satellites
          { id: 'SAT-6677', name: 'OneWeb-0123', type: 'satellite', country: 'UK', launchDate: '2022-04-01', altitude: 1200, inclination: 87.4, period: 109.5, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:35:00Z', visualPosition: [-1.2, -2.1, 1.8], visualRisk: 0.0 },
          { id: 'SAT-6678', name: 'OneWeb-0124', type: 'satellite', country: 'UK', launchDate: '2022-04-01', altitude: 1200, inclination: 87.4, period: 109.5, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:35:00Z', visualPosition: [-1.0, -2.3, 1.6], visualRisk: 0.0 },
          { id: 'SAT-6679', name: 'OneWeb-0125', type: 'satellite', country: 'UK', launchDate: '2022-04-01', altitude: 1200, inclination: 87.4, period: 109.5, status: 'active', riskLevel: 'low', lastUpdate: '2024-08-10T08:35:00Z', visualPosition: [-1.4, -1.9, 2.0], visualRisk: 0.0 },
          
          // More Starlink satellites
          { id: 'SAT-2392', name: 'Starlink-4522', type: 'satellite', country: 'USA', launchDate: '2023-03-15', altitude: 550, inclination: 53.2, period: 95.5, status: 'active', riskLevel: 'medium', lastUpdate: '2024-08-10T08:30:00Z', visualPosition: [2.6, 1.4, 0.3], visualRisk: 0.5 },
          { id: 'SAT-2393', name: 'Starlink-4523', type: 'satellite', country: 'USA', launchDate: '2023-03-15', altitude: 550, inclination: 53.2, period: 95.5, status: 'active', riskLevel: 'medium', lastUpdate: '2024-08-10T08:30:00Z', visualPosition: [3.0, 1.0, 0.7], visualRisk: 0.5 },
          { id: 'SAT-2394', name: 'Starlink-4524', type: 'satellite', country: 'USA', launchDate: '2023-03-15', altitude: 550, inclination: 53.2, period: 95.5, status: 'active', riskLevel: 'medium', lastUpdate: '2024-08-10T08:30:00Z', visualPosition: [2.7, 1.3, 0.4], visualRisk: 0.5 },
          
          // More debris
          { id: 'DEB-8891', name: 'ASAT Test Fragment', type: 'debris', country: 'India', launchDate: '2008-10-22', altitude: 650, inclination: 97.9, period: 97.8, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T06:55:00Z', visualPosition: [0.8, 2.8, 0.2], visualRisk: 0.0 },
          { id: 'DEB-8892', name: 'ASAT Test Fragment-2', type: 'debris', country: 'India', launchDate: '2008-10-22', altitude: 650, inclination: 97.9, period: 97.8, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T06:55:00Z', visualPosition: [0.6, 3.0, 0.0], visualRisk: 0.0 },
          { id: 'DEB-8893', name: 'ASAT Test Fragment-3', type: 'debris', country: 'India', launchDate: '2008-10-22', altitude: 650, inclination: 97.9, period: 97.8, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T06:55:00Z', visualPosition: [1.0, 2.6, 0.4], visualRisk: 0.0 },
          
          { id: 'DEB-1002', name: 'SL-16 R/B Fragment', type: 'debris', country: 'Russia', launchDate: '2019-07-05', altitude: 420, inclination: 51.6, period: 92.1, status: 'decayed', riskLevel: 'low', lastUpdate: '2024-08-09T14:30:00Z', visualPosition: [3.0, 0.1, -0.8], visualRisk: 0.0 },
          { id: 'DEB-1003', name: 'SL-16 R/B Fragment-2', type: 'debris', country: 'Russia', launchDate: '2019-07-05', altitude: 420, inclination: 51.6, period: 92.1, status: 'decayed', riskLevel: 'low', lastUpdate: '2024-08-09T14:30:00Z', visualPosition: [2.8, 0.3, -0.6], visualRisk: 0.0 },
          { id: 'DEB-1004', name: 'SL-16 R/B Fragment-3', type: 'debris', country: 'Russia', launchDate: '2019-07-05', altitude: 420, inclination: 51.6, period: 92.1, status: 'decayed', riskLevel: 'low', lastUpdate: '2024-08-09T14:30:00Z', visualPosition: [3.2, -0.1, -1.0], visualRisk: 0.0 },
          
          // Additional random debris
          { id: 'DEB-2001', name: 'Unknown Fragment-1', type: 'debris', country: 'Unknown', launchDate: '2010-01-01', altitude: 600, inclination: 85.0, period: 96.5, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T05:30:00Z', visualPosition: [1.8, 1.5, -0.5], visualRisk: 0.0 },
          { id: 'DEB-2002', name: 'Unknown Fragment-2', type: 'debris', country: 'Unknown', launchDate: '2010-01-01', altitude: 600, inclination: 85.0, period: 96.5, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T05:30:00Z', visualPosition: [1.6, 1.7, -0.3], visualRisk: 0.0 },
          { id: 'DEB-2003', name: 'Unknown Fragment-3', type: 'debris', country: 'Unknown', launchDate: '2010-01-01', altitude: 600, inclination: 85.0, period: 96.5, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T05:30:00Z', visualPosition: [2.0, 1.3, -0.7], visualRisk: 0.0 },
          { id: 'DEB-2004', name: 'Unknown Fragment-4', type: 'debris', country: 'Unknown', launchDate: '2010-01-01', altitude: 600, inclination: 85.0, period: 96.5, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T05:30:00Z', visualPosition: [1.4, 1.9, -0.1], visualRisk: 0.0 },
          { id: 'DEB-2005', name: 'Unknown Fragment-5', type: 'debris', country: 'Unknown', launchDate: '2010-01-01', altitude: 600, inclination: 85.0, period: 96.5, status: 'inactive', riskLevel: 'low', lastUpdate: '2024-08-10T05:30:00Z', visualPosition: [2.2, 1.1, -0.9], visualRisk: 0.0 },
        ];
        
        setObjects(mockObjects);
      } catch (error) {
        console.error('Error fetching space objects:', error);
      }
    };
    
    fetchSpaceObjects();
    
    // Set up interval for real-time updates
    const interval = setInterval(() => {
      // Simulate object movement
      setObjects(prev => prev.map(obj => ({
        ...obj,
        visualPosition: [
          obj.visualPosition[0] + (Math.random() - 0.5) * 0.01,
          obj.visualPosition[1] + (Math.random() - 0.5) * 0.01,
          obj.visualPosition[2] + (Math.random() - 0.5) * 0.01
        ]
      })));
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <group>
      {objects.map((obj) => {
        const isHighRisk = obj.visualRisk >= 0.7 || obj.riskLevel === 'high';
        const isMediumRisk = (obj.visualRisk >= 0.3 && obj.visualRisk < 0.7) || obj.riskLevel === 'medium';
        const color = isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : obj.type === 'satellite' ? '#3b82f6' : '#6b7280';
        const size = obj.type === 'satellite' ? 0.08 : 0.05;
        
        // Calculate altitude-based position
        const altitudeFactor = 1 + (obj.altitude / 10000); // Scale based on altitude
        const scaledPosition = [
          obj.visualPosition[0] * altitudeFactor,
          obj.visualPosition[1] * altitudeFactor,
          obj.visualPosition[2] * altitudeFactor
        ];
        
        return (
          <group key={obj.id} position={scaledPosition as [number, number, number]}>
            <mesh>
              {obj.type === 'satellite' ? (
                <boxGeometry args={[size, size, size * 2]} />
              ) : (
                <sphereGeometry args={[size, 8, 8]} />
              )}
              <meshStandardMaterial 
                color={color} 
                emissive={isHighRisk ? '#ef4444' : '#000000'} 
                emissiveIntensity={isHighRisk ? 0.3 : 0} 
              />
            </mesh>
            {isHighRisk && (
              <pointLight color="#ef4444" intensity={0.5} distance={1} />
            )}
          </group>
        );
      })}
    </group>
  );
}

function CollisionPaths() {
  const [paths, setPaths] = useState<{
    start: [number, number, number];
    end: [number, number, number];
    risk: number;
    objectA: string;
    objectB: string;
  }[]>([]);
  
  // Fetch real-time collision path data
  useEffect(() => {
    // This would normally come from the realTimeService
    // For now, we'll simulate it with mock data
    const mockPaths = [
      {
        start: [2.8, 1.2, 0.5] as [number, number, number],
        end: [2.9, 1.1, 0.6] as [number, number, number],
        risk: 0.9,
        objectA: 'SAT-2391',
        objectB: 'DEB-9921'
      },
      {
        start: [3.2, -0.8, 1.1] as [number, number, number],
        end: [3.1, -0.9, 1.2] as [number, number, number],
        risk: 0.7,
        objectA: 'SAT-4521',
        objectB: 'DEB-5563'
      },
      {
        start: [-2.7, 0.5, -1.8] as [number, number, number],
        end: [-2.8, 0.6, -1.9] as [number, number, number],
        risk: 0.3,
        objectA: 'SAT-7821',
        objectB: 'DEB-2193'
      }
    ];
    
    setPaths(mockPaths);
  }, []);

  return (
    <group>
      {paths.map((path, idx) => {
        const isHighRisk = path.risk >= 0.7;
        const isMediumRisk = path.risk >= 0.3 && path.risk < 0.7;
        const color = isHighRisk ? '#ef4444' : isMediumRisk ? '#f59e0b' : '#22c55e';
        const points = [new THREE.Vector3(...path.start), new THREE.Vector3(...path.end)];
        
        return (
          <Line
            key={idx}
            points={points}
            color={color}
            lineWidth={isHighRisk ? 4 : isMediumRisk ? 3 : 2}
            dashed={true}
            dashSize={0.1}
            gapSize={0.05}
            transparent
            opacity={isHighRisk ? 0.9 : 0.6}
          />
        );
      })}
    </group>
  );
}

// Camera controls for zoom functionality
function CameraControls() {
  const { camera } = useThree();
  const controlsRef = useRef<any>();
  
  const zoomIn = () => {
    if (controlsRef.current) {
      const currentDistance = controlsRef.current.getDistance();
      const newDistance = Math.max(currentDistance * 0.8, 3.5);
      controlsRef.current.minDistance = newDistance;
      controlsRef.current.maxDistance = newDistance;
      setTimeout(() => {
        if (controlsRef.current) {
          controlsRef.current.minDistance = 3.5;
          controlsRef.current.maxDistance = 12;
        }
      }, 100);
    }
  };
  
  const zoomOut = () => {
    if (controlsRef.current) {
      const currentDistance = controlsRef.current.getDistance();
      const newDistance = Math.min(currentDistance * 1.2, 12);
      controlsRef.current.minDistance = newDistance;
      controlsRef.current.maxDistance = newDistance;
      setTimeout(() => {
        if (controlsRef.current) {
          controlsRef.current.minDistance = 3.5;
          controlsRef.current.maxDistance = 12;
        }
      }, 100);
    }
  };
  
  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        enablePan={false} 
        enableZoom={true} 
        minDistance={3.5} 
        maxDistance={12} 
        autoRotate={false}
        autoRotateSpeed={0.5}
        zoomSpeed={1.2}
      />
      <Html position={[-5, 3, 0]} style={{ pointerEvents: 'none' }}>
        <div className="flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-black/50 hover:bg-black/70 text-white border-gray-700"
            onClick={zoomIn}
          >
            <ZoomIn size={18} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-black/50 hover:bg-black/70 text-white border-gray-700"
            onClick={zoomOut}
          >
            <ZoomOut size={18} />
          </Button>
        </div>
      </Html>
    </>
  );
}

export default function Globe() {
  return (
    <div className="w-full rounded-xl border bg-transparent p-2">
      <Canvas className="h-[360px] md:h-[420px]" camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -5, -5]} intensity={0.8} color="#a1c4fd" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Earth />
        <Orbits />
        <SpaceObjects />
        <CollisionPaths />
        <CameraControls />
      </Canvas>
    </div>
  );
}
