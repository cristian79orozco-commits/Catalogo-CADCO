import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as OV from 'online-3d-viewer';
import { FileBox, Upload, X, Sparkles, RotateCcw } from 'lucide-react';

interface Online3DUniversalViewerProps {
  onClose: () => void;
}

function createSampleBracketStlFile(): File {
  const triangles: Array<[[number, number, number], [number, number, number], [number, number, number]]> = [];

  const addQuad = (
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    p4: [number, number, number]
  ) => {
    triangles.push([p1, p2, p3]);
    triangles.push([p1, p3, p4]);
  };

  const addBox = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
    // Front & Back
    addQuad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]);
    addQuad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]);
    // Top & Bottom
    addQuad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]);
    addQuad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]);
    // Left & Right
    addQuad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]);
    addQuad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]);
  };

  // L-Bracket with central rib (CADCO sample part in mm)
  addBox(-30, -25, -20, 30, -18, 20);
  addBox(-30, -18, -20, -22, 30, 20);
  addBox(-22, -18, -3, 18, 22, 3);

  let stl = 'solid CADCO_Sample_Bracket\n';
  for (const [a, b, c] of triangles) {
    stl += '  facet normal 0 0 0\n    outer loop\n';
    stl += `      vertex ${a[0]} ${a[1]} ${a[2]}\n`;
    stl += `      vertex ${b[0]} ${b[1]} ${b[2]}\n`;
    stl += `      vertex ${c[0]} ${c[1]} ${c[2]}\n`;
    stl += '    endloop\n  endfacet\n';
  }
  stl += 'endsolid CADCO_Sample_Bracket\n';

  return new File([stl], 'CADCO_Soporte_Muestra.stl', { type: 'model/stl' });
}

export const Online3DUniversalViewer: React.FC<Online3DUniversalViewerProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OV.EmbeddedViewer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewer = new OV.EmbeddedViewer(container, {
      backgroundColor: new OV.RGBAColor(7, 10, 15, 255),
      defaultColor: new OV.RGBColor(91, 181, 185),
      defaultLineColor: new OV.RGBColor(226, 232, 240),
      edgeSettings: new OV.EdgeSettings(true, new OV.RGBColor(15, 23, 42), 1),
      onModelLoaded: () => {
        // Model ready
      },
    });
    viewerRef.current = viewer;

    const handleResize = () => viewer.Resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      viewer.Destroy();
      viewerRef.current = null;
    };
  }, []);

  const loadFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0 || !viewerRef.current) return;
    setLoadedFileName(fileArray.map((f) => f.name).join(', '));
    viewerRef.current.LoadModelFromFileList(fileArray);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        loadFiles(e.dataTransfer.files);
      }
    },
    [loadFiles]
  );

  const handleLoadSample = useCallback(() => {
    const sample = createSampleBracketStlFile();
    loadFiles([sample]);
  }, [loadFiles]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6">
      <div className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#5bb5b9]/30 bg-[#0b0e13] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5bb5b9]/15 text-[#5bb5b9]">
              <FileBox className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white sm:text-lg">
                Visor CAD Universal · Online 3D Viewer (MIT)
              </h3>
              <p className="text-xs text-slate-400">
                Abre archivos reales <span className="font-mono-tech text-[#5bb5b9]">.STEP, .IGES, .STL, .OBJ, .3DS, .GLB</span> directo en el navegador
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#5bb5b9]/40 bg-[#5bb5b9]/10 px-3 py-1.5 text-xs font-medium text-[#5bb5b9] transition hover:bg-[#5bb5b9]/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Cargar STL de Prueba
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#5bb5b9] px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-[#4ea5a9]"
            >
              <Upload className="h-3.5 w-3.5" />
              Seleccionar Archivo CAD
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar visor universal"
              className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-white/30 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Viewer Body */}
        <div
          className="relative flex-1 overflow-hidden"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div ref={containerRef} className="h-full w-full" />

          {!loadedFileName && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div
                className={`pointer-events-auto max-w-md rounded-2xl border-2 border-dashed p-8 transition ${
                  isDragging
                    ? 'border-[#5bb5b9] bg-[#5bb5b9]/10'
                    : 'border-white/15 bg-[#0b0e13]/85 backdrop-blur-md'
                }`}
              >
                <Upload className="mx-auto mb-3 h-10 w-10 text-[#5bb5b9]" />
                <h4 className="font-display text-lg font-semibold text-white">
                  Arrastra tu archivo CAD aquí
                </h4>
                <p className="mt-1.5 text-sm text-slate-400">
                  Compatible con exportación directa desde <strong className="text-slate-200">SolidWorks</strong> (.STEP, .IGES, .STL, .OBJ, .GLB). Procesamiento 100% local en tu navegador.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-[#5bb5b9] px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[#4ea5a9]"
                  >
                    Explorar Archivos
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                  >
                    Probar con Pieza STL CADCO
                  </button>
                </div>
              </div>
            </div>
          )}

          {loadedFileName && (
            <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/75 px-3.5 py-2 text-xs text-slate-200 backdrop-blur-md">
              <span className="font-mono-tech text-[#5bb5b9]">ARCHIVO:</span>
              <span className="max-w-[240px] truncate font-medium">{loadedFileName}</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[11px] hover:bg-white/20"
              >
                <RotateCcw className="h-3 w-3" /> Cambiar
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".stp,.step,.igs,.iges,.stl,.obj,.3ds,.gltf,.glb,.off,.ply"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                loadFiles(e.target.files);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
