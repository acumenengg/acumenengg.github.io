import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  Edges,
  Float,
  Line,
  RoundedBox,
  ContactShadows,
  Environment,
} from '@react-three/drei';
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
const STEEL_SOLID = { color: '#8b9aab', metalness: 0.94, roughness: 0.22 };
const CONCRETE_SOLID = { color: '#6b7280', metalness: 0.08, roughness: 0.82 };
const GLASS = {
  color: '#7ec8ff',
  metalness: 0.15,
  roughness: 0.05,
  transparent: true,
  opacity: 0.35,
  envMapIntensity: 1.2,
};
const REBAR_LINE = '#FF8C00';

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

/** I-beam profile extruded along local X axis */
function IBeam({ length, material = STEEL_SOLID, castShadow = false }) {
  const fw = 0.1;
  const ft = 0.02;
  const ww = 0.016;
  const wh = 0.085;
  const halfH = wh / 2 - ft / 2;

  return (
    <group>
      <mesh position={[0, halfH, 0]} castShadow={castShadow}>
        <boxGeometry args={[length, ft, fw]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh castShadow={castShadow}>
        <boxGeometry args={[length, wh - ft * 2, ww]} />
        <meshStandardMaterial {...material} />
      </mesh>
      <mesh position={[0, -halfH, 0]} castShadow={castShadow}>
        <boxGeometry args={[length, ft, fw]} />
        <meshStandardMaterial {...material} />
      </mesh>
    </group>
  );
}

function SteelColumn({ x, z, height, castShadow = false }) {
  return (
    <group position={[x, height / 2, z]} rotation={[0, 0, Math.PI / 2]}>
      <IBeam length={height} castShadow={castShadow} />
    </group>
  );
}

function SteelBeam({ from, to, castShadow = false }) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(1, 0, 0),
    dir.clone().normalize()
  );
  const euler = new THREE.Euler().setFromQuaternion(quat);

  return (
    <group position={[mid.x, mid.y, mid.z]} rotation={[euler.x, euler.y, euler.z]}>
      <IBeam length={length} castShadow={castShadow} />
    </group>
  );
}

function ConcreteSlab({ y, width, depth, thickness = 0.07, castShadow = false }) {
  return (
    <RoundedBox
      args={[width, thickness, depth]}
      position={[0, y, 0]}
      radius={0.012}
      smoothness={3}
      castShadow={castShadow}
      receiveShadow={castShadow}
    >
      <meshStandardMaterial {...CONCRETE_SOLID} transparent opacity={0.88} />
    </RoundedBox>
  );
}

