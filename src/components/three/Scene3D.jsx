import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Edges, Float, Line } from '@react-three/drei';
import * as THREE from 'three';

const STEEL = { color: '#c8d0d8', metalness: 0.92, roughness: 0.18 };
const REBAR = {
  color: '#FF8C00',
  emissive: '#FF6A00',
  emissiveIntensity: 0.55,
  metalness: 0.9,
  roughness: 0.2,
};
const REBAR_TIE = {
  color: '#FFB347',
  emissive: '#FF8C00',
  emissiveIntensity: 0.35,
  metalness: 0.85,
  roughness: 0.25,
};
const SLAB = { color: '#4DA6FF', transparent: true, opacity: 0.14, metalness: 0.6, roughness: 0.35 };
const CONCRETE = { color: '#64748b', metalness: 0.45, roughness: 0.55 };

function RebarRod({ from, to, radius = 0.022, tie = false }) {
  const { position, rotation, length } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(end, start);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    const euler = new THREE.Euler().setFromQuaternion(quat);
    return {
      position: [mid.x, mid.y, mid.z],
      rotation: [euler.x, euler.y, euler.z],
      length: len,
    };
  }, [from, to]);

  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial {...(tie ? REBAR_TIE : REBAR)} />
    </mesh>
  );
}

function ColumnRebarCage({ x, z, height, width = 0.35, depth = 0.35, detailed = true }) {
  const hw = width / 2;
  const hd = depth / 2;
  const corners = [
    [x - hw, z - hd],
    [x + hw, z - hd],
    [x + hw, z + hd],
    [x - hw, z + hd],
  ];
  const spacing = detailed ? 0.22 : 0.32;
  const tieHeights = [];
  for (let y = 0.12; y < height - 0.08; y += spacing) {
    tieHeights.push(y);
  }

  return (
    <group>
      {corners.map(([cx, cz], i) => (
        <RebarRod key={`v-${i}`} from={[cx, 0.05, cz]} to={[cx, height, cz]} radius={detailed ? 0.028 : 0.024} />
      ))}
      {tieHeights.map((y, i) => (
        <group key={`tie-${i}`}>
          <RebarRod tie from={[corners[0][0], y, corners[0][1]]} to={[corners[1][0], y, corners[1][1]]} radius={0.02} />
          <RebarRod tie from={[corners[1][0], y, corners[1][1]]} to={[corners[2][0], y, corners[2][1]]} radius={0.02} />
          <RebarRod tie from={[corners[2][0], y, corners[2][1]]} to={[corners[3][0], y, corners[3][1]]} radius={0.02} />
          <RebarRod tie from={[corners[3][0], y, corners[3][1]]} to={[corners[0][0], y, corners[0][1]]} radius={0.02} />
          {detailed && (
            <>
              <RebarRod tie from={[corners[0][0], y, corners[0][1]]} to={[corners[2][0], y, corners[2][1]]} radius={0.014} />
              <RebarRod tie from={[corners[1][0], y, corners[1][1]]} to={[corners[3][0], y, corners[3][1]]} radius={0.014} />
            </>
          )}
        </group>
      ))}
    </group>
  );
}

function BeamStirrups({ y, width, depth, count = 5 }) {
  const stirrups = useMemo(() => {
    const items = [];
    const hw = width / 2 - 0.06;
    const hd = depth / 2 - 0.06;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = -hw + t * hw * 2;
      items.push([
        [x, y, -hd],
        [x, y, hd],
        [x, y + 0.12, hd],
        [x, y + 0.12, -hd],
        [x, y, -hd],
      ]);
    }
    return items;
  }, [y, width, depth, count]);

  return (
    <group>
      {stirrups.map((points, i) => (
        <Line key={i} points={points} color="#FF8C00" lineWidth={2.5} />
      ))}
    </group>
  );
}

function SteelMember({ position, size, rotation = [0, 0, 0], ghost = false }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        {...STEEL}
        transparent
        opacity={ghost ? 0.12 : 0.35}
      />
      <Edges color="#FF8C00" threshold={12} />
    </mesh>
  );
}

