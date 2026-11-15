import React, { useEffect, useRef, useState } from 'react';
import * as OV from 'online-3d-viewer';
import { Layers } from 'lucide-react';
import type { CustomCadFile } from '../../types';

interface CustomCadFileViewerProps {
  cadFile: CustomCadFile;
}

function dataUrlToFile(dataUrl: string, fileName: string): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(arr[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}

type StudioFace = 'posx' | 'negx' | 'posy' | 'negy' | 'posz' | 'negz';

let cachedStudioEnvUrls: string[] | null = null;

/**
 * Generates a procedural 6-face studio cubemap (offscreen data URLs)
 * to give CAD models SolidWorks-style metallic reflections without network dependencies.
 */
function getStudioEnvironmentUrls(): string[] {
  if (cachedStudioEnvUrls) return cachedStudioEnvUrls;

  const size = 256;
  const faces: StudioFace[] = ['posx', 'negx', 'posy', 'negy', 'posz', 'negz'];

  cachedStudioEnvUrls = faces.map((face) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (face === 'posy') {
      // Bright overhead studio softbox
      const grad = ctx.createRadialGradient(
        size * 0.5,
        size * 0.5,
        size * 0.08,
        size * 0.5,
        size * 0.5,
        size * 0.72
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.45, '#eef2f7');
      grad.addColorStop(1, '#b8c3d1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    } else if (face === 'negy') {
      // Soft studio floor bounce
      const grad = ctx.createRadialGradient(
        size * 0.5,
        size * 0.5,
        size * 0.05,
        size * 0.5,
        size * 0.5,
        size * 0.75
      );
      grad.addColorStop(0, '#6a7482');
      grad.addColorStop(1, '#363d47');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
    } else {
      // Horizon studio gradient + softbox light bands for crisp metallic highlights
      const grad = ctx.createLinearGradient(0, 0, 0, size);
      grad.addColorStop(0, '#c8d2df');
      grad.addColorStop(0.28, '#f8fafc');
      grad.addColorStop(0.48, '#9aa5b4');
      grad.addColorStop(0.55, '#667180');
      grad.addColorStop(1, '#3c434e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      if (face === 'posx' || face === 'posz') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fillRect(size * 0.18, size * 0.12, size * 0.28, size * 0.26);
      }
    }

    return canvas.toDataURL('image/png');
  });

  return cachedStudioEnvUrls;
}

interface ThreeLikeMaterial {
  isMaterial?: boolean;
  metalness?: number;
  roughness?: number;
  roughnessMap?: unknown;
  metalnessMap?: unknown;
  envMapIntensity?: number;
  needsUpdate?: boolean;
}

interface ThreeLikeObject {
  isMesh?: boolean;
  material?: ThreeLikeMaterial | ThreeLikeMaterial[];
  traverse?: (cb: (obj: ThreeLikeObject) => void) => void;
}

function enhancePbrStudioMaterials(scene: ThreeLikeObject | undefined) {
  if (!scene?.traverse) return;

  scene.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];

    for (const mat of materials) {
      if (!mat || !mat.isMaterial) continue;

      if (typeof mat.envMapIntensity === 'number') {
        mat.envMapIntensity = 1.3;
      }

      // Preserve real colors & textures; only upgrade flat CAD exports (metalness=0, roughness=1)
      // that lack PBR texture maps so machined steel/aluminum reflects studio lighting.
      const hasPbrMaps = Boolean(mat.roughnessMap || mat.metalnessMap);
      if (!hasPbrMaps && mat.metalness === 0 && mat.roughness === 1) {
        mat.metalness = 0.62;
        mat.roughness = 0.28;
      } else if (!hasPbrMaps && typeof mat.roughness === 'number' && mat.roughness > 0.85) {
        mat.roughness = 0.36;
      }

      mat.needsUpdate = true;
    }
  });
}

export const CustomCadFileViewer: React.FC<CustomCadFileViewerProps> = ({ cadFile }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OV.EmbeddedViewer | null>(null);
  const [showEdges, setShowEdges] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const studioEnv = new OV.EnvironmentSettings(getStudioEnvironmentUrls(), false);

    const viewer = new OV.EmbeddedViewer(container, {
      backgroundColor: new OV.RGBAColor(0, 0, 0, 0),
      defaultColor: new OV.RGBColor(196, 203, 212),
      defaultLineColor: new OV.RGBColor(51, 65, 85),
      edgeSettings: new OV.EdgeSettings(false, new OV.RGBColor(30, 41, 59), 25),
      environmentSettings: studioEnv,
      onModelLoaded: () => {
        try {
          const ovViewer = viewer.GetViewer() as unknown as {
            renderer?: { toneMapping?: number; toneMappingExposure?: number };
            scene?: ThreeLikeObject;
            Render?: () => void;
          };
          if (ovViewer?.renderer) {
            ovViewer.renderer.toneMapping = 4; // ACESFilmicToneMapping
            ovViewer.renderer.toneMappingExposure = 1.1;
          }
          enhancePbrStudioMaterials(ovViewer?.scene);
          ovViewer?.Render?.();
        } catch {
          // Keep default render if internal viewer hooks are unavailable
        }
      },
    });

    viewerRef.current = viewer;

    try {
      if (cadFile.dataUrl.startsWith('data:')) {
        const file = dataUrlToFile(cadFile.dataUrl, cadFile.name);
        viewer.LoadModelFromFileList([file]);
      } else {
        viewer.LoadModelFromUrlList([cadFile.dataUrl]);
      }
    } catch {
      // Handled gracefully
    }

    const handleResize = () => viewer.Resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      viewerRef.current = null;
      viewer.Destroy();
    };
  }, [cadFile]);

  useEffect(() => {
    const embedded = viewerRef.current;
    if (!embedded) return;
    try {
      embedded
        .GetViewer()
        .SetEdgeSettings(new OV.EdgeSettings(showEdges, new OV.RGBColor(30, 41, 59), 25));
    } catch {
      // Ignore if viewer not yet initialized
    }
  }, [showEdges]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_50%_42%,#3a424d_0%,#1d232c_55%,#0b0e13_100%)]">
      {/* Subtle studio floor contact glow */}
      <div className="pointer-events-none absolute inset-x-10 bottom-4 h-10 rounded-full bg-black/45 blur-xl" />

      <div
        ref={containerRef}
        className="absolute inset-0 z-10 h-full w-full overflow-hidden [&_canvas]:!h-full [&_canvas]:!w-full [&_canvas]:block"
      />

      <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-lg border border-white/15 bg-black/75 px-3 py-1 font-mono-tech text-[11px] text-[#5bb5b9] backdrop-blur-sm">
        Archivo 3D: {cadFile.name}
      </div>

      <button
        type="button"
        onClick={() => setShowEdges((prev) => !prev)}
        className={`absolute right-3 bottom-3 z-20 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium backdrop-blur-sm transition ${
          showEdges
            ? 'border-[#5bb5b9] bg-[#5bb5b9]/20 text-[#5bb5b9]'
            : 'border-white/15 bg-black/70 text-slate-200 hover:border-[#5bb5b9]/60 hover:text-white'
        }`}
        title="Mostrar u ocultar aristas CAD"
      >
        <Layers className="h-3.5 w-3.5" />
        Aristas
      </button>
    </div>
  );
};
