import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CadModelType } from '../../types';

interface ModelProps {
  modelType: CadModelType;
  exploded: boolean;
  wireframe: boolean;
}

function createGearShape(teeth: number, innerRadius: number, outerRadius: number, holeRadius: number) {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;

  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.34;
    const a3 = a0 + step * 0.66;
    const a4 = a0 + step * 0.78;

    const p0x = Math.cos(a0) * innerRadius;
    const p0y = Math.sin(a0) * innerRadius;
    if (i === 0) shape.moveTo(p0x, p0y);
    else shape.lineTo(p0x, p0y);

    shape.lineTo(Math.cos(a1) * innerRadius, Math.sin(a1) * innerRadius);
    shape.lineTo(Math.cos(a2) * outerRadius, Math.sin(a2) * outerRadius);
    shape.lineTo(Math.cos(a3) * outerRadius, Math.sin(a3) * outerRadius);
    shape.lineTo(Math.cos(a4) * innerRadius, Math.sin(a4) * innerRadius);
  }
  shape.closePath();

  if (holeRadius > 0) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  return shape;
}

const SteelMaterial: React.FC<{ wireframe: boolean; color?: string; metalness?: number; roughness?: number }> = ({
  wireframe,
  color = '#94a3b8',
  metalness = 0.85,
  roughness = 0.24,
}) => (
  <meshStandardMaterial
    color={color}
    metalness={metalness}
    roughness={roughness}
    wireframe={wireframe}
  />
);

const TealAnodizedMaterial: React.FC<{ wireframe: boolean }> = ({ wireframe }) => (
  <meshStandardMaterial
    color="#5bb5b9"
    metalness={0.78}
    roughness={0.22}
    wireframe={wireframe}
  />
);

const DarkAnodizedMaterial: React.FC<{ wireframe: boolean }> = ({ wireframe }) => (
  <meshStandardMaterial
    color="#1e293b"
    metalness={0.82}
    roughness={0.32}
    wireframe={wireframe}
  />
);

const PlanetaryGearModel: React.FC<{ exploded: boolean; wireframe: boolean }> = ({ exploded, wireframe }) => {
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const planet1Ref = useRef<THREE.Mesh>(null);
  const planet2Ref = useRef<THREE.Mesh>(null);
  const planet3Ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const carrierRef = useRef<THREE.Group>(null);

  const sunGeo = useMemo(() => {
    const s = createGearShape(14, 0.42, 0.55, 0.16);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.45, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    geo.center();
    return geo;
  }, []);

  const planetGeo = useMemo(() => {
    const s = createGearShape(12, 0.34, 0.46, 0.12);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.42, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
    geo.center();
    return geo;
  }, []);

  useFrame((_, delta) => {
    const exp = exploded ? 1 : 0;
    if (sunRef.current) {
      sunRef.current.rotation.z += delta * 0.9;
      sunRef.current.position.z = THREE.MathUtils.lerp(sunRef.current.position.z, exp * 1.15, 0.1);
    }
    [planet1Ref, planet2Ref, planet3Ref].forEach((ref) => {
      if (ref.current) {
        ref.current.rotation.z -= delta * 1.05;
        ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, exp * 0.45, 0.1);
      }
    });
    if (ringRef.current) {
      ringRef.current.position.z = THREE.MathUtils.lerp(ringRef.current.position.z, -exp * 0.65, 0.1);
    }
    if (carrierRef.current) {
      carrierRef.current.position.z = THREE.MathUtils.lerp(carrierRef.current.position.z, -exp * 1.35, 0.1);
    }
  });

  const planetOrbit = 0.96;

  return (
    <group ref={groupRef} rotation={[0.35, -0.45, 0]}>
      <mesh ref={sunRef} geometry={sunGeo} castShadow receiveShadow>
        <TealAnodizedMaterial wireframe={wireframe} />
      </mesh>

      {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, idx) => {
        const ref = idx === 0 ? planet1Ref : idx === 1 ? planet2Ref : planet3Ref;
        return (
          <mesh
            key={angle}
            ref={ref}
            geometry={planetGeo}
            position={[Math.cos(angle) * planetOrbit, Math.sin(angle) * planetOrbit, 0]}
            castShadow
            receiveShadow
          >
            <SteelMaterial wireframe={wireframe} color="#cbd5e1" />
          </mesh>
        );
      })}

      {/* Outer Ring Housing */}
      <group ref={ringRef}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.65, 1.65, 0.56, 48, 1, true]} />
          <DarkAnodizedMaterial wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.65, 0.12, 16, 48]} />
          <SteelMaterial wireframe={wireframe} color="#64748b" />
        </mesh>
      </group>

      {/* Carrier Plate */}
      <group ref={carrierRef}>
        <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.38, 1.38, 0.14, 36]} />
          <DarkAnodizedMaterial wireframe={wireframe} />
        </mesh>
        <mesh position={[0, 0, -0.65]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.6, 24]} />
          <SteelMaterial wireframe={wireframe} color="#e2e8f0" />
        </mesh>
      </group>
    </group>
  );
};

