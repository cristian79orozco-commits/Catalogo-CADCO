import React, { useState } from 'react';
import { Check, Code2, Copy, ExternalLink, FileBox, Mail, Send, ShieldCheck } from 'lucide-react';
import { TECH_STACK_LICENSES } from '../../data/catalogData';

interface TechAndContactSectionProps {
  onOpenUniversalViewer: () => void;
}

export const TechAndContactSection: React.FC<TechAndContactSectionProps> = ({
  onOpenUniversalViewer,
}) => {
  const [name, setName] = useState('');
  const [service, setService] = useState('Diseño CAD & Modelado Mecánico');
  const [message, setMessage] = useState('');
  const [copiedBrief, setCopiedBrief] = useState(false);

  const handleCopyBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    const summary = `Hola CADCO, soy ${name || 'un cliente interesado'}.\nServicio de interés: ${service}\nDetalle: ${message || 'Quisiera cotizar un proyecto / capacitación.'}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedBrief(true);
      setTimeout(() => setCopiedBrief(false), 3000);
    } catch {
      setCopiedBrief(true);
    }
  };

  return (
    <>
      {/* Open-Source 3D Stack */}
      <section id="tecnologia" className="border-t border-white/10 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#5bb5b9]/30 bg-[#5bb5b9]/10 px-3 py-1 text-xs font-medium text-[#5bb5b9]">
                <Code2 className="h-3.5 w-3.5" />
                <span>Arquitectura WebGL Open-Source</span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                Motores 3D Profesionales Integrados
              </h2>
            </div>

            <button
              type="button"
              onClick={onOpenUniversalViewer}
              className="inline-flex items-center gap-2 rounded-xl border border-[#5bb5b9]/40 bg-[#5bb5b9]/10 px-4 py-2 text-xs font-semibold text-[#5bb5b9] transition hover:bg-[#5bb5b9] hover:text-slate-950"
            >
              <FileBox className="h-4 w-4" />
              Probar Online 3D Viewer (.STEP/.STL)
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECH_STACK_LICENSES.map((tech) => (
              <a
                key={tech.name}
                href={tech.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#0b0e13]/90 p-5 transition hover:border-[#5bb5b9]/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 font-mono-tech text-[10px] text-[#5bb5b9]">
                      <ShieldCheck className="h-3 w-3" />
                      {tech.license}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-[#5bb5b9]" />
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold text-white">
                    {tech.name}
                  </h3>
                  <p className="mt-1 font-mono-tech text-[11px] text-slate-400">
                    {tech.packageName}
                  </p>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">{tech.role}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Quote Section */}
      <section id="contacto" className="border-t border-white/10 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <img
              src="./cadco-logo.png"
              alt="CADCO Logo"
              className="h-14 w-auto rounded-lg border border-white/10 bg-black object-contain px-3 py-1.5"
            />
            <h2 className="mt-5 font-display text-3xl font-bold text-white">
              ¿Listo para iniciar tu proyecto o certificación?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              Envíame los detalles de tu pieza, ensamble o plan de estudios CSWA/CSWP. También puedes abrir cualquier archivo <span className="font-mono-tech text-[#5bb5b9]">.STEP / .IGES / .STL</span> en el visor universal para revisarlo juntos.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#5bb5b9]" />
                <span>cristian79orozco@gmail.com</span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleCopyBrief}
            className="rounded-2xl border border-white/10 bg-[#0b0e13]/90 p-6 sm:p-8 lg:col-span-7"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Nombre o Empresa
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Industrias Alfa / Estudiante"
                  className="w-full rounded-xl border border-white/15 bg-[#050608] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#5bb5b9]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Servicio Requerido
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#050608] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#5bb5b9]"
                >
                  <option>Diseño CAD & Modelado Mecánico</option>
                  <option>Planimetría Técnica & GD&T</option>
                  <option>Ensambles SolidWorks & Chapa Metálica</option>
                  <option>Capacitación Certificación CSWA</option>
                  <option>Capacitación Certificación CSWP</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Descripción del Requerimiento
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe brevemente tu proyecto, tolerancias, formato de entrega deseado o nivel actual en SolidWorks..."
                className="w-full rounded-xl border border-white/15 bg-[#050608] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#5bb5b9]"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5bb5b9] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#4ea5a9]"
              >
                {copiedBrief ? (
                  <>
                    <Check className="h-4 w-4" />
                    Solicitud Copiada al Portapapeles
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar Resumen para Enviar
                  </>
                )}
              </button>
              <a
                href={`mailto:cristian79orozco@gmail.com?subject=${encodeURIComponent(`Cotización CADCO: ${service}`)}&body=${encodeURIComponent(`Hola CADCO,\n\nSoy ${name || 'un interesado'}.\nServicio: ${service}\n\nDetalle:\n${message}`)}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:border-[#5bb5b9]/60"
              >
                <Send className="h-4 w-4 text-[#5bb5b9]" />
                Abrir en Correo
              </a>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};