function SlabRebarMat({ y, width, depth, spacing = 0.22, prominent = false }) {
  const barRadius = prominent ? 0.022 : 0.018;
  const bars = useMemo(() => {
    const items = [];
    const countX = Math.floor(width / spacing);
    const countZ = Math.floor(depth / spacing);
    const startX = -width / 2 + spacing / 2;
    const startZ = -depth / 2 + spacing / 2;

    for (let i = 0; i <= countX; i++) {
      const x = startX + i * spacing;
      items.push({ from: [x, y, -depth / 2 + 0.05], to: [x, y, depth / 2 - 0.05] });
    }
    for (let i = 0; i <= countZ; i++) {
      const z = startZ + i * spacing;
      items.push({ from: [-width / 2 + 0.05, y, z], to: [width / 2 - 0.05, y, z] });
    }
    return items;
  }, [y, width, depth, spacing]);

  return (
    <group>
      {bars.map((bar, i) => (
        <RebarRod key={i} {...bar} radius={barRadius} />
      ))}
    </group>
  );
}

/** Combined steel frame + rebar cages + BIM wireframe slabs */
function StructuralBIMModel({ detailed = true }) {
  const groupRef = useRef();

  const floors = useMemo(
    () =>
      (detailed ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3]).map((i) => ({
        y: i * 0.62 + 0.08,
        width: 2.4 - i * 0.06,
        depth: 1.8 - i * 0.04,
      })),
    [detailed]
  );

  const columns = useMemo(
    () =>
      detailed
        ? [
            [-0.95, -0.75],
            [0.95, -0.75],
            [0.95, 0.75],
            [-0.95, 0.75],
            [-0.95, 0],
            [0.95, 0],
            [0, -0.75],
            [0, 0.75],
          ]
        : [
            [-0.95, -0.75],
            [0.95, -0.75],
            [0.95, 0.75],
            [-0.95, 0.75],
          ],
    [detailed]
  );

  const totalHeight = floors[floors.length - 1].y + 0.5;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Foundation with dense rebar mat */}
      <mesh position={[0, -0.08, 0]}>
        <boxGeometry args={[2.6, 0.16, 2.0]} />
        <meshStandardMaterial {...CONCRETE} transparent opacity={0.45} />
        <Edges color="#FF8C00" threshold={15} />
      </mesh>
      <SlabRebarMat y={0.02} width={2.3} depth={1.75} spacing={detailed ? 0.14 : 0.2} prominent />
      <SlabRebarMat y={0.06} width={2.1} depth={1.55} spacing={detailed ? 0.16 : 0.22} prominent />

      {/* Ghost steel columns — rebar cages are the focus */}
      {columns.map(([x, z], i) => (
        <SteelMember
          key={`col-${i}`}
          position={[x, totalHeight / 2, z]}
          size={[0.09, totalHeight, 0.09]}
          ghost
        />
      ))}

      {/* Rebar column cages at every column */}
      {columns.map(([x, z], i) => (
        <ColumnRebarCage
          key={`cage-${i}`}
          x={x}
          z={z}
          height={totalHeight - 0.1}
          width={0.3}
          depth={0.3}
          detailed={detailed}
        />
      ))}

      {/* Floor slabs + beam rebar + slab mats */}
      {floors.map((floor, i) => {
        const beamY = floor.y + 0.22;
        return (
          <group key={`floor-${i}`}>
            <mesh position={[0, floor.y, 0]}>
              <boxGeometry args={[floor.width, 0.06, floor.depth]} />
              <meshStandardMaterial {...SLAB} opacity={0.08} />
              <Edges color="#FF8C00" linewidth={1} threshold={10} />
            </mesh>

            <SlabRebarMat
              y={floor.y + 0.02}
              width={floor.width - 0.12}
              depth={floor.depth - 0.12}
              spacing={detailed ? 0.16 : 0.24}
              prominent
            />
            <SlabRebarMat
              y={floor.y + 0.05}
              width={floor.width - 0.2}
              depth={floor.depth - 0.2}
              spacing={detailed ? 0.18 : 0.26}
              prominent
            />

            <SteelMember ghost position={[0, beamY, -floor.depth / 2 + 0.08]} size={[floor.width, 0.07, 0.07]} />
            <SteelMember ghost position={[0, beamY, floor.depth / 2 - 0.08]} size={[floor.width, 0.07, 0.07]} />
            <SteelMember ghost position={[0, beamY, 0]} size={[floor.width, 0.06, 0.06]} />
            <SteelMember ghost position={[-floor.width / 2 + 0.08, beamY, 0]} size={[0.07, 0.07, floor.depth]} />
            <SteelMember ghost position={[floor.width / 2 - 0.08, beamY, 0]} size={[0.07, 0.07, floor.depth]} />

            {detailed && (
              <>
                <BeamStirrups y={beamY - 0.04} width={floor.width} depth={floor.depth} count={6} />
                <Line
                  points={[
                    [-floor.width / 2 + 0.1, beamY, -floor.depth / 2 + 0.1],
                    [floor.width / 2 - 0.1, beamY, floor.depth / 2 - 0.1],
                  ]}
                  color="#FF8C00"
                  lineWidth={2}
                  transparent
                  opacity={0.85}
                />
                <Line
                  points={[
                    [floor.width / 2 - 0.1, beamY, -floor.depth / 2 + 0.1],
                    [-floor.width / 2 + 0.1, beamY, floor.depth / 2 - 0.1],
                  ]}
                  color="#FF8C00"
                  lineWidth={2}
                  transparent
                  opacity={0.85}
                />
              </>
            )}
          </group>
        );
      })}

      {/* Roof rebar hint */}
      <SlabRebarMat y={totalHeight + 0.08} width={1.8} depth={1.4} spacing={detailed ? 0.18 : 0.24} prominent />
      <SteelMember ghost position={[0, totalHeight + 0.15, 0]} size={[2.0, 0.06, 0.06]} />
    </group>
  );
}

