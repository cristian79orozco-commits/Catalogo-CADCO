import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Plus,
  Trash2,
} from 'lucide-react';
import type { CertificationTrack } from '../../types';

interface TrainingTracksEditorProps {
  tracks: CertificationTrack[];
  onChange: (nextTracks: CertificationTrack[]) => void;
}

function generateUniqueTrackCode(existing: CertificationTrack[]): string {
  const used = new Set(existing.map((t) => t.code.trim().toUpperCase()));
  let index = existing.length + 1;
  while (used.has(`CAP-${String(index).padStart(2, '0')}`)) {
    index += 1;
  }
  return `CAP-${String(index).padStart(2, '0')}`;
}

export const TrainingTracksEditor: React.FC<TrainingTracksEditorProps> = ({
  tracks,
  onChange,
}) => {
  const updateTrack = (idx: number, patch: Partial<CertificationTrack>) => {
    const next = [...tracks];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const handleAddTrack = () => {
    const newTrack: CertificationTrack = {
      code: generateUniqueTrackCode(tracks),
      title: 'Nuevo Programa de Capacitación',
      subtitle: 'Formación técnica especializada en diseño CAD 3D',
      level: 'Nivel Intermedio / Profesional',
      duration: '16 horas prácticas (4 semanas)',
      examFormat: 'Sesiones en vivo + Proyectos prácticos evaluados',
      description:
        'Describe el objetivo del programa, el perfil de estudiante y los resultados técnicos esperados.',
      topics: ['Fundamentos y metodología paramétrica aplicada'],
      deliverables: ['Material de práctica y revisión personalizada'],
    };
    onChange([...tracks, newTrack]);
  };

  const handleDeleteTrack = (idx: number) => {
    onChange(tracks.filter((_, i) => i !== idx));
  };

  const handleMoveTrack = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= tracks.length) return;
    const next = [...tracks];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    onChange(next);
  };

  const updateListItem = (
    trackIdx: number,
    field: 'topics' | 'deliverables',
    itemIdx: number,
    value: string
  ) => {
    const list = [...tracks[trackIdx][field]];
    list[itemIdx] = value;
    updateTrack(trackIdx, { [field]: list });
  };

  const addListItem = (trackIdx: number, field: 'topics' | 'deliverables') => {
    const list = [...tracks[trackIdx][field], ''];
    updateTrack(trackIdx, { [field]: list });
  };

  const removeListItem = (
    trackIdx: number,
    field: 'topics' | 'deliverables',
    itemIdx: number
  ) => {
    const list = tracks[trackIdx][field].filter((_, i) => i !== itemIdx);
    updateTrack(trackIdx, { [field]: list });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-display text-sm font-bold text-white sm:text-base">
              Programas de Capacitación
            </h4>
            <span className="rounded-md border border-[#5bb5b9]/30 bg-[#5bb5b9]/10 px-2 py-0.5 font-mono-tech text-[11px] font-semibold text-[#5bb5b9]">
              {tracks.length} {tracks.length === 1 ? 'programa' : 'programas'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Agrega nuevas capacitaciones y personaliza todos sus campos: código, nivel, duración,
            formato, descripción, temario y entregables.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddTrack}
          className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5bb5b9] px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[#4ea5a9]"
        >
          <Plus className="h-4 w-4" />
          Agregar Capacitación
        </button>
      </div>

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#070a0f]/80 px-4 py-8 text-center">
          <GraduationCap className="h-7 w-7 text-[#5bb5b9]/80" />
          <p className="mt-2 text-sm font-medium text-slate-200">
            No hay programas de capacitación registrados
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Crea el primer programa para mostrarlo en la sección de capacitación del catálogo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {tracks.map((track, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#070a0f] p-4 transition hover:border-[#5bb5b9]/35"
            >
              {/* Cabecera de la tarjeta */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-[#5bb5b9]/15 px-2.5 py-1 font-mono-tech text-xs font-bold text-[#5bb5b9]">
                    {track.code.trim() || `CAP-${idx + 1}`}
                  </span>
                  <span className="font-mono-tech text-[11px] text-slate-500">
                    #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveTrack(idx, -1)}
                    title="Mover arriba"
                    aria-label="Mover programa arriba"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-[#5bb5b9]/50 hover:text-[#5bb5b9] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === tracks.length - 1}
                    onClick={() => handleMoveTrack(idx, 1)}
                    title="Mover abajo"
                    aria-label="Mover programa abajo"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-[#5bb5b9]/50 hover:text-[#5bb5b9] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTrack(idx)}
                    title="Eliminar capacitación"
                    aria-label={`Eliminar capacitación ${track.code || idx + 1}`}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 text-[11px] font-medium text-rose-300 transition hover:bg-rose-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              </div>

              {/* Código y Nivel */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">
                    Código / Sigla *
                  </label>
                  <input
                    value={track.code}
                    onChange={(e) =>
                      updateTrack(idx, { code: e.target.value.toUpperCase() })
                    }
                    placeholder="Ej. CSWA, CSWP, CSWE"
                    className="cadco-input w-full px-3 py-2 font-mono-tech text-xs font-semibold uppercase"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">
                    Nivel
                  </label>
                  <input
                    value={track.level}
                    onChange={(e) => updateTrack(idx, { level: e.target.value })}
                    placeholder="Ej. Nivel Profesional / Industria"
                    className="cadco-input w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Título y Subtítulo */}
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">
                    Título del Programa *
                  </label>
                  <input
                    value={track.title}
                    onChange={(e) => updateTrack(idx, { title: e.target.value })}
                    placeholder="Ej. Certified SolidWorks Associate"
                    className="cadco-input w-full px-3 py-2 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">
                    Subtítulo / Enfoque
                  </label>
                  <input
                    value={track.subtitle}
                    onChange={(e) => updateTrack(idx, { subtitle: e.target.value })}
                    placeholder="Ej. Preparación Intensiva desde Cero hasta Aprobación"
                    className="cadco-input w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Duración y Formato */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">
                    Duración
                  </label>
                  <input
                    value={track.duration}
                    onChange={(e) => updateTrack(idx, { duration: e.target.value })}
                    placeholder="Ej. 16 horas prácticas (4 semanas)"
                    className="cadco-input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400">
                    Formato / Modalidad de Examen
                  </label>
                  <input
                    value={track.examFormat}
                    onChange={(e) => updateTrack(idx, { examFormat: e.target.value })}
                    placeholder="Ej. Examen oficial · 180 min · 14 preguntas"
                    className="cadco-input w-full px-3 py-2 font-mono-tech text-xs"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-400">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={track.description}
                  onChange={(e) => updateTrack(idx, { description: e.target.value })}
                  placeholder="Describe el alcance, metodología y objetivos de la capacitación..."
                  className="cadco-input w-full px-3 py-2 text-xs leading-relaxed"
                />
              </div>

              {/* Temario Clave */}
              <div className="space-y-2 rounded-xl border border-white/10 bg-[#0b0e13]/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#5bb5b9]" />
                    Temario Clave ({track.topics.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => addListItem(idx, 'topics')}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#5bb5b9]/40 bg-[#5bb5b9]/10 px-2.5 py-1 text-[11px] font-semibold text-[#5bb5b9] transition hover:bg-[#5bb5b9] hover:text-slate-950"
                  >
                    <Plus className="h-3 w-3" />
                    Agregar tema
                  </button>
                </div>

                {track.topics.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    Sin temas agregados. Haz clic en &quot;Agregar tema&quot;.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {track.topics.map((topic, topicIdx) => (
                      <div key={topicIdx} className="flex items-center gap-2">
                        <input
                          value={topic}
                          onChange={(e) =>
                            updateListItem(idx, 'topics', topicIdx, e.target.value)
                          }
                          placeholder={`Tema ${topicIdx + 1}`}
                          className="cadco-input min-w-0 flex-1 px-2.5 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeListItem(idx, 'topics', topicIdx)}
                          aria-label={`Eliminar tema ${topicIdx + 1}`}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Incluye / Entregables */}
              <div className="space-y-2 rounded-xl border border-white/10 bg-[#0b0e13]/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
                    <FileCheck2 className="h-3.5 w-3.5 text-[#5bb5b9]" />
                    Incluye / Entregables ({track.deliverables.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => addListItem(idx, 'deliverables')}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#5bb5b9]/40 bg-[#5bb5b9]/10 px-2.5 py-1 text-[11px] font-semibold text-[#5bb5b9] transition hover:bg-[#5bb5b9] hover:text-slate-950"
                  >
                    <Plus className="h-3 w-3" />
                    Agregar entregable
                  </button>
                </div>

                {track.deliverables.length === 0 ? (
                  <p className="text-[11px] text-slate-500">
                    Sin entregables agregados. Haz clic en &quot;Agregar entregable&quot;.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {track.deliverables.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2">
                        <input
                          value={item}
                          onChange={(e) =>
                            updateListItem(idx, 'deliverables', itemIdx, e.target.value)
                          }
                          placeholder={`Entregable ${itemIdx + 1}`}
                          className="cadco-input min-w-0 flex-1 px-2.5 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeListItem(idx, 'deliverables', itemIdx)}
                          aria-label={`Eliminar entregable ${itemIdx + 1}`}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
