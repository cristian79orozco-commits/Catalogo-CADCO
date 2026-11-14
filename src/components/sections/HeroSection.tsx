import React from 'react';
import { Award, Box, ChevronDown, FileBox, GraduationCap, Layers } from 'lucide-react';
import { R3FCadViewer } from '../viewers/R3FCadViewer';

interface HeroSectionProps {
  onOpenUniversalViewer: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenUniversalViewer }) => {
  return (
    <section className="relative overflow-hidden border-b border-white/10 pt-24 pb-16 sm:pt-28 sm:pb-24">
      {/* Subtle radial teal glow */}
      <div className="pointer-events-none absolute -top-24 right-0 h-[480px] w-[480px] rounded-full bg-[#5bb5b9]/10 blur-[120px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        {/* Left Copy */}
        <div className="lg:col-span-6">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#5bb5b9]/35 bg-[#5bb5b9]/10 px-3.5 py-1.5 text-xs font-medium text-[#5bb5b9]">
            <Award className="h-3.5 w-3.5" />
            <span>Certificado Oficial SolidWorks CSWA & CSWP</span>
          </div>

          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Ingeniería CAD 3D,{' '}
            <span className="bg-gradient-to-r from-[#5bb5b9] to-teal-300 bg-clip-text text-transparent">
              Modelado Mecánico
            </span>{' '}
            y Planimetría de Precisión.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            En <strong className="text-white">CADCO</strong> transformamos ideas y requerimientos industriales en modelos 3D listos para manufactura CNC, corte láser y ensamble. Además, preparamos estudiantes para aprobar sus certificaciones <strong className="text-[#5bb5b9]">CSWA y CSWP</strong> sin complicaciones.
          </p>

          {/* Key Capabilities */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: Box, label: 'Modelado 3D SolidWorks' },
              { icon: Layers, label: 'Planimetría & GD&T' },
              { icon: GraduationCap, label: 'Tutorías CSWA / CSWP' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b0e13]/80 px-3 py-2.5 text-xs font-medium text-slate-200"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#5bb5b9]" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#catalogo"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5bb5b9] px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-[#5bb5b9]/20 transition hover:bg-[#4ea5a9]"
            >
              Explorar Catálogo 3D
              <ChevronDown className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={onOpenUniversalViewer}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-[#5bb5b9]/60 hover:bg-[#5bb5b9]/10"
            >
              <FileBox className="h-4 w-4 text-[#5bb5b9]" />
              Visor Universal (STEP / STL)
            </button>
          </div>
        </div>

        {/* Right Interactive 3D Hero Stage */}
        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-2xl border border-[#5bb5b9]/30 bg-[#070a0f] shadow-2xl shadow-[#5bb5b9]/10">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0b0e13]/90 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#5bb5b9]" />
                <span className="font-mono-tech text-xs font-medium text-slate-200">
                  LIVE 3D VIEWPORT · REDUCTOR PLANETARIO 4:1
                </span>
              </div>
              <span className="font-mono-tech text-[11px] text-slate-400">
                Arrastra para rotar · Zoom
              </span>
            </div>

            <div className="h-[340px] sm:h-[410px]">
              <R3FCadViewer
                modelType="planetary-gear"
                exploded={false}
                wireframe={false}
                autoRotate={true}
                compact={true}
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 bg-[#0b0e13]/90 px-4 py-2 text-[11px] font-mono-tech text-slate-400">
              <span>Three.js + React Three Fiber (MIT)</span>
              <span className="text-[#5bb5b9]">60 FPS WebGL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