function Building({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <StructuralBIMModel />
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

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={ref} position={position} scale={0.85}>
        <StructuralBIMModel />
      </group>
    </Float>
  );
}

function RebarGrid({ position = [0, 0, 0] }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
    }
  });

  return (
    <group ref={ref} position={position}>
      <ColumnRebarCage x={0} z={0} height={2.2} width={0.9} depth={0.9} />
      <SlabRebarMat y={0.1} width={1.6} depth={1.6} spacing={0.18} />
      <SlabRebarMat y={0.55} width={1.6} depth={1.6} spacing={0.18} />
      {[-0.4, 0, 0.4].map((x) => (
        <SteelMember key={x} position={[x, 1.1, 0]} size={[0.06, 1.4, 0.06]} />
      ))}
    </group>
  );
}

function SceneContent({ variant = 'building', showGrid = true, detailed = true }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 10, 5]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-4, 5, -3]} intensity={0.5} color="#4DA6FF" />
      <pointLight position={[2, 4, 3]} intensity={1.1} color="#FF8C00" />
      <pointLight position={[-2, 2, -2]} intensity={0.55} color="#FF8C00" />

      {variant === 'building' && (
        <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.25}>
          <group scale={0.95}>
            <StructuralBIMModel detailed={detailed} />
          </group>
        </Float>
      )}
      {variant === 'steel' && <SteelFrame />}
      {variant === 'rebar' && <RebarGrid />}
      {variant === 'office' && (
        <>
          <Building scale={0.75} position={[-0.8, 0, 0]} />
          <SteelFrame position={[1.4, 0, 0]} />
        </>
      )}

      {showGrid && (
        <Grid
          position={[0, -0.2, 0]}
          args={[12, 12]}
          cellSize={0.4}
          cellThickness={0.4}
          cellColor="#1e293b"
          sectionSize={1.6}
          sectionThickness={0.8}
          sectionColor="#FF8C00"
          fadeDistance={14}
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
        camera={{ position: [3.8, 2.8, 4.8], fov: isMobile ? 48 : 42 }}
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
          <SceneContent variant={variant} showGrid={!isMobile} detailed={!isMobile} />
          {autoRotate && (
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.65}
              maxPolarAngle={Math.PI / 2.1}
              minPolarAngle={Math.PI / 5}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

export { Building, SteelFrame, RebarGrid, StructuralBIMModel };