function GlassPanel({ position, size, castShadow = false }) {
  return (
    <mesh position={position} castShadow={castShadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial {...GLASS} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SlabRebarOverlay({ y, width, depth, spacing = 0.2 }) {
  const lines = useMemo(() => {
    const items = [];
    const countX = Math.floor(width / spacing);
    const countZ = Math.floor(depth / spacing);
    for (let i = 0; i <= countX; i++) {
      const x = -width / 2 + (i / countX) * width;
      items.push([
        [x, y, -depth / 2 + 0.04],
        [x, y, depth / 2 - 0.04],
      ]);
    }
    for (let i = 0; i <= countZ; i++) {
      const z = -depth / 2 + (i / countZ) * depth;
      items.push([
        [-width / 2 + 0.04, y, z],
        [width / 2 - 0.04, y, z],
      ]);
    }
    return items;
  }, [y, width, depth, spacing]);

  return (
    <group>
      {lines.map((points, i) => (
        <Line key={i} points={points} color={REBAR_LINE} lineWidth={1.5} transparent opacity={0.85} />
      ))}
    </group>
  );
}

/** Solid steel frame + concrete slabs + glass facade — realistic commercial structure */
function RealisticStructuralModel({ detailed = true, castShadow = false }) {
  const footprint = { w: 2.35, d: 1.75 };
  const floorCount = detailed ? 5 : 4;
  const floorHeight = 0.58;
  const slabT = 0.065;

  const floors = useMemo(
    () =>
      Array.from({ length: floorCount }, (_, i) => ({
        y: i * floorHeight + 0.12,
        width: footprint.w - i * 0.04,
        depth: footprint.d - i * 0.03,
      })),
    [floorCount, floorHeight, footprint.d, footprint.w]
  );

  const columns = useMemo(
    () =>
      detailed
        ? [
            [-footprint.w / 2 + 0.08, -footprint.d / 2 + 0.08],
            [footprint.w / 2 - 0.08, -footprint.d / 2 + 0.08],
            [footprint.w / 2 - 0.08, footprint.d / 2 - 0.08],
            [-footprint.w / 2 + 0.08, footprint.d / 2 - 0.08],
            [0, -footprint.d / 2 + 0.08],
            [0, footprint.d / 2 - 0.08],
            [-footprint.w / 2 + 0.08, 0],
            [footprint.w / 2 - 0.08, 0],
          ]
        : [
            [-footprint.w / 2 + 0.08, -footprint.d / 2 + 0.08],
            [footprint.w / 2 - 0.08, -footprint.d / 2 + 0.08],
            [footprint.w / 2 - 0.08, footprint.d / 2 - 0.08],
            [-footprint.w / 2 + 0.08, footprint.d / 2 - 0.08],
          ],
    [detailed, footprint.d, footprint.w]
  );

  const totalHeight = floors[floors.length - 1].y + floorHeight;
  const hw = footprint.w / 2 - 0.08;
  const hd = footprint.d / 2 - 0.08;

  return (
    <group>
      {/* Foundation */}
      <RoundedBox
        args={[footprint.w + 0.2, 0.14, footprint.d + 0.16]}
        position={[0, -0.07, 0]}
        radius={0.02}
        smoothness={2}
        receiveShadow={castShadow}
        castShadow={castShadow}
      >
        <meshStandardMaterial {...CONCRETE_SOLID} />
      </RoundedBox>

      {detailed && (
        <SlabRebarOverlay y={0.02} width={footprint.w + 0.05} depth={footprint.d + 0.05} spacing={0.16} />
      )}

      {/* Steel columns */}
      {columns.map(([x, z], i) => (
        <SteelColumn key={`col-${i}`} x={x} z={z} height={totalHeight} castShadow={castShadow} />
      ))}

      {/* Floors: slabs, beams, rebar overlay, bracing */}
      {floors.map((floor, i) => {
        const beamY = floor.y + slabT / 2 + 0.04;
        const slabY = floor.y + slabT / 2;
        const w = floor.width;
        const d = floor.depth;
        const halfW = w / 2 - 0.08;
        const halfD = d / 2 - 0.08;

        return (
          <group key={`floor-${i}`}>
            <ConcreteSlab y={slabY} width={w} depth={d} thickness={slabT} castShadow={castShadow} />

            {/* Perimeter beams */}
            <SteelBeam from={[-halfW, beamY, -halfD]} to={[halfW, beamY, -halfD]} castShadow={castShadow} />
            <SteelBeam from={[halfW, beamY, -halfD]} to={[halfW, beamY, halfD]} castShadow={castShadow} />
            <SteelBeam from={[halfW, beamY, halfD]} to={[-halfW, beamY, halfD]} castShadow={castShadow} />
            <SteelBeam from={[-halfW, beamY, halfD]} to={[-halfW, beamY, -halfD]} castShadow={castShadow} />

            {/* Interior beam grid */}
            {detailed && (
              <>
                <SteelBeam from={[0, beamY, -halfD]} to={[0, beamY, halfD]} castShadow={castShadow} />
                <SteelBeam from={[-halfW, beamY, 0]} to={[halfW, beamY, 0]} castShadow={castShadow} />
              </>
            )}

            {detailed && <SlabRebarOverlay y={floor.y + 0.01} width={w - 0.12} depth={d - 0.12} spacing={0.18} />}

            {/* X-bracing on mid floors */}
            {detailed && i === 1 && (
              <>
                <Line
                  points={[[-halfW, beamY + 0.35, -halfD], [halfW, beamY + 0.35, halfD]]}
                  color={REBAR_LINE}
                  lineWidth={2}
                />
                <Line
                  points={[[halfW, beamY + 0.35, -halfD], [-halfW, beamY + 0.35, halfD]]}
                  color={REBAR_LINE}
                  lineWidth={2}
                />
              </>
            )}
          </group>
        );
      })}

      {/* Roof parapet */}
      <RoundedBox
        args={[footprint.w - 0.15, 0.08, footprint.d - 0.12]}
        position={[0, totalHeight + 0.04, 0]}
        radius={0.01}
        smoothness={2}
        castShadow={castShadow}
      >
        <meshStandardMaterial {...CONCRETE_SOLID} />
      </RoundedBox>

      {/* Glass curtain wall — front facade */}
      {detailed && (
        <group position={[0, totalHeight / 2, -hd - 0.018]}>
          {[-0.55, -0.18, 0.18, 0.55].map((x, i) => (
            <GlassPanel
              key={`glass-${i}`}
              position={[x, 0, 0]}
              size={[0.36, totalHeight - 0.35, 0.012]}
              castShadow={castShadow}
            />
          ))}
        </group>
      )}

      {/* Side glazing */}
      {detailed && (
        <group position={[hw + 0.018, totalHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          {[-0.4, 0, 0.4].map((z, i) => (
            <GlassPanel
              key={`side-glass-${i}`}
              position={[z, 0, 0]}
              size={[0.32, totalHeight - 0.4, 0.012]}
              castShadow={castShadow}
            />
          ))}
        </group>
      )}

      {/* Concrete core (stair/elevator shaft) */}
      {detailed && (
        <RoundedBox
          args={[0.38, totalHeight - 0.2, 0.38]}
          position={[hw * 0.35, totalHeight / 2, hd * 0.2]}
          radius={0.015}
          smoothness={2}
          castShadow={castShadow}
        >
          <meshStandardMaterial {...CONCRETE_SOLID} color="#52525b" roughness={0.9} />
        </RoundedBox>
      )}

      {/* Orange BIM edge highlights on footprint */}
      <Line
        points={[
          [-hw, 0.01, -hd],
          [hw, 0.01, -hd],
          [hw, 0.01, hd],
          [-hw, 0.01, hd],
          [-hw, 0.01, -hd],
        ]}
        color={REBAR_LINE}
        lineWidth={2.5}
      />
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

function SteelFrame({ position = [0, 0, 0], detailed = true, castShadow = false }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <group ref={ref} position={position} scale={0.9}>
      <RealisticStructuralModel detailed={detailed} castShadow={castShadow} />
    </group>
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
  const cinematic = variant === 'steel';
  const shadows = cinematic && detailed;

  return (
    <>
      <ambientLight intensity={cinematic ? 0.35 : 0.55} />
      <hemisphereLight intensity={cinematic ? 0.45 : 0} groundColor="#1a2332" color="#c8d8f0" />
      <directionalLight
        position={[5, 9, 4]}
        intensity={cinematic ? 1.65 : 1.4}
        color="#fff8f0"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-4, 5, -3]} intensity={cinematic ? 0.35 : 0.5} color="#4DA6FF" />
      <pointLight position={[2, 3, 3]} intensity={cinematic ? 0.7 : 1.1} color="#FF8C00" />
      <pointLight position={[-2, 2, -2]} intensity={cinematic ? 0.35 : 0.55} color="#FF8C00" />

      {cinematic && detailed && <Environment preset="city" environmentIntensity={0.55} />}

      {variant === 'building' && (
        <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.25}>
          <group scale={0.95}>
            <StructuralBIMModel detailed={detailed} />
          </group>
        </Float>
      )}
      {variant === 'steel' && (
        <>
          <SteelFrame detailed={detailed} castShadow={shadows} />
          {shadows && (
            <ContactShadows
              position={[0, -0.14, 0]}
              opacity={0.45}
              scale={8}
              blur={2.2}
              far={4}
              color="#0f172a"
            />
          )}
        </>
      )}
      {variant === 'rebar' && <RebarGrid />}
      {variant === 'office' && (
        <>
          <Building scale={0.75} position={[-0.8, 0, 0]} />
          <SteelFrame position={[1.4, 0, 0]} detailed={detailed} castShadow={shadows} />
        </>
      )}

      {showGrid && !cinematic && (
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
  const cinematic = variant === 'steel';

  return (
    <div className={`scene-3d ${className}`}>
      <Canvas
        camera={{
          position: cinematic ? [4.2, 2.65, 5.2] : [3.8, 2.8, 4.8],
          fov: isMobile ? 48 : cinematic ? 40 : 42,
        }}
        dpr={isMobile ? 1 : [1, 1.5]}
        shadows={cinematic && !isMobile}
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
              autoRotateSpeed={cinematic ? 0.45 : 0.65}
              maxPolarAngle={Math.PI / 2.1}
              minPolarAngle={Math.PI / 5}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

export { Building, SteelFrame, RebarGrid, StructuralBIMModel, RealisticStructuralModel };