const HydraulicFlangeModel: React.FC<{ exploded: boolean; wireframe: boolean }> = ({ exploded, wireframe }) => {
  const topPlateRef = useRef<THREE.Group>(null);
  const oRingRef = useRef<THREE.Mesh>(null);
  const boltsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const exp = exploded ? 1 : 0;
    if (topPlateRef.current) {
      topPlateRef.current.position.y = THREE.MathUtils.lerp(topPlateRef.current.position.y, exp * 0.85, 0.1);
    }
    if (oRingRef.current) {
      oRingRef.current.position.y = THREE.MathUtils.lerp(oRingRef.current.position.y, exp * 0.28, 0.1);
    }
    if (boltsRef.current) {
      boltsRef.current.position.y = THREE.MathUtils.lerp(boltsRef.current.position.y, exp * 1.45, 0.1);
    }
  });

  const boltAngles = [0, 1, 2, 3, 4, 5].map((i) => (i * Math.PI * 2) / 6);

  return (
    <group rotation={[0.2, 0.3, 0]}>
      {/* Base Flange */}
      <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.55, 1.55, 0.32, 48]} />
        <SteelMaterial wireframe={wireframe} color="#94a3b8" />
      </mesh>
      <mesh position={[0, -0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.88, 0.55, 36]} />
        <DarkAnodizedMaterial wireframe={wireframe} />
      </mesh>

      {/* O-Ring Seal */}
      <mesh ref={oRingRef} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.92, 0.06, 16, 48]} />
        <TealAnodizedMaterial wireframe={wireframe} />
      </mesh>

      {/* Upper Counter Flange */}
      <group ref={topPlateRef} position={[0, 0.12, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.55, 1.55, 0.26, 48]} />
          <SteelMaterial wireframe={wireframe} color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.62, 0.72, 0.45, 32]} />
          <SteelMaterial wireframe={wireframe} color="#64748b" />
        </mesh>
      </group>

      {/* 6 Hex Bolts */}
      <group ref={boltsRef}>
        {boltAngles.map((a) => (
          <group key={a} position={[Math.cos(a) * 1.24, 0.32, Math.sin(a) * 1.24]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.13, 0.13, 0.14, 6]} />
              <TealAnodizedMaterial wireframe={wireframe} />
            </mesh>
            <mesh position={[0, -0.28, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.45, 16]} />
              <SteelMaterial wireframe={wireframe} color="#e2e8f0" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

const RobotGripperModel: React.FC<{ exploded: boolean; wireframe: boolean }> = ({ exploded, wireframe }) => {
  const leftJawRef = useRef<THREE.Group>(null);
  const rightJawRef = useRef<THREE.Group>(null);
  const baseRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const exp = exploded ? 1 : 0;
    const pulse = Math.sin(state.clock.elapsedTime * 1.6) * 0.12 + 0.18;
    const offset = exp ? 0.95 : 0.42 + pulse;
    if (leftJawRef.current) {
      leftJawRef.current.position.x = THREE.MathUtils.lerp(leftJawRef.current.position.x, -offset, 0.12);
    }
    if (rightJawRef.current) {
      rightJawRef.current.position.x = THREE.MathUtils.lerp(rightJawRef.current.position.x, offset, 0.12);
    }
    if (baseRef.current) {
      baseRef.current.position.y = THREE.MathUtils.lerp(baseRef.current.position.y, -exp * 0.5, 0.1);
    }
  });

  return (
    <group>
      {/* ISO Mounting Base */}
      <group ref={baseRef}>
        <mesh position={[0, -0.85, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.78, 0.85, 0.28, 32]} />
          <DarkAnodizedMaterial wireframe={wireframe} />
        </mesh>
        <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.65, 0.72, 0.65]} />
          <SteelMaterial wireframe={wireframe} color="#334155" />
        </mesh>
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[1.8, 0.14, 0.22]} />
          <TealAnodizedMaterial wireframe={wireframe} />
        </mesh>
      </group>

      {/* Left Jaw */}
      <group ref={leftJawRef} position={[-0.45, 0.45, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.28, 0.85, 0.42]} />
          <SteelMaterial wireframe={wireframe} color="#cbd5e1" />
        </mesh>
        <mesh position={[0.12, 0.55, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.18, 0.55, 0.36]} />
          <TealAnodizedMaterial wireframe={wireframe} />
        </mesh>
      </group>

      {/* Right Jaw */}
      <group ref={rightJawRef} position={[0.45, 0.45, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.28, 0.85, 0.42]} />
          <SteelMaterial wireframe={wireframe} color="#cbd5e1" />
        </mesh>
        <mesh position={[-0.12, 0.55, 0]} rotation={[0, 0, 0.2]} castShadow>
          <boxGeometry args={[0.18, 0.55, 0.36]} />
          <TealAnodizedMaterial wireframe={wireframe} />
        </mesh>
      </group>
    </group>
  );
};

