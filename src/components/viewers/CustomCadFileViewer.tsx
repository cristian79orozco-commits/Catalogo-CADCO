import React, { useEffect, useRef } from 'react';
import * as OV from 'online-3d-viewer';
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

export const CustomCadFileViewer: React.FC<CustomCadFileViewerProps> = ({ cadFile }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewer = new OV.EmbeddedViewer(container, {
      backgroundColor: new OV.RGBAColor(7, 10, 15, 255),
      defaultColor: new OV.RGBColor(91, 181, 185),
      defaultLineColor: new OV.RGBColor(226, 232, 240),
      edgeSettings: new OV.EdgeSettings(true, new OV.RGBColor(15, 23, 42), 1),
    });

    try {
      const file = dataUrlToFile(cadFile.dataUrl, cadFile.name);
      viewer.LoadModelFromFileList([file]);
    } catch {
      // Handled gracefully
    }

    const handleResize = () => viewer.Resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      viewer.Destroy();
    };
  }, [cadFile]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#070a0f]">
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-[#5bb5b9]/30 bg-black/75 px-3 py-1 font-mono-tech text-[11px] text-[#5bb5b9] backdrop-blur-sm">
        Archivo 3D: {cadFile.name}
      </div>
    </div>
  );
};
