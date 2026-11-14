import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Grid, OrbitControls, Stage } from '@react-three/drei';
import type { CadModelType } from '../../types';
import { MechanicalModel } from './MechanicalModels';

interface R3FCadViewerProps {
  modelType: CadModelType;
  exploded: boolean;
  wireframe: boolean;
  autoRotate: boolean;
  compact?: boolean;
}

export const R3FCadViewer: React.FC<R3FCadViewerProps> = ({
  modelType,
  exploded,
  wireframe,
  autoRotate,
  compact = false,
}) => {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-b from-[#0b1017] to-[#050608]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: compact ? [3.4, 2.5, 3.8] : [3.8, 2.7, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#070a0f']} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[6, 8, 5]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-5, 4, -4]} intensity={1.1} color="#5bb5b9" />
        <pointLight position={[0, -3, 3]} intensity={0.6} color="#94a3b8" />

        <Suspense fallback={null}>
          <Stage intensity={0.45} adjustCamera={false} shadows={false}>
            <MechanicalModel modelType={modelType} exploded={exploded} wireframe={wireframe} />
          </Stage>

          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.45}
            scale={8}
            blur={2.2}
            far={4}
            color="#000000"
          />

          <Grid
            position={[0, -1.61, 0]}
            args={[14, 14]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#1e293b"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#5bb5b9"
            fadeDistance={12}
            fadeStrength={1.5}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.07}
          autoRotate={autoRotate}
          autoRotateSpeed={1.35}
          minDistance={2.0}
          maxDistance={9.5}
        />
      </Canvas>
    </div>
  );
};