const SheetMetalBracketModel: React.FC<{ exploded: boolean; wireframe: boolean }> = ({ exploded, wireframe }) => {
  const gusset1Ref = useRef<THREE.Mesh>(null);
  const gusset2Ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const exp = exploded ? 1 : 0;
    if (gusset1Ref.current) {
      gusset1Ref.current.position.z = THREE.MathUtils.lerp(gusset1Ref.current.position.z, 0.72 + exp * 0.65, 0.1);
    }
    if (gusset2Ref.current) {
      gusset2Ref.current.position.z = THREE.MathUtils.lerp(gusset2Ref.current.position.z, -0.72 - exp * 0.65, 0.1);
    }
  });

  return (
    <group rotation={[0.15, -0.4, 0]}>
      {/* Horizontal Base Plate */}
      <mesh position={[0.3, -0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.12, 1.6]} />
        <SteelMaterial wireframe={wireframe} color="#94a3b8" />
      </mesh>
      {/* Vertical Wall */}
      <mesh position={[-0.54, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 1.72, 1.6]} />
        <SteelMaterial wireframe={wireframe} color="#cbd5e1" />
      </mesh>
      {/* Top Flange */}
      <mesh position={[0.15, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.12, 1.6]} />
        <SteelMaterial wireframe={wireframe} color="#94a3b8" />
      </mesh>
      {/* Stiffening Gussets */}
      <mesh ref={gusset1Ref} position={[0.1, -0.1, 0.72]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[1.1, 0.1, 0.1]} />
        <TealAnodizedMaterial wireframe={wireframe} />
      </mesh>
      <mesh ref={gusset2Ref} position={[0.1, -0.1, -0.72]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[1.1, 0.1, 0.1]} />
        <TealAnodizedMaterial wireframe={wireframe} />
      </mesh>
      {/* Mounting Boss */}
      <mesh position={[0.45, -0.52, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.14, 24]} />
        <DarkAnodizedMaterial wireframe={wireframe} />
      </mesh>
    </group>
  );
};

