import React from 'react';
import { Award, CheckCircle2, Clock, FileCheck2, GraduationCap, MessageCircle } from 'lucide-react';
import { DEFAULT_SECTION_COPY } from '../../data/catalogData';
import { useCatalogStore } from '../../store/useCatalogStore';
import { buildTrainingQuoteMessage, buildWhatsAppUrl } from '../../utils/whatsapp';

export const TrainingSection: React.FC = () => {
  const trainingTracks = useCatalogStore((s) => s.trainingTracks);
  const brandName = useCatalogStore((s) => s.brandConfig.brandName);
  const whatsappNumber = useCatalogStore((s) => s.brandConfig.whatsappNumber);
  const rawSectionCopy = useCatalogStore((s) => s.brandConfig.sectionCopy);
  const sectionCopy = { ...DEFAULT_SECTION_COPY, ...(rawSectionCopy ?? {}) };

  return (
    <section id="capacitacion" className="py-2 sm:py-4">
      <div>
        <div className="max-w-2xl">
          <div className="cadco-badge px-3 py-1 text-xs font-medium">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{sectionCopy.trainingBadge}</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {sectionCopy.trainingTitlePrefix}{' '}
            <span className="text-[#5bb5b9]">{sectionCopy.trainingTitleHighlight}</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            {sectionCopy.trainingSubtitle}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {trainingTracks.map((track) => (
            <div
              key={track.code}
              className="cadco-card flex flex-col justify-between p-6 sm:p-8"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-[#5bb5b9] px-3 py-1 font-mono-tech text-sm font-bold text-slate-950">
                      <Award className="h-4 w-4" />
                      {track.code}
                    </span>
                    {track.level && (
                      <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono-tech text-[11px] text-slate-300">
                        {track.level}
                      </span>
                    )}
                  </div>
                  {track.duration && (
                    <span className="inline-flex items-center gap-1.5 font-mono-tech text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-[#5bb5b9]" />
                      {track.duration}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-2xl font-bold text-white">
                  {track.title}
                </h3>
                {track.subtitle && (
                  <p className="mt-1 text-sm font-medium text-[#5bb5b9]">{track.subtitle}</p>
                )}
                {track.description && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {track.description}
                  </p>
                )}

                {track.examFormat && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 font-mono-tech text-xs text-slate-300">
                    {track.examFormat}
                  </div>
                )}

                {track.topics.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                      Temario Clave
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {track.topics.map((topic, tIdx) => (
                        <li
                          key={`${track.code}-topic-${tIdx}`}
                          className="flex items-start gap-2.5 text-sm text-slate-300"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#5bb5b9]" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {track.deliverables.length > 0 && (
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <h4 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                      Incluye
                    </h4>
                    <ul className="mt-2.5 space-y-1.5">
                      {track.deliverables.map((item, dIdx) => (
                        <li
                          key={`${track.code}-deliv-${dIdx}`}
                          className="flex items-center gap-2 text-xs text-slate-200"
                        >
                          <FileCheck2 className="h-3.5 w-3.5 shrink-0 text-[#5bb5b9]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                {(() => {
                  const trackWhatsappUrl = buildWhatsAppUrl(
                    whatsappNumber,
                    buildTrainingQuoteMessage(brandName, track)
                  );
                  return trackWhatsappUrl ? (
                    <a
                      href={trackWhatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#5bb5b9] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#4ea5a9]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Consultar Cupo por WhatsApp
                    </a>
                  ) : null;
                })()}
                <a
                  href="#contacto"
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#5bb5b9]/50 bg-[#5bb5b9]/10 px-4 py-3 text-sm font-semibold text-[#5bb5b9] transition hover:bg-[#5bb5b9] hover:text-slate-950"
                >
                  Solicitar Temario {track.code}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
