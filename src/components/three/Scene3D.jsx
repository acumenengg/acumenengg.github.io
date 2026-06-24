import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Edges, Float } from '@react-three/drei';

function Building({ position = [0, 0, 0], scale = 1, color = '#4DA6FF' }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  const floors = useMemo(() => {
    const items = [];
    for (let i = 0; i < 8; i++) {
      items.push({
        y: i * 0.55,
        width: 1.8 - i * 0.05,
        depth: 1.4 - i * 0.03,
      });
    }
    return items;
  }, []);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {floors.map((floor, i) => (
        <mesh key={i} position={[0, floor.y, 0]}>
          <boxGeometry args={[floor.width, 0.4, floor.depth]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.15 + i * 0.05}
            metalness={0.8}
            roughness={0.2}
          />
          <Edges color="#FF8C00" threshold={15} />
        </mesh>
      ))}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[2.2, 0.2, 1.8]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
        <Edges color="#FF8C00" />
      </mesh>
    </group>
  );
}

function SteelFrame({ position = [0, 0, 0] }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const beams = [
    { pos: [0, 1, 0], size: [2, 0.08, 0.08] },
    { pos: [0, 2, 0], size: [2, 0.08, 0.08] },
    { pos: [-0.9, 1.5, 0], size: [0.08, 1, 0.08] },
    { pos: [0.9, 1.5, 0], size: [0.08, 1, 0.08] },
    { pos: [0, 1.5, -0.5], size: [0.08, 1, 0.08] },
    { pos: [0, 1.5, 0.5], size: [0.08, 1, 0.08] },
    { pos: [0, 0.5, -0.5], size: [1.8, 0.06, 0.06] },
    { pos: [0, 0.5, 0.5], size: [1.8, 0.06, 0.06] },
  ];

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={ref} position={position}>
        {beams.map((beam, i) => (
          <mesh key={i} position={beam.pos}>
            <boxGeometry args={beam.size} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.05, 1.2]} />
          <meshStandardMaterial color="#FF8C00" metalness={0.7} roughness={0.3} transparent opacity={0.6} />
        </mesh>
      </group>
    </Float>
  );
}

function RebarGrid({ position = [0, 0, 0] }) {
  const ref = useRef();
  const bars = useMemo(() => {
    const items = [];
    for (let i = 0; i < 6; i++) {
      items.push({ pos: [-1 + i * 0.4, 0.5, -0.3], rot: [0, 0, 0] });
      items.push({ pos: [-1 + i * 0.4, 0.5, 0.3], rot: [0, 0, 0] });
    }
    for (let i = 0; i < 4; i++) {
      items.push({ pos: [0, 0.5 + i * 0.3, 0], rot: [0, Math.PI / 2, 0] });
    }
    return items;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
    }
  });

  return (
    <group ref={ref} position={position}>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.pos} rotation={bar.rot}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
          <meshStandardMaterial color="#FF8C00" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function SceneContent({ variant = 'building', showGrid = true }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#4DA6FF" />
      <pointLight position={[0, 3, 2]} intensity={0.6} color="#FF8C00" />

      {variant === 'building' && (
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
          <Building scale={1.2} />
        </Float>
      )}
      {variant === 'steel' && <SteelFrame />}
      {variant === 'rebar' && <RebarGrid />}
      {variant === 'office' && (
        <>
          <Building scale={0.8} position={[-1, 0, 0]} color="#50C878" />
          <SteelFrame position={[1.5, 0, 0]} />
        </>
      )}

      {showGrid && (
        <Grid
          position={[0, -0.5, 0]}
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#FF8C00"
          fadeDistance={12}
          fadeStrength={1}
          infiniteGrid
        />
      )}
    </>
  );
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}

export default function Scene3D({ variant = 'building', className = '', autoRotate = true }) {
  const isMobile = useIsMobile();

  return (
    <div className={`scene-3d ${className}`}>
      <Canvas
        camera={{ position: [4, 3, 5], fov: isMobile ? 50 : 45 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        style={{ background: 'transparent', width: '100%', height: '100%', display: 'block' }}
      >
        <Suspense fallback={null}>
          <SceneContent variant={variant} showGrid={!isMobile} />
          {autoRotate && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.8}
              maxPolarAngle={Math.PI / 2.2}
              minPolarAngle={Math.PI / 4}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

export { Building, SteelFrame, RebarGrid };
