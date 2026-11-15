import React, { useRef, useState } from 'react';
import { Move, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { CadModelType, GalleryPhoto } from '../../types';
import { TechnicalVisual } from './TechnicalVisual';

interface ZoomableTechnicalStageProps {
  modelType: CadModelType;
  photo: GalleryPhoto;
  projectCode: string;
  className?: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export const ZoomableTechnicalStage: React.FC<ZoomableTechnicalStageProps> = ({
  modelType,
  photo,
  projectCode,
  className = '',
}) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; origX: number; origY: number } | null>(null);

  const applyZoom = (nextScale: number) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(nextScale * 100) / 100));
    setScale(clamped);
    if (clamped === 1) {
      setOffset({ x: 0, y: 0 });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.35 : -0.35;
    applyZoom(scale + delta);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      origX: offset.x,
      origY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    setOffset({
      x: dragStartRef.current.origX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.origY + (e.clientY - dragStartRef.current.y),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer already released
    }
    setIsDragging(false);
    dragStartRef.current = null;
  };

  return (
    <div
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative h-full w-full overflow-hidden bg-[#070a0f] select-none ${
        scale > 1 ? (isDragging ? 'cursor-grabbing touch-none' : 'cursor-grab touch-none') : ''
      } ${className}`}
    >
      <div
        className="h-full w-full origin-center transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
        }}
      >
        <TechnicalVisual
          modelType={modelType}
          photo={photo}
          projectCode={projectCode}
          fit="contain"
        />
      </div>

      {/* CAD Zoom & Pan Controls */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute bottom-3 left-3 z-20 flex items-center gap-1 rounded-xl border border-white/15 bg-black/80 p-1 backdrop-blur-md"
      >
        <button
          type="button"
          onClick={() => applyZoom(scale - 0.5)}
          disabled={scale <= MIN_SCALE}
          aria-label="Alejar plano"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-200 transition hover:bg-white/10 hover:text-[#5bb5b9] disabled:opacity-35"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[44px] text-center font-mono-tech text-[11px] text-[#5bb5b9]">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={() => applyZoom(scale + 0.5)}
          disabled={scale >= MAX_SCALE}
          aria-label="Acercar plano"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-200 transition hover:bg-white/10 hover:text-[#5bb5b9] disabled:opacity-35"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        {scale > 1 && (
          <button
            type="button"
            onClick={() => applyZoom(1)}
            aria-label="Restablecer zoom"
            title="Restablecer zoom"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {scale > 1 && (
        <div className="pointer-events-none absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-lg border border-[#5bb5b9]/30 bg-black/75 px-2.5 py-1 font-mono-tech text-[10px] text-[#5bb5b9] backdrop-blur-sm">
          <Move className="h-3 w-3" />
          Arrastra para inspeccionar cotas
        </div>
      )}
    </div>
  );
};
