import React, { useState } from 'react';
import { Check, Copy, Mail, MessageCircle, Send } from 'lucide-react';
import { useCatalogStore } from '../../store/useCatalogStore';
import { buildGeneralQuoteMessage, buildWhatsAppUrl } from '../../utils/whatsapp';

export const ContactSection: React.FC = () => {
  const brandConfig = useCatalogStore((s) => s.brandConfig);
  const trainingTracks = useCatalogStore((s) => s.trainingTracks);
  const [name, setName] = useState('');
  const [service, setService] = useState('Diseño CAD & Modelado Mecánico');
  const [message, setMessage] = useState('');
  const [copiedBrief, setCopiedBrief] = useState(false);

  const handleCopyBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    const summary = `Hola ${brandConfig.brandName}, soy ${name || 'un cliente interesado'}.\nServicio de interés: ${service}\nDetalle: ${message || 'Quisiera cotizar un proyecto / capacitación.'}`;
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      // Fallback ignored
    }
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 3000);
  };

  const quoteMessage = buildGeneralQuoteMessage(brandConfig.brandName, {
    name,
    service,
    detail: message,
  });
  const whatsappUrl = buildWhatsAppUrl(brandConfig.whatsappNumber, quoteMessage);
  const directWhatsappUrl = buildWhatsAppUrl(
    brandConfig.whatsappNumber,
    buildGeneralQuoteMessage(brandConfig.brandName)
  );

  return (
    <section id="contacto" className="py-2 sm:py-4">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <img
            src="./cadco-logo.png"
            alt={brandConfig.brandName}
            className="h-14 w-auto rounded-lg border border-white/10 bg-black object-contain px-3 py-1.5"
          />
          <h2 className="mt-5 font-display text-3xl font-bold text-white">
            {brandConfig.contactTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            {brandConfig.contactSubtitle}
          </p>

          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex min-w-0 items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-[#5bb5b9]" />
              <span className="break-all">{brandConfig.contactEmail}</span>
            </div>
            {directWhatsappUrl && (
              <a
                href={directWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 whitespace-nowrap transition hover:bg-emerald-500/20"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                Escribir por WhatsApp Directo
              </a>
            )}
          </div>
        </div>

        <form
          onSubmit={handleCopyBrief}
          className="cadco-card p-6 sm:p-8 lg:col-span-7"
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
                className="cadco-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Servicio Requerido
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="cadco-input w-full px-3.5 py-2.5 text-sm"
              >
                <option>Diseño CAD & Modelado Mecánico</option>
                <option>Planimetría Técnica & GD&T</option>
                <option>Ensambles SolidWorks & Chapa Metálica</option>
                {trainingTracks.map((track) => (
                  <option
                    key={track.code}
                    value={`Capacitación ${track.code} — ${track.title}`}
                  >
                    Capacitación {track.code} — {track.title}
                  </option>
                ))}
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
              placeholder="Describe brevemente tu pieza, ensamble, tolerancias o nivel actual en SolidWorks..."
              className="cadco-input w-full px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="cadco-btn-primary min-h-[44px] px-4 py-2.5 text-sm whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                Enviar Cotización por WhatsApp
              </a>
            )}
            <button
              type="submit"
              className={
                whatsappUrl
                  ? 'cadco-btn-secondary min-h-[44px] px-4 py-2.5 text-sm whitespace-nowrap'
                  : 'cadco-btn-primary min-h-[44px] px-4 py-2.5 text-sm whitespace-nowrap'
              }
            >
              {copiedBrief ? (
                <>
                  <Check className="h-4 w-4 shrink-0" />
                  Resumen Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 shrink-0" />
                  Copiar Resumen
                </>
              )}
            </button>
            <a
              href={`mailto:${brandConfig.contactEmail}?subject=${encodeURIComponent(
                `Cotización ${brandConfig.brandName}: ${service}`
              )}&body=${encodeURIComponent(
                `Hola ${brandConfig.brandName},\n\nSoy ${name || 'un interesado'}.\nServicio: ${service}\n\nDetalle:\n${message}`
              )}`}
              className="cadco-btn-secondary min-h-[44px] px-4 py-2.5 text-sm whitespace-nowrap"
            >
              <Send className="h-4 w-4 shrink-0 text-[#5bb5b9]" />
              Enviar por Correo
            </a>
          </div>
        </form>
      </div>
    </section>
  );
};
