import React from 'react';
import { Box, Check, Image as ImageIcon, Share2 } from 'lucide-react';
import type { CatalogProject } from '../../types';
import { TechnicalVisual } from '../gallery/TechnicalVisual';

interface ProjectCardProps {
  project: CatalogProject;
  isCopied: boolean;
  onOpen3D: (projectId: string) => void;
  onOpenPhoto: (projectId: string, photoIndex: number) => void;
  onCopyLink: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = React.memo(
  ({ project, isCopied, onOpen3D, onOpenPhoto, onCopyLink }) => {
    const coverPhoto = project.photos[0];

    return (
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e13]/90 transition duration-300 hover:-translate-y-1 hover:border-[#5bb5b9]/50 hover:shadow-[0_12px_40px_-12px_rgba(91,181,185,0.28)]">
        {/* Visual Preview Area */}
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-[#070a0f]">
          <TechnicalVisual
            modelType={project.modelType}
            photo={coverPhoto}
            projectCode={project.code}
            className="transition duration-500 group-hover:scale-[1.03]"
          />

          {/* Top Badges */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className="rounded-md border border-[#5bb5b9]/40 bg-black/75 px-2 py-0.5 font-mono-tech text-[11px] font-semibold text-[#5bb5b9] backdrop-blur-sm">
              {project.code}
            </span>
            {project.featured && (
              <span className="rounded-md bg-[#5bb5b9] px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-950 uppercase">
                Destacado
              </span>
            )}
          </div>

          {/* Quick Share Link Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCopyLink(project.id);
            }}
            title="Copiar link directo de este proyecto"
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/75 px-2.5 py-1 text-[11px] font-medium text-slate-200 backdrop-blur-sm transition hover:border-[#5bb5b9] hover:text-[#5bb5b9]"
          >
            {isCopied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="h-3 w-3" />
                <span>Link</span>
              </>
            )}
          </button>

          {/* Bottom Quick Action Overlay */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onOpen3D(project.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#5bb5b9] px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-lg transition hover:bg-[#4ea5a9]"
            >
              <Box className="h-3.5 w-3.5" />
              Inspeccionar 3D
            </button>
            <button
              type="button"
              onClick={() => onOpenPhoto(project.id, 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/80 px-3 py-1.5 text-xs font-medium text-slate-100 backdrop-blur-md transition hover:border-[#5bb5b9] hover:text-[#5bb5b9]"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Planimetría ({project.photos.length})
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <h3 className="font-display text-lg font-bold text-white transition group-hover:text-[#5bb5b9]">
              {project.title}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-400">{project.subtitle}</p>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">
              {project.quickSummary}
            </p>
          </div>

          <div className="mt-4 space-y-3 border-t border-white/10 pt-3.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="block text-[10px] tracking-wider text-slate-500 uppercase">
                  Material
                </span>
                <span className="font-mono-tech text-[11px] text-slate-200">
                  {project.specs.material.split('/')[0].trim()}
                </span>
              </div>
              <div>
                <span className="block text-[10px] tracking-wider text-slate-500 uppercase">
                  Tolerancia
                </span>
                <span className="font-mono-tech text-[11px] text-[#5bb5b9]">
                  {project.specs.tolerancia.split('|')[0].trim()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';
