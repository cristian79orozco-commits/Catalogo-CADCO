import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useCatalogStore } from '../../store/useCatalogStore';
import { buildGeneralQuoteMessage, buildWhatsAppUrl } from '../../utils/whatsapp';

export const WhatsAppFloatingButton: React.FC = () => {
  const brandName = useCatalogStore((s) => s.brandConfig.brandName);
  const whatsappNumber = useCatalogStore((s) => s.brandConfig.whatsappNumber);

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    buildGeneralQuoteMessage(brandName)
  );

  if (!whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Cotizar o escribir por WhatsApp"
      className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2.5 rounded-full border border-[#5bb5b9]/45 bg-[#0b0e13]/95 px-4 py-3 text-xs font-semibold text-slate-100 shadow-[0_10px_32px_-8px_rgba(0,0,0,0.85)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-[#5bb5b9] hover:text-[#5bb5b9] hover:shadow-[0_12px_36px_-8px_rgba(91,181,185,0.45)] sm:right-6 sm:bottom-6 sm:px-4.5 sm:py-3 sm:text-sm"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
        <MessageCircle className="h-4 w-4" />
      </span>
      <span className="hidden sm:inline">Cotizar por WhatsApp</span>
      <span className="sm:hidden">WhatsApp</span>
    </a>
  );
};
