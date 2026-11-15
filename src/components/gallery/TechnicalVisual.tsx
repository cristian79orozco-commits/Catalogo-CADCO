import React from 'react';
import type { CadModelType, GalleryPhoto } from '../../types';

interface TechnicalVisualProps {
  modelType: CadModelType;
  photo?: GalleryPhoto;
  projectCode: string;
  className?: string;
  fit?: 'cover' | 'contain';
}

export const TechnicalVisual: React.FC<TechnicalVisualProps> = ({
  modelType,
  photo: rawPhoto,
  projectCode,
  className = '',
  fit = 'cover',
}) => {
  const photo: GalleryPhoto = rawPhoto ?? {
    id: `fallback-${projectCode}`,
    title: projectCode,
    caption: 'Vista técnica CAD',
    kind: 'render',
    drawingCode: `${projectCode}-01`,
    scale: '1:1',
  };

  if (photo.imageDataUrl) {
    return (
      <div
        onContextMenu={(e) => e.preventDefault()}
        className={`relative h-full w-full overflow-hidden bg-[#070a0f] select-none ${className}`}
      >
        <img
          src={photo.imageDataUrl}
          alt={photo.title}
          loading="lazy"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
        />
        <div className="pointer-events-none absolute right-3 bottom-3 rounded-md border border-[#5bb5b9]/40 bg-black/80 px-2.5 py-1 font-mono-tech text-[10px] text-[#5bb5b9] backdrop-blur-sm">
          {projectCode} · {photo.drawingCode}
        </div>
      </div>
    );
  }

  const isBlueprint = photo.kind === 'blueprint';
  const isDetail = photo.kind === 'detail';

  const bgClass = isBlueprint
    ? 'bg-[#071929]'
    : isDetail
      ? 'bg-gradient-to-br from-[#0e141b] via-[#090d12] to-[#050608]'
      : 'bg-gradient-to-br from-[#101822] via-[#0a0f16] to-[#06080c]';

  const strokePrimary = isBlueprint ? '#7dd3fc' : '#5bb5b9';
  const strokeSecondary = isBlueprint ? '#38bdf8' : '#94a3b8';

  return (
    <div className={`relative h-full w-full overflow-hidden select-none ${bgClass} ${className}`}>
      <svg
        viewBox="0 0 640 400"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${photo.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={isBlueprint ? 'rgba(125,211,252,0.12)' : 'rgba(91,181,185,0.08)'}
              strokeWidth="0.7"
            />
          </pattern>
          <pattern id={`hatch-${photo.id}`} width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke={strokePrimary} strokeWidth="1" strokeOpacity="0.45" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width="640" height="400" fill={`url(#grid-${photo.id})`} />

        {/* Outer Technical Frame */}
        <rect
          x="14"
          y="14"
          width="612"
          height="372"
          fill="none"
          stroke={strokePrimary}
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />

        {/* Centerlines */}
        <line x1="320" y1="30" x2="320" y2="335" stroke={strokePrimary} strokeOpacity="0.25" strokeDasharray="10 4 2 4" />
        <line x1="40" y1="190" x2="600" y2="190" stroke={strokePrimary} strokeOpacity="0.25" strokeDasharray="10 4 2 4" />

        {/* Model-specific Engineering Geometry */}
        {modelType === 'planetary-gear' && (
          <g transform="translate(320, 185)">
            <circle r="118" fill={isDetail ? `url(#hatch-${photo.id})` : 'none'} stroke={strokeSecondary} strokeWidth="2.2" />
            <circle r="98" fill="none" stroke={strokePrimary} strokeWidth="1.5" strokeDasharray="6 3" />
            <circle r="38" fill={isBlueprint ? 'none' : 'rgba(91,181,185,0.15)'} stroke={strokePrimary} strokeWidth="2.5" />
            <circle r="14" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
            {[0, 120, 240].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const cx = Math.cos(rad) * 68;
              const cy = Math.sin(rad) * 68;
              return (
                <g key={deg} transform={`translate(${cx}, ${cy})`}>
                  <circle r="28" fill={isBlueprint ? 'none' : 'rgba(148,163,184,0.14)'} stroke={strokeSecondary} strokeWidth="2" />
                  <circle r="10" fill="none" stroke={strokePrimary} strokeWidth="1.5" />
                </g>
              );
            })}
            {/* Dimension Callouts */}
            <line x1="-118" y1="-132" x2="118" y2="-132" stroke={strokePrimary} strokeWidth="1" />
            <text x="0" y="-138" textAnchor="middle" fill={strokePrimary} fontSize="11" fontFamily="JetBrains Mono, monospace">
              Ø96.00 H7 · MÓDULO 2.0 · Z=48
            </text>
          </g>
        )}

        {modelType === 'hydraulic-flange' && (
          <g transform="translate(320, 185)">
            <circle r="115" fill={isDetail ? `url(#hatch-${photo.id})` : 'rgba(148,163,184,0.08)'} stroke={strokeSecondary} strokeWidth="2.4" />
            <circle r="86" fill="none" stroke={strokePrimary} strokeWidth="1.2" strokeDasharray="8 4" />
            <circle r="54" fill="none" stroke={strokePrimary} strokeWidth="2.2" />
            <circle r="36" fill="none" stroke="#e2e8f0" strokeWidth="1.8" />
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <circle
                  key={deg}
                  cx={Math.cos(rad) * 86}
                  cy={Math.sin(rad) * 86}
                  r="10"
                  fill="#050608"
                  stroke={strokePrimary}
                  strokeWidth="1.8"
                />
              );
            })}
            <text x="0" y="-132" textAnchor="middle" fill={strokePrimary} fontSize="11" fontFamily="JetBrains Mono, monospace">
              6x Ø11.00 THRU · POSICIÓN ⌖ Ø0.05 A B
            </text>
          </g>
        )}

        {modelType === 'robot-gripper' && (
          <g transform="translate(320, 190)">
            <rect x="-95" y="15" width="190" height="72" rx="6" fill={isDetail ? `url(#hatch-${photo.id})` : 'rgba(30,41,59,0.5)'} stroke={strokeSecondary} strokeWidth="2.2" />
            <rect x="-110" y="-5" width="220" height="20" rx="3" fill="rgba(91,181,185,0.2)" stroke={strokePrimary} strokeWidth="1.8" />
            <path d="M -75 -5 L -75 -85 L -50 -115 L -35 -115 L -35 -5 Z" fill="rgba(203,213,225,0.12)" stroke={strokePrimary} strokeWidth="2" />
            <path d="M 75 -5 L 75 -85 L 50 -115 L 35 -115 L 35 -5 Z" fill="rgba(203,213,225,0.12)" stroke={strokePrimary} strokeWidth="2" />
            <line x1="-35" y1="-98" x2="35" y2="-98" stroke={strokePrimary} strokeWidth="1.2" />
            <text x="0" y="-106" textAnchor="middle" fill={strokePrimary} fontSize="11" fontFamily="JetBrains Mono, monospace">
              CARRERA 65.0 mm · ISO 9409-1
            </text>
          </g>
        )}

        {modelType === 'sheet-metal-bracket' && (
          <g transform="translate(320, 185)">
            <path
              d="M -140 -95 L -20 -95 L -20 45 L 130 45 L 130 95 L -140 95 Z"
              fill={isDetail ? `url(#hatch-${photo.id})` : 'rgba(91,181,185,0.1)'}
              stroke={strokePrimary}
              strokeWidth="2.4"
            />
            <line x1="-140" y1="45" x2="-20" y2="45" stroke={strokeSecondary} strokeDasharray="5 4" strokeWidth="1.4" />
            <circle cx="55" cy="70" r="10" fill="none" stroke="#e2e8f0" strokeWidth="1.8" />
            <rect x="-105" y="-60" width="50" height="16" rx="8" fill="none" stroke={strokePrimary} strokeWidth="1.8" />
            <text x="15" y="-65" textAnchor="middle" fill={strokePrimary} fontSize="11" fontFamily="JetBrains Mono, monospace">
              ESPESOR 2.66 mm · FACTOR K=0.42 · R3.0
            </text>
          </g>
        )}

        {modelType === 'piston-assembly' && (
          <g transform="translate(320, 185)">
            <rect x="-56" y="-110" width="112" height="72" rx="4" fill={isDetail ? `url(#hatch-${photo.id})` : 'rgba(203,213,225,0.14)'} stroke={strokeSecondary} strokeWidth="2.2" />
            <line x1="-56" y1="-92" x2="56" y2="-92" stroke={strokePrimary} strokeWidth="2" />
            <line x1="-56" y1="-80" x2="56" y2="-80" stroke={strokePrimary} strokeWidth="2" />
            <rect x="-14" y="-38" width="28" height="118" fill="rgba(91,181,185,0.16)" stroke={strokePrimary} strokeWidth="2" />
            <circle cx="0" cy="95" r="32" fill="none" stroke={strokeSecondary} strokeWidth="2.4" />
            <circle cx="0" cy="95" r="16" fill="none" stroke={strokePrimary} strokeWidth="1.8" />
            <text x="0" y="-124" textAnchor="middle" fill={strokePrimary} fontSize="11" fontFamily="JetBrains Mono, monospace">
              ENTRE CENTROS 142.00 ±0.015 · Ø76.20 H7
            </text>
          </g>
        )}

        {modelType === 'industrial-valve' && (
          <g transform="translate(320, 195)">
            <rect x="-130" y="-42" width="260" height="84" fill={isDetail ? `url(#hatch-${photo.id})` : 'rgba(30,41,59,0.5)'} stroke={strokeSecondary} strokeWidth="2.2" />
            <rect x="-145" y="-68" width="18" height="136" fill="rgba(148,163,184,0.2)" stroke={strokePrimary} strokeWidth="2" />
            <rect x="127" y="-68" width="18" height="136" fill="rgba(148,163,184,0.2)" stroke={strokePrimary} strokeWidth="2" />
            <rect x="-42" y="-92" width="84" height="50" fill="none" stroke={strokePrimary} strokeWidth="2" />
            <line x1="0" y1="-92" x2="0" y2="-138" stroke="#e2e8f0" strokeWidth="4" />
            <line x1="-68" y1="-138" x2="68" y2="-138" stroke={strokePrimary} strokeWidth="5" strokeLinecap="round" />
            <text x="0" y="96" textAnchor="middle" fill={strokePrimary} fontSize="11" fontFamily="JetBrains Mono, monospace">
              DN80 PN16 · L = 180.0 mm · ROSCA Tr 20x4
            </text>
          </g>
        )}

        {/* CADCO Title Block (Cajetín Técnico) */}
        <g transform="translate(376, 326)">
          <rect width="242" height="52" fill="rgba(5, 6, 8, 0.9)" stroke={strokePrimary} strokeWidth="1" />
          <line x1="0" y1="22" x2="242" y2="22" stroke={strokePrimary} strokeOpacity="0.5" />
          <line x1="150" y1="22" x2="150" y2="52" stroke={strokePrimary} strokeOpacity="0.5" />
          <text x="10" y="15" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="Space Grotesk, sans-serif">
            CADCO ENGINEERING · {projectCode}
          </text>
          <text x="10" y="40" fill={strokePrimary} fontSize="9.5" fontFamily="JetBrains Mono, monospace">
            {photo.drawingCode}
          </text>
          <text x="160" y="40" fill="#cbd5e1" fontSize="9.5" fontFamily="JetBrains Mono, monospace">
            ESC {photo.scale}
          </text>
        </g>
      </svg>
    </div>
  );
};
