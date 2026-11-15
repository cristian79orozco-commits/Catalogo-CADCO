/**
 * Utilidades centralizadas para normalización de números WhatsApp (E.164 sin '+')
 * y generación de enlaces automáticos de cotización para clientes nacionales e internacionales.
 */

const DEFAULT_COUNTRY_CODE = '57';

/**
 * Normaliza un número de teléfono al formato requerido por `https://wa.me/<digits>`.
 *
 * Reglas:
 * - Elimina espacios, guiones, paréntesis y símbolos.
 * - Si empieza por `00`, los remueve (prefijo internacional clásico).
 * - Si es un celular colombiano de 10 dígitos (empieza por `3`), antepone `57`
 *   automáticamente para que funcione tanto en Colombia como en el exterior.
 * - Si ya incluye código de país (ej. `573001234567` o `+1...`, `+34...`), lo respeta.
 * - Retorna `''` si no alcanza un mínimo razonable de 7 dígitos.
 */
export function normalizeWhatsAppNumber(
  raw: string | null | undefined,
  defaultCountryCode: string = DEFAULT_COUNTRY_CODE
): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const hasExplicitPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.length < 7) {
    return '';
  }

  // Celular colombiano estándar de 10 dígitos (ej. 3001234567)
  if (digits.length === 10 && digits.startsWith('3')) {
    return `${defaultCountryCode}${digits}`;
  }

  // Fijo colombiano con indicativo nacional de 10 dígitos (601..., 604..., etc.)
  if (!hasExplicitPlus && digits.length === 10 && digits.startsWith('60')) {
    return `${defaultCountryCode}${digits}`;
  }

  // Máximo E.164 es 15 dígitos
  if (digits.length > 15) {
    return digits.slice(0, 15);
  }

  return digits;
}

/**
 * Formatea un número normalizado para mostrarlo de forma legible en UI (ej. `+57 300 123 4567`).
 */
export function formatWhatsAppDisplay(raw: string | null | undefined): string {
  const digits = normalizeWhatsAppNumber(raw);
  if (!digits) return '';

  if (digits.startsWith('57') && digits.length === 12) {
    return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  return `+${digits}`;
}

/**
 * Construye una URL segura de `wa.me` lista para abrir en cualquier dispositivo.
 * Retorna `null` si el administrador aún no ha configurado un número válido.
 */
export function buildWhatsAppUrl(
  rawNumber: string | null | undefined,
  message?: string
): string | null {
  const digits = normalizeWhatsAppNumber(rawNumber);
  if (!digits) return null;

  const cleanMessage = message?.trim();
  if (!cleanMessage) {
    return `https://wa.me/${digits}`;
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(cleanMessage)}`;
}

export function buildGeneralQuoteMessage(
  brandName: string,
  params?: { name?: string; service?: string; detail?: string }
): string {
  const sender = params?.name?.trim() || 'un cliente interesado';
  const lines = [`Hola ${brandName}, soy ${sender}.`];

  if (params?.service?.trim()) {
    lines.push(`Servicio de interés: ${params.service.trim()}`);
  }

  if (params?.detail?.trim()) {
    lines.push(`Detalle: ${params.detail.trim()}`);
  } else {
    lines.push('Quisiera solicitar información / cotización de un trabajo.');
  }

  return lines.join('\n');
}

export function buildProjectQuoteMessage(
  brandName: string,
  project: { code: string; title: string; category: string },
  projectUrl?: string
): string {
  const lines = [
    `Hola ${brandName}, me interesa cotizar un trabajo similar al proyecto:`,
    `• Código: ${project.code}`,
    `• Proyecto: ${project.title}`,
    `• Especialidad: ${project.category}`,
  ];

  if (projectUrl) {
    lines.push(`• Referencia: ${projectUrl}`);
  }

  return lines.join('\n');
}

export function buildTrainingQuoteMessage(
  brandName: string,
  track: { code: string; title: string }
): string {
  return [
    `Hola ${brandName}, quiero solicitar información e inscripción para la capacitación:`,
    `• Programa: ${track.code} — ${track.title}`,
  ].join('\n');
}
