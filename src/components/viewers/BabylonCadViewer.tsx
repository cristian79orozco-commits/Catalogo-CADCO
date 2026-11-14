import React, { useEffect, useRef } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PBRMetallicRoughnessMaterial,
  Scene,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import type { CadModelType } from '../../types';

interface BabylonCadViewerProps {
  modelType: CadModelType;
  wireframe: boolean;
  autoRotate: boolean;
}

export const BabylonCadViewer: React.FC<BabylonCadViewerProps> = ({
  modelType,
  wireframe,
  autoRotate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const materialsRef = useRef<PBRMetallicRoughnessMaterial[]>([]);
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      mat.wireframe = wireframe;
    });
  }, [wireframe]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.027, 0.039, 0.059, 1);

    const camera = new ArcRotateCamera('cadcoCam', -Math.PI / 3, Math.PI / 2.6, 5.2, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 30;
    camera.minZ = 0.1;

    const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
    hemi.intensity = 0.85;

    const dir1 = new DirectionalLight('dir1', new Vector3(-1, -2, -1), scene);
    dir1.position = new Vector3(5, 8, 5);
    dir1.intensity = 1.6;

    const dir2 = new DirectionalLight('dir2', new Vector3(1, -0.5, 1), scene);
    dir2.diffuse = Color3.FromHexString('#5bb5b9');
    dir2.intensity = 0.9;

    const steelMat = new PBRMetallicRoughnessMaterial('steelMat', scene);
    steelMat.baseColor = Color3.FromHexString('#cbd5e1');
    steelMat.metallic = 0.88;
    steelMat.roughness = 0.25;
    steelMat.wireframe = wireframe;

    const tealMat = new PBRMetallicRoughnessMaterial('tealMat', scene);
    tealMat.baseColor = Color3.FromHexString('#5bb5b9');
    tealMat.metallic = 0.78;
    tealMat.roughness = 0.22;
    tealMat.wireframe = wireframe;

    const darkMat = new PBRMetallicRoughnessMaterial('darkMat', scene);
    darkMat.baseColor = Color3.FromHexString('#1e293b');
    darkMat.metallic = 0.82;
    darkMat.roughness = 0.34;
    darkMat.wireframe = wireframe;

    materialsRef.current = [steelMat, tealMat, darkMat];

    const root = new TransformNode('cadcoAssembly', scene);

    if (modelType === 'planetary-gear') {
      const sun = MeshBuilder.CreateCylinder('sun', { diameter: 1.0, height: 0.45, tessellation: 18 }, scene);
      sun.material = tealMat;
      sun.parent = root;

      const ring = MeshBuilder.CreateTorus('ring', { diameter: 3.1, thickness: 0.24, tessellation: 42 }, scene);
      ring.rotation.x = Math.PI / 2;
      ring.material = darkMat;
      ring.parent = root;

      [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((a, i) => {
        const planet = MeshBuilder.CreateCylinder(`planet_${i}`, { diameter: 0.78, height: 0.42, tessellation: 14 }, scene);
        planet.position = new Vector3(Math.cos(a) * 0.95, Math.sin(a) * 0.95, 0);
        planet.rotation.x = Math.PI / 2;
        planet.material = steelMat;
        planet.parent = root;
      });
      sun.rotation.x = Math.PI / 2;
    } else if (modelType === 'hydraulic-flange') {
      const base = MeshBuilder.CreateCylinder('flangeBase', { diameter: 2.8, height: 0.35, tessellation: 40 }, scene);
      base.material = steelMat;
      base.parent = root;
      const neck = MeshBuilder.CreateCylinder('neck', { diameterTop: 1.3, diameterBottom: 1.6, height: 0.9, tessellation: 32 }, scene);
      neck.position.y = 0.55;
      neck.material = darkMat;
      neck.parent = root;
      const seal = MeshBuilder.CreateTorus('seal', { diameter: 1.85, thickness: 0.1, tessellation: 36 }, scene);
      seal.position.y = 0.2;
      seal.material = tealMat;
      seal.parent = root;
    } else if (modelType === 'robot-gripper') {
      const body = MeshBuilder.CreateBox('gripperBody', { width: 1.7, height: 0.7, depth: 0.65 }, scene);
      body.material = darkMat;
      body.parent = root;
      [-0.55, 0.55].forEach((x, idx) => {
        const jaw = MeshBuilder.CreateBox(`jaw_${idx}`, { width: 0.26, height: 1.1, depth: 0.4 }, scene);
        jaw.position = new Vector3(x, 0.85, 0);
        jaw.material = idx === 0 ? steelMat : tealMat;
        jaw.parent = root;
      });
    } else if (modelType === 'sheet-metal-bracket') {
      const base = MeshBuilder.CreateBox('smBase', { width: 1.8, height: 0.12, depth: 1.5 }, scene);
      base.position = new Vector3(0.3, -0.6, 0);
      base.material = steelMat;
      base.parent = root;
      const wall = MeshBuilder.CreateBox('smWall', { width: 0.12, height: 1.6, depth: 1.5 }, scene);
      wall.position = new Vector3(-0.54, 0.15, 0);
      wall.material = tealMat;
      wall.parent = root;
    } else if (modelType === 'piston-assembly') {
      const piston = MeshBuilder.CreateCylinder('piston', { diameter: 1.2, height: 0.75, tessellation: 32 }, scene);
      piston.position.y = 0.85;
      piston.material = steelMat;
      piston.parent = root;
      const rod = MeshBuilder.CreateBox('rod', { width: 0.22, height: 1.35, depth: 0.18 }, scene);
      rod.material = darkMat;
      rod.parent = root;
      const ring = MeshBuilder.CreateTorus('compRing', { diameter: 1.24, thickness: 0.05, tessellation: 32 }, scene);
      ring.position.y = 1.05;
      ring.material = tealMat;
      ring.parent = root;
    } else {
      const pipe = MeshBuilder.CreateCylinder('pipe', { diameter: 0.9, height: 2.1, tessellation: 32 }, scene);
      pipe.rotation.z = Math.PI / 2;
      pipe.material = darkMat;
      pipe.parent = root;
      const stem = MeshBuilder.CreateCylinder('stem', { diameter: 0.26, height: 1.4, tessellation: 20 }, scene);
      stem.position.y = 0.65;
      stem.material = steelMat;
      stem.parent = root;
      const wheel = MeshBuilder.CreateTorus('wheel', { diameter: 1.35, thickness: 0.12, tessellation: 36 }, scene);
      wheel.position.y = 1.3;
      wheel.material = tealMat;
      wheel.parent = root;
    }

    engine.runRenderLoop(() => {
      if (autoRotateRef.current) {
        camera.alpha += 0.008;
      }
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [modelType]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#070a0f]">
      <canvas ref={canvasRef} className="h-full w-full outline-none" />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-[#5bb5b9]/30 bg-black/70 px-2.5 py-1 text-[11px] font-mono-tech text-[#5bb5b9] backdrop-blur-sm">
        Engine: Babylon.js PBR (Apache 2.0)
      </div>
    </div>
  );
};
