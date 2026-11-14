import React, { useEffect, useState } from 'react';
import {
  Box,
  Check,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Expand,
  FileCode2,
  Image as ImageIcon,
  Layers,
  Link2,
  MessageSquare,
  RotateCw,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import type { CatalogProject } from '../../types';
import { useCatalogStore } from '../../store/useCatalogStore';
import { R3FCadViewer } from '../viewers/R3FCadViewer';
import { BabylonCadViewer } from '../viewers/BabylonCadViewer';
import { TechnicalVisual } from '../gallery/TechnicalVisual';

interface ProjectInspectorModalProps {
  project: CatalogProject;
  onClose: () => void;
}

export const ProjectInspectorModal: React.FC<ProjectInspectorModalProps> = ({ project, onClose }) => {
  const viewerEngine = useCatalogStore((s) => s.viewerEngine);
  const setViewerEngine = useCatalogStore((s) => s.setViewerEngine);
  const isExploded = useCatalogStore((s) => s.isExploded);
  const toggleExploded = useCatalogStore((s) => s.toggleExploded);
  const isWireframe = useCatalogStore((s) => s.isWireframe);
  const toggleWireframe = useCatalogStore((s) => s.toggleWireframe);
  const autoRotate = useCatalogStore((s) => s.autoRotate);
  const toggleAutoRotate = useCatalogStore((s) => s.toggleAutoRotate);
  const activePhotoIndex = useCatalogStore((s) => s.activePhotoIndex);
  const setActivePhotoIndex = useCatalogStore((s) => s.setActivePhotoIndex);
  const setUniversalViewerOpen = useCatalogStore((s) => s.setUniversalViewerOpen);
  const copiedProjectId = useCatalogStore((s) => s.copiedProjectId);
  const markLinkCopied = useCatalogStore((s) => s.markLinkCopied);

  const [viewMode, setViewMode] = useState<'3d' | 'photos'>('3d');
  const [isFullscreenPhoto, setIsFullscreenPhoto] = useState(false);

  const currentPhoto = project.photos[activePhotoIndex] ?? project.photos[0];
  const isCopied = copiedProjectId === project.id;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreenPhoto) {
          setIsFullscreenPhoto(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && viewMode === 'photos') {
        setActivePhotoIndex((activePhotoIndex + 1) % project.photos.length);
      } else if (e.key === 'ArrowLeft' && viewMode === 'photos') {
        setActivePhotoIndex((activePhotoIndex - 1 + project.photos.length) % project.photos.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activePhotoIndex, isFullscreenPhoto, onClose, project.photos.length, setActivePhotoIndex, viewMode]);

  const handleCopyShareLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('proyecto', project.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      markLinkCopied(project.id);
    } catch {
      markLinkCopied(project.id);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 p-2 backdrop-blur-md sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#5bb5b9]/30 bg-[#0b0e13] shadow-2xl">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-[#5bb5b9]/40 bg-[#5bb5b9]/10 px-2.5 py-1 font-mono-tech text-xs font-semibold text-[#5bb5b9]">
              {project.code}
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-white sm:text-xl">
                {project.title}
              </h2>
              <p className="text-xs text-slate-400">{project.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-[#5bb5b9]/50 hover:text-white"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copiado</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-[#5bb5b9]" />
                  <span>Compartir Link</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar inspección"
              className="rounded-lg border border-white/10 p-1.5 text-slate-400 transition hover:border-white/30 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="grid flex-1 overflow-y-auto lg:grid-cols-12">
          {/* Left: Interactive 3D + Quick Photo Viewer */}
          <div className="flex flex-col border-b border-white/10 bg-[#070a0f] lg:col-span-7 lg:border-r lg:border-b-0">
            {/* Mode Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5">
              <div className="inline-flex rounded-lg border border-white/10 bg-[#0b0e13] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    viewMode === '3d'
                      ? 'bg-[#5bb5b9] text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="h-3.5 w-3.5" />
                  Modelo 3D Interactivo
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('photos')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    viewMode === 'photos'
                      ? 'bg-[#5bb5b9] text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Fotos & Planimetría ({project.photos.length})
                </button>
              </div>

              {viewMode === '3d' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewerEngine(viewerEngine === 'r3f' ? 'babylon' : 'r3f')}
                    title="Cambiar motor WebGL"
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono-tech text-slate-300 transition hover:border-[#5bb5b9]/50"
                  >
                    <Cpu className="h-3 w-3 text-[#5bb5b9]" />
                    {viewerEngine === 'r3f' ? 'Three.js / R3F' : 'Babylon.js'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUniversalViewerOpen(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#5bb5b9]/30 bg-[#5bb5b9]/10 px-2.5 py-1 text-[11px] font-medium text-[#5bb5b9] transition hover:bg-[#5bb5b9]/20"
                  >
                    <FileCode2 className="h-3 w-3" />
                    Abrir STEP/STL
                  </button>
                </div>
              )}
            </div>

            {/* Viewport */}
            <div className="relative h-[340px] sm:h-[430px] lg:flex-1">
              {viewMode === '3d' ? (
                <>
                  {viewerEngine === 'r3f' ? (
                    <R3FCadViewer
                      modelType={project.modelType}
                      exploded={isExploded}
                      wireframe={isWireframe}
                      autoRotate={autoRotate}
                    />
                  ) : (
                    <BabylonCadViewer
                      modelType={project.modelType}
                      wireframe={isWireframe}
                      autoRotate={autoRotate}
                    />
                  )}

                  {/* 3D Toolbar Overlay */}
                  <div className="absolute bottom-3 right-3 flex flex-wrap items-center gap-1.5">
                    {viewerEngine === 'r3f' && (
                      <button
                        type="button"
                        onClick={toggleExploded}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium backdrop-blur-md transition ${
                          isExploded
                            ? 'border-[#5bb5b9] bg-[#5bb5b9] text-slate-950'
                            : 'border-white/15 bg-black/70 text-slate-200 hover:border-[#5bb5b9]/50'
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5" />
                        Explosionar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={toggleWireframe}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium backdrop-blur-md transition ${
                        isWireframe
                          ? 'border-[#5bb5b9] bg-[#5bb5b9] text-slate-950'
                          : 'border-white/15 bg-black/70 text-slate-200 hover:border-[#5bb5b9]/50'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Malla
                    </button>
                    <button
                      type="button"
                      onClick={toggleAutoRotate}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium backdrop-blur-md transition ${
                        autoRotate
                          ? 'border-[#5bb5b9]/60 bg-[#5bb5b9]/20 text-[#5bb5b9]'
                          : 'border-white/15 bg-black/70 text-slate-200 hover:border-[#5bb5b9]/50'
                      }`}
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                      Rotar
                    </button>
                  </div>
                </>
              ) : (
                <div className="relative flex h-full w-full flex-col">
                  <div className="relative flex-1 overflow-hidden p-3">
                    <TechnicalVisual
                      modelType={project.modelType}
                      photo={currentPhoto}
                      projectCode={project.code}
                      className="rounded-xl border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setIsFullscreenPhoto(true)}
                      aria-label="Ampliar imagen"
                      className="absolute right-6 top-6 rounded-lg border border-white/15 bg-black/75 p-2 text-slate-200 backdrop-blur-md transition hover:border-[#5bb5b9] hover:text-[#5bb5b9]"
                    >
                      <Expand className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex(
                          (activePhotoIndex - 1 + project.photos.length) % project.photos.length
                        )
                      }
                      aria-label="Foto anterior"
                      className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/70 p-2 text-white backdrop-blur-md transition hover:border-[#5bb5b9]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex((activePhotoIndex + 1) % project.photos.length)
                      }
                      aria-label="Siguiente foto"
                      className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/70 p-2 text-white backdrop-blur-md transition hover:border-[#5bb5b9]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex items-center gap-2 border-t border-white/10 bg-[#0b0e13] px-4 py-2.5">
                    {project.photos.map((photo, idx) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`flex-1 rounded-lg border px-2.5 py-2 text-left transition ${
                          idx === activePhotoIndex
                            ? 'border-[#5bb5b9] bg-[#5bb5b9]/10'
                            : 'border-white/10 bg-white/5 hover:border-white/25'
                        }`}
                      >
                        <div className="font-mono-tech text-[10px] text-[#5bb5b9]">
                          {photo.drawingCode}
                        </div>
                        <div className="truncate text-xs font-medium text-slate-200">
                          {photo.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Technical Description & Specs */}
          <div className="flex flex-col justify-between p-5 lg:col-span-5">
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-semibold tracking-wider text-[#5bb5b9] uppercase">
                  Descripción Rápida
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                  {project.description}
                </p>
              </div>

              {/* Technical Spec Grid */}
              <div>
                <h4 className="mb-2.5 text-xs font-semibold tracking-wider text-[#5bb5b9] uppercase">
                  Ficha Técnica de Ingeniería
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    ['Material', project.specs.material],
                    ['Tolerancia', project.specs.tolerancia],
                    ['Software CAD', project.specs.software],
                    ['Normativa', project.specs.norma],
                    ['Manufactura', project.specs.proceso],
                    ['Entrega Est.', project.specs.tiempoEntrega],
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                        {label}
                      </div>
                      <div className="mt-0.5 font-mono-tech text-xs font-medium text-slate-100">
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SolidWorks Modules */}
              <div>
                <h4 className="mb-2 text-xs font-semibold tracking-wider text-[#5bb5b9] uppercase">
                  Módulos SolidWorks Aplicados
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {project.solidworksModules.map((mod) => (
                    <span
                      key={mod}
                      className="rounded-md border border-[#5bb5b9]/30 bg-[#5bb5b9]/10 px-2.5 py-1 font-mono-tech text-[11px] text-[#5bb5b9]"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-6 flex flex-wrap gap-2.5 border-t border-white/10 pt-4">
              <a
                href="#contacto"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5bb5b9] px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#4ea5a9]"
              >
                <MessageSquare className="h-4 w-4" />
                Cotizar Proyecto Similar
              </a>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-[#5bb5b9]/50"
              >
                <Link2 className="h-4 w-4 text-[#5bb5b9]" />
                {isCopied ? '¡Copiado!' : 'Copiar URL'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox for Blueprint/Render */}
      {isFullscreenPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsFullscreenPhoto(false)}
        >
          <div
            className="relative h-[85vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <TechnicalVisual
              modelType={project.modelType}
              photo={currentPhoto}
              projectCode={project.code}
              className="rounded-2xl border border-[#5bb5b9]/40"
            />
            <button
              type="button"
              onClick={() => setIsFullscreenPhoto(false)}
              className="absolute right-4 top-4 rounded-xl border border-white/20 bg-black/80 p-2 text-white hover:border-[#5bb5b9]"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
              <span>
                <strong className="text-white">{currentPhoto.title}</strong> — {currentPhoto.caption}
              </span>
              <span className="font-mono-tech text-[#5bb5b9]">{currentPhoto.drawingCode}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