const PistonAssemblyModel: React.FC<{ exploded: boolean; wireframe: boolean }> = ({ exploded, wireframe }) => {
  const pistonRef = useRef<THREE.Group>(null);
  const rodRef = useRef<THREE.Group>(null);
  const crankRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 2.2;
    const exp = exploded ? 1 : 0;
    const stroke = Math.sin(t) * 0.35;

    if (pistonRef.current) {
      pistonRef.current.position.y = THREE.MathUtils.lerp(
        pistonRef.current.position.y,
        (exploded ? 1.25 : 0.75 + stroke),
        0.15
      );
    }
    if (rodRef.current) {
      rodRef.current.position.y = THREE.MathUtils.lerp(
        rodRef.current.position.y,
        (exploded ? 0 : stroke * 0.5),
        0.15
      );
      rodRef.current.rotation.z = exploded ? 0 : Math.cos(t) * 0.18;
    }
    if (crankRef.current) {
      crankRef.current.position.y = THREE.MathUtils.lerp(crankRef.current.position.y, -0.95 - exp * 0.55, 0.12);
      crankRef.current.rotation.z = t;
    }
  });

  return (
    <group>
      {/* Piston Head */}
      <group ref={pistonRef} position={[0, 0.75, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.62, 0.62, 0.72, 36]} />
          <SteelMaterial wireframe={wireframe} color="#cbd5e1" />
        </mesh>
        {[-0.12, 0.04, 0.2].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.62, 0.025, 12, 36]} />
            <TealAnodizedMaterial wireframe={wireframe} />
          </mesh>
        ))}
      </group>

      {/* Connecting Rod */}
      <group ref={rodRef}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.2, 1.35, 0.16]} />
          <SteelMaterial wireframe={wireframe} color="#64748b" />
        </mesh>
        <mesh position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.26, 24]} />
          <DarkAnodizedMaterial wireframe={wireframe} />
        </mesh>
        <mesh position={[0, -0.62, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.26, 24]} />
          <DarkAnodizedMaterial wireframe={wireframe} />
        </mesh>
      </group>

      {/* Crankshaft */}
      <group ref={crankRef} position={[0, -0.95, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 1.5, 24]} />
          <SteelMaterial wireframe={wireframe} color="#94a3b8" />
        </mesh>
        <mesh position={[0, -0.15, 0.28]} castShadow>
          <boxGeometry args={[0.75, 0.62, 0.14]} />
          <DarkAnodizedMaterial wireframe={wireframe} />
        </mesh>
        <mesh position={[0, -0.15, -0.28]} castShadow>
          <boxGeometry args={[0.75, 0.62, 0.14]} />
          <DarkAnodizedMaterial wireframe={wireframe} />
        </mesh>
      </group>
    </group>
  );
};

const IndustrialValveModel: React.FC<{ exploded: boolean; wireframe: boolean }> = ({ exploded, wireframe }) => {
  const bonnetRef = useRef<THREE.Group>(null);
  const wheelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const exp = exploded ? 1 : 0;
    if (bonnetRef.current) {
      bonnetRef.current.position.y = THREE.MathUtils.lerp(bonnetRef.current.position.y, 0.55 + exp * 0.55, 0.1);
    }
    if (wheelRef.current) {
      wheelRef.current.position.y = THREE.MathUtils.lerp(wheelRef.current.position.y, 1.25 + exp * 1.1, 0.1);
      wheelRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Main Horizontal Pipe Body */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 2.1, 32]} />
        <DarkAnodizedMaterial wireframe={wireframe} />
      </mesh>
      {/* Left & Right Flanges */}
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.82, 0.82, 0.16, 32]} />
          <SteelMaterial wireframe={wireframe} color="#94a3b8" />
        </mesh>
      ))}
      {/* Central Valve Chamber */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.58, 0.58, 0.85, 32]} />
        <DarkAnodizedMaterial wireframe={wireframe} />
      </mesh>

      {/* Bonnet & Stem */}
      <group ref={bonnetRef} position={[0, 0.55, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.64, 0.64, 0.16, 32]} />
          <SteelMaterial wireframe={wireframe} color="#cbd5e1" />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.72, 20]} />
          <SteelMaterial wireframe={wireframe} color="#e2e8f0" />
        </mesh>
      </group>

      {/* Handwheel */}
      <group ref={wheelRef} position={[0, 1.25, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.68, 0.065, 16, 40]} />
          <TealAnodizedMaterial wireframe={wireframe} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 1.32, 16]} />
          <TealAnodizedMaterial wireframe={wireframe} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 1.32, 16]} />
          <TealAnodizedMaterial wireframe={wireframe} />
        </mesh>
      </group>
    </group>
  );
};

export const MechanicalModel: React.FC<ModelProps> = ({ modelType, exploded, wireframe }) => {
  switch (modelType) {
    case 'planetary-gear':
      return <PlanetaryGearModel exploded={exploded} wireframe={wireframe} />;
    case 'hydraulic-flange':
      return <HydraulicFlangeModel exploded={exploded} wireframe={wireframe} />;
    case 'robot-gripper':
      return <RobotGripperModel exploded={exploded} wireframe={wireframe} />;
    case 'sheet-metal-bracket':
      return <SheetMetalBracketModel exploded={exploded} wireframe={wireframe} />;
    case 'piston-assembly':
      return <PistonAssemblyModel exploded={exploded} wireframe={wireframe} />;
    case 'industrial-valve':
      return <IndustrialValveModel exploded={exploded} wireframe={wireframe} />;
  }
};
