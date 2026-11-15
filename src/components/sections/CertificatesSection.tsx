import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Expand, ShieldCheck, X } from 'lucide-react';
import { DEFAULT_SECTION_COPY } from '../../data/catalogData';
import { useCatalogStore } from '../../store/useCatalogStore';
import type { DigitalCertificate } from '../../types';

export const CertificatesSection: React.FC = () => {
  const certificates = useCatalogStore((s) => s.certificates);
  const rawSectionCopy = useCatalogStore((s) => s.brandConfig.sectionCopy);
  const sectionCopy = { ...DEFAULT_SECTION_COPY, ...(rawSectionCopy ?? {}) };
  const [activeCert, setActiveCert] = useState<DigitalCertificate | null>(null);

  return (
    <section id="certificados" className="py-2 sm:py-4">
      <div>
        <div className="max-w-2xl">
          <div className="cadco-badge px-3.5 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{sectionCopy.certificatesBadge}</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {sectionCopy.certificatesTitlePrefix}{' '}
            <span className="text-[#5bb5b9]">{sectionCopy.certificatesTitleHighlight}</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            {sectionCopy.certificatesSubtitle}
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {certificates.map((cert, index) => (
            <motion.article
              key={cert.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="cadco-card group flex flex-col overflow-hidden"
            >
              {/* Certificate Visual */}
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#0e1520] via-[#080b10] to-[#050608]">
                {cert.imageDataUrl ? (
                  <>
                    <img
                      src={cert.imageDataUrl}
                      alt={cert.title}
                      loading="lazy"
                      className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.02]"
                    />
                    <button
                      type="button"
                      onClick={() => setActiveCert(cert)}
                      aria-label={`Ampliar certificado ${cert.code}`}
                      className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:border-[#5bb5b9] hover:text-[#5bb5b9]"
                    >
                      <Expand className="h-3.5 w-3.5" />
                      Ver Certificado
                    </button>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#5bb5b9]/40 bg-[#5bb5b9]/10 text-[#5bb5b9]">
                      <Award className="h-8 w-8" />
                    </div>
                    <span className="mt-4 font-mono-tech text-xs tracking-widest text-[#5bb5b9] uppercase">
                      {cert.issuer}
                    </span>
                    <h4 className="mt-1.5 font-display text-xl font-bold text-white">
                      {cert.title}
                    </h4>
                    <span className="mt-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-0.5 font-mono-tech text-[11px] text-emerald-300">
                      {cert.issueDate}
                    </span>
                  </div>
                )}

                <span className="absolute left-3 top-3 rounded-md bg-[#5bb5b9] px-2.5 py-0.5 font-mono-tech text-xs font-bold text-slate-950">
                  {cert.code}
                </span>
              </div>

              {/* Certificate Metadata */}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-white">
                      {cert.title}
                    </h3>
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#5bb5b9]" />
                  </div>
                  <p className="mt-1 text-xs font-medium text-[#5bb5b9]">{cert.issuer}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {cert.description}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3.5 text-xs">
                  <span className="font-mono-tech text-slate-400">
                    ID: <strong className="text-slate-200">{cert.credentialId}</strong>
                  </span>
                  <span className="font-mono-tech text-[#5bb5b9]">{cert.issueDate}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Certificate Lightbox */}
      {activeCert && activeCert.imageDataUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setActiveCert(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-[#5bb5b9]/40 bg-[#0b0e13] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveCert(null)}
              aria-label="Cerrar certificado"
              className="absolute right-4 top-4 rounded-lg border border-white/15 bg-black/80 p-2 text-white hover:border-[#5bb5b9]"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={activeCert.imageDataUrl}
              alt={activeCert.title}
              className="mx-auto max-h-[75vh] w-auto rounded-xl object-contain"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-slate-300">
              <span className="font-semibold text-white">{activeCert.title}</span>
              <span className="font-mono-tech text-[#5bb5b9]">
                Credencial: {activeCert.credentialId}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
