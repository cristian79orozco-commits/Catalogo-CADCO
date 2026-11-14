import React, { useRef, useState } from 'react';
import {
  Award,
  Box,
  Check,
  Database,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  FolderPlus,
  ImagePlus,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Pencil,
  RotateCcw,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useCatalogStore } from '../../store/useCatalogStore';
import { convertImageToWebp, readFileAsDataUrl } from '../../utils/imageConverter';
import type {
  CadModelType,
  CatalogCategory,
  CatalogProject,
  CertificationTrack,
  DigitalCertificate,
  GalleryPhoto,
} from '../../types';

type AdminTab = 'projects' | 'certificates' | 'brand' | 'backup';

const MODEL_PRESETS: Array<{ value: CadModelType; label: string }> = [
  { value: 'planetary-gear', label: 'Reductor Planetario 4:1' },
  { value: 'hydraulic-flange', label: 'Brida Hidráulica CNC' },
  { value: 'robot-gripper', label: 'Pinza Robótica Articulada' },
  { value: 'sheet-metal-bracket', label: 'Soporte Chapa Metálica' },
  { value: 'piston-assembly', label: 'Subensamble Pistón-Biela' },
  { value: 'industrial-valve', label: 'Válvula Industrial DN80' },
];

function createEmptyProject(): CatalogProject {
  const id = `cadco-${Date.now()}`;
  return {
    id,
    code: 'CADCO-NEW-01',
    title: 'Nuevo Proyecto CAD',
    subtitle: 'Descripción corta del componente o ensamble',
    category: 'mecanico',
    featured: false,
    quickSummary: 'Resumen técnico rápido visible en la tarjeta del catálogo.',
    description: 'Descripción técnica completa del proyecto, requerimientos y entregables.',
    modelType: 'planetary-gear',
    specs: {
      material: 'Acero AISI 4140',
      tolerancia: 'ISO 2768-mK',
      software: 'SolidWorks 2024',
      norma: 'ASME Y14.5',
      proceso: 'Mecanizado CNC',
      tiempoEntrega: '3 días hábiles',
    },
    solidworksModules: ['Modelado 3D', 'Planimetría GD&T'],
    tags: ['SolidWorks', 'CAD'],
    photos: [],
  };
}

function createEmptyCertificate(): DigitalCertificate {
  return {
    id: `cert-${Date.now()}`,
    code: 'CSWP',
    title: 'Nuevo Certificado Oficial',
    issuer: 'Dassault Systèmes · SolidWorks',
    credentialId: 'C-0000000000',
    issueDate: '2026',
    description: 'Certificación oficial verificable.',
  };
}

export const AdminStudioModal: React.FC = () => {
  const isAdminOpen = useCatalogStore((s) => s.isAdminOpen);
  const closeAdminModal = useCatalogStore((s) => s.closeAdminModal);
  const isAdminAuthenticated = useCatalogStore((s) => s.isAdminAuthenticated);
  const loginAdminWithSupabase = useCatalogStore((s) => s.loginAdminWithSupabase);
  const adminEmail = useCatalogStore((s) => s.adminEmail);
  const isAuthLoading = useCatalogStore((s) => s.isAuthLoading);
  const authError = useCatalogStore((s) => s.authError);
  const syncError = useCatalogStore((s) => s.syncError);
  const syncLocalToSupabase = useCatalogStore((s) => s.syncLocalToSupabase);
  const logoutAdmin = useCatalogStore((s) => s.logoutAdmin);

  const projects = useCatalogStore((s) => s.projects);
  const certificates = useCatalogStore((s) => s.certificates);
  const trainingTracks = useCatalogStore((s) => s.trainingTracks);
  const brandConfig = useCatalogStore((s) => s.brandConfig);

  const addProject = useCatalogStore((s) => s.addProject);
  const updateProject = useCatalogStore((s) => s.updateProject);
  const deleteProject = useCatalogStore((s) => s.deleteProject);
  const addCertificate = useCatalogStore((s) => s.addCertificate);
  const updateCertificate = useCatalogStore((s) => s.updateCertificate);
  const deleteCertificate = useCatalogStore((s) => s.deleteCertificate);
  const updateBrandConfig = useCatalogStore((s) => s.updateBrandConfig);
  const updateTrainingTrack = useCatalogStore((s) => s.updateTrainingTrack);
  const importSnapshot = useCatalogStore((s) => s.importSnapshot);
  const resetToDefaults = useCatalogStore((s) => s.resetToDefaults);
  const githubToken = useCatalogStore((s) => s.githubToken);
  const setGithubToken = useCatalogStore((s) => s.setGithubToken);
  const publishLiveToGitHub = useCatalogStore((s) => s.publishLiveToGitHub);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [editingProject, setEditingProject] = useState<CatalogProject | null>(null);
  const [editingCert, setEditingCert] = useState<DigitalCertificate | null>(null);
  const [conversionStatus, setConversionStatus] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const backupInputRef = useRef<HTMLInputElement>(null);

  if (!isAdminOpen) return null;

  const showSavedToast = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(null), 2600);
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginAdminWithSupabase(emailInput, passwordInput);
    if (ok) {
      setPasswordInput('');
    }
  };

  // WebP Image Uploader for Project Photos
  const handleProjectPhotosUpload = async (files: FileList | null) => {
    if (!files || !editingProject) return;
    const newPhotos: GalleryPhoto[] = [];
    const logs: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const res = await convertImageToWebp(file, 1600, 0.84);
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          caption: `Optimizado a .webp (${res.width}×${res.height}px)`,
          kind: 'render',
          drawingCode: `${editingProject.code}-IMG`,
          scale: '1:1',
          imageDataUrl: res.dataUrl,
        });
        logs.push(`${file.name}: ${res.originalSizeKb}KB → ${res.webpSizeKb}KB WebP (-${res.savingsPercent}%)`);
      } catch {
        logs.push(`Error al convertir ${file.name}`);
      }
    }

    setEditingProject({
      ...editingProject,
      photos: [...editingProject.photos, ...newPhotos],
    });
    setConversionStatus(logs.join(' | '));
  };

  const handleProjectCadUpload = async (file: File | undefined) => {
    if (!file || !editingProject) return;
    const dataUrl = await readFileAsDataUrl(file);
    setEditingProject({
      ...editingProject,
      customCadFile: { name: file.name, dataUrl },
    });
    showSavedToast(`Archivo 3D "${file.name}" adjuntado al proyecto.`);
  };

  const handleCertImageUpload = async (file: File | undefined) => {
    if (!file || !editingCert) return;
    const res = await convertImageToWebp(file, 1600, 0.88);
    setEditingCert({ ...editingCert, imageDataUrl: res.dataUrl });
    setConversionStatus(
      `Certificado convertido a .webp: ${res.originalSizeKb}KB → ${res.webpSizeKb}KB (-${res.savingsPercent}%)`
    );
  };

  const handleExportBackup = () => {
    const payload = JSON.stringify(
      { projects, certificates, trainingTracks, brandConfig },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadco-catalogo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      importSnapshot(parsed);
      showSavedToast('Catálogo restaurado desde archivo JSON.');
    } catch {
      showSavedToast('Error: archivo JSON inválido.');
    }
  };

  // Lock Screen when not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
        <div className="w-full max-w-md rounded-2xl border border-[#5bb5b9]/30 bg-[#0b0e13] p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5bb5b9]/15 text-[#5bb5b9]">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  Módulo de Administrador
                </h3>
                <p className="text-xs text-slate-400">Acceso exclusivo del propietario CADCO</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAdminModal}
              className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isSupabaseConfigured ? (
            <form onSubmit={handleSupabaseLogin} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Correo de Administrador (Supabase Auth)
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@cadco.com"
                    className="w-full rounded-xl border border-white/15 bg-[#050608] py-2.5 pr-4 pl-10 text-sm text-white outline-none focus:border-[#5bb5b9]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Contraseña
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Tu contraseña de Supabase"
                    className="w-full rounded-xl border border-white/15 bg-[#050608] py-2.5 pr-10 pl-10 text-sm text-white outline-none focus:border-[#5bb5b9]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full rounded-xl bg-[#5bb5b9] py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#4ea5a9] disabled:opacity-50"
              >
                {isAuthLoading ? 'Verificando acceso...' : 'Ingresar al Studio CADCO'}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200">
              Faltan las variables de entorno <code>VITE_SUPABASE_URL</code> y{' '}
              <code>VITE_SUPABASE_ANON_KEY</code>. Configúralas en <code>.env</code> (local) o en
              GitHub Secrets (producción) para habilitar el acceso seguro con Supabase Auth.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 backdrop-blur-md sm:p-5">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#5bb5b9]/35 bg-[#0b0e13] shadow-2xl">
        {/* Admin Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-[#5bb5b9] px-2.5 py-1 font-mono-tech text-xs font-bold text-slate-950">
              ADMIN STUDIO
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-white sm:text-lg">
                Gestión Privada del Catálogo CADCO
              </h2>
              {adminEmail && (
                <p className="font-mono-tech text-[11px] text-[#5bb5b9]">
                  Sesión segura Supabase: {adminEmail}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {syncError && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-300">
                {syncError}
              </span>
            )}
            {savedFeedback && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                <Check className="h-3.5 w-3.5" />
                {savedFeedback}
              </span>
            )}
            <button
              type="button"
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-rose-400/50 hover:text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar Sesión
            </button>
            <button
              type="button"
              onClick={closeAdminModal}
              aria-label="Cerrar panel"
              className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-white/10 bg-[#070a0f] px-5 py-2.5">
          {[
            { id: 'projects', label: `Proyectos CAD (${projects.length})`, icon: Box },
            { id: 'certificates', label: `Certificados (${certificates.length})`, icon: Award },
            { id: 'brand', label: 'Marca, Textos & Capacitación', icon: Settings },
            { id: 'backup', label: 'Publicar en Vivo & Respaldo', icon: Upload },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id as AdminTab);
                setEditingProject(null);
                setEditingCert(null);
                setConversionStatus(null);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                activeTab === id
                  ? 'bg-[#5bb5b9] text-slate-950'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB 1: PROJECTS */}
          {activeTab === 'projects' && !editingProject && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-300">
                  Agrega nuevos trabajos realizados, sube fotos JPG/PNG (se optimizan a <strong className="text-[#5bb5b9]">.webp</strong> automáticamente) y adjunta su modelo 3D.
                </p>
                <button
                  type="button"
                  onClick={() => setEditingProject(createEmptyProject())}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#5bb5b9] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#4ea5a9]"
                >
                  <FolderPlus className="h-4 w-4" />
                  Nuevo Trabajo CAD
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#070a0f] p-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono-tech text-[11px] text-[#5bb5b9]">{p.code}</span>
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                          {p.photos.length} fotos · {p.customCadFile ? '3D Propio' : '3D Base'}
                        </span>
                      </div>
                      <h4 className="mt-2 font-display text-sm font-bold text-white">{p.title}</h4>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">{p.quickSummary}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingProject(p)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 py-1.5 text-xs font-medium text-slate-200 hover:border-[#5bb5b9]"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteProject(p.id);
                          showSavedToast('Proyecto eliminado.');
                        }}
                        aria-label={`Eliminar ${p.title}`}
                        className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECT EDITOR */}
          {activeTab === 'projects' && editingProject && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display text-lg font-bold text-white">
                  Editando: {editingProject.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Volver a la lista
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Código</label>
                  <input
                    value={editingProject.code}
                    onChange={(e) => setEditingProject({ ...editingProject, code: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-slate-400">Título del Trabajo</label>
                  <input
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-slate-400">Subtítulo</label>
                  <input
                    value={editingProject.subtitle}
                    onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Categoría</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        category: e.target.value as Exclude<CatalogCategory, 'all'>,
                      })
                    }
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  >
                    <option value="mecanico">Modelado Mecánico</option>
                    <option value="planimetria">Planimetría & GD&T</option>
                    <option value="ensambles">Ensambles & Cinemática</option>
                    <option value="superficies">Chapa & Superficies</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Resumen Rápido (Tarjeta)</label>
                  <textarea
                    rows={3}
                    value={editingProject.quickSummary}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, quickSummary: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Descripción Completa</label>
                  <textarea
                    rows={3}
                    value={editingProject.description}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              {/* Technical Specs */}
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ['material', 'Material'],
                    ['tolerancia', 'Tolerancia'],
                    ['software', 'Software CAD'],
                    ['norma', 'Normativa'],
                    ['proceso', 'Proceso Manufactura'],
                    ['tiempoEntrega', 'Tiempo de Entrega'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs text-slate-400">{label}</label>
                    <input
                      value={editingProject.specs[key]}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          specs: { ...editingProject.specs, [key]: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              {/* 3D Model Attachment */}
              <div className="rounded-xl border border-[#5bb5b9]/30 bg-[#070a0f] p-4">
                <h4 className="flex items-center gap-2 text-sm font-bold text-white">
                  <FileCode2 className="h-4 w-4 text-[#5bb5b9]" />
                  Modelo 3D de la Pieza o Ensamble
                </h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">
                      Modelo 3D Base (si no adjuntas archivo propio)
                    </label>
                    <select
                      value={editingProject.modelType}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          modelType: e.target.value as CadModelType,
                        })
                      }
                      className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-xs text-white"
                    >
                      {MODEL_PRESETS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-slate-400">
                      Subir Archivo CAD Propio (.STEP, .STL, .OBJ, .GLB)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#5bb5b9]/40 bg-[#5bb5b9]/10 px-3 py-2 text-xs font-medium text-[#5bb5b9] hover:bg-[#5bb5b9]/20">
                        <Upload className="h-3.5 w-3.5" />
                        {editingProject.customCadFile
                          ? `Cambiar (${editingProject.customCadFile.name})`
                          : 'Adjuntar Archivo 3D'}
                        <input
                          type="file"
                          accept=".stp,.step,.igs,.iges,.stl,.obj,.3ds,.gltf,.glb"
                          className="hidden"
                          onChange={(e) => handleProjectCadUpload(e.target.files?.[0])}
                        />
                      </label>
                      {editingProject.customCadFile && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProject({ ...editingProject, customCadFile: undefined })
                          }
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* WebP Photo Uploader */}
              <div className="rounded-xl border border-white/10 bg-[#070a0f] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-white">
                      <ImagePlus className="h-4 w-4 text-[#5bb5b9]" />
                      Galería de Fotos & Planos (Conversión Automática JPG/PNG → .WebP)
                    </h4>
                    {conversionStatus && (
                      <p className="mt-1 font-mono-tech text-[11px] text-emerald-400">
                        {conversionStatus}
                      </p>
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#5bb5b9] px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-[#4ea5a9]">
                    <ImagePlus className="h-3.5 w-3.5" />
                    Subir JPG / PNG (Auto .WebP)
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleProjectPhotosUpload(e.target.files)}
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {editingProject.photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="rounded-lg border border-white/10 bg-[#050608] p-2.5"
                    >
                      {photo.imageDataUrl ? (
                        <img
                          src={photo.imageDataUrl}
                          alt={photo.title}
                          className="h-24 w-full rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-24 items-center justify-center rounded bg-white/5 font-mono-tech text-[11px] text-slate-400">
                          Plano Vectorial ({photo.drawingCode})
                        </div>
                      )}
                      <input
                        value={photo.title}
                        onChange={(e) => {
                          const next = [...editingProject.photos];
                          next[idx] = { ...photo, title: e.target.value };
                          setEditingProject({ ...editingProject, photos: next });
                        }}
                        className="mt-2 w-full rounded border border-white/10 bg-black px-2 py-1 text-xs text-white"
                      />
                      <div className="mt-1.5 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProject({
                              ...editingProject,
                              photos: editingProject.photos.filter((p) => p.id !== photo.id),
                            })
                          }
                          className="text-[11px] text-rose-400 hover:underline"
                        >
                          Eliminar foto
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const exists = projects.some((p) => p.id === editingProject.id);
                    if (exists) updateProject(editingProject);
                    else addProject(editingProject);
                    setEditingProject(null);
                    showSavedToast('Proyecto guardado en el catálogo.');
                  }}
                  className="rounded-xl bg-[#5bb5b9] px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-[#4ea5a9]"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CERTIFICATES */}
          {activeTab === 'certificates' && !editingCert && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-300">
                  Sube tus certificados digitales oficiales (JPG/PNG se convierten automáticamente a <strong className="text-[#5bb5b9]">.webp</strong>).
                </p>
                <button
                  type="button"
                  onClick={() => setEditingCert(createEmptyCertificate())}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#5bb5b9] px-4 py-2 text-xs font-semibold text-slate-950"
                >
                  <Award className="h-4 w-4" />
                  Agregar Certificado
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#070a0f] p-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-[#5bb5b9] px-2 py-0.5 font-mono-tech text-[11px] font-bold text-slate-950">
                          {cert.code}
                        </span>
                        <span className="font-mono-tech text-xs text-slate-400">
                          {cert.imageDataUrl ? 'Imagen .WebP cargada' : 'Sin imagen aún'}
                        </span>
                      </div>
                      <h4 className="mt-2 font-display text-base font-bold text-white">
                        {cert.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-400">ID: {cert.credentialId}</p>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingCert(cert)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 py-1.5 text-xs font-medium text-slate-200 hover:border-[#5bb5b9]"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar / Subir Imagen
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteCertificate(cert.id);
                          showSavedToast('Certificado eliminado.');
                        }}
                        className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CERTIFICATE EDITOR */}
          {activeTab === 'certificates' && editingCert && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-display text-lg font-bold text-white">
                  Editar Certificado Digital
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Volver
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Sigla (ej. CSWP, CSWA)</label>
                  <input
                    value={editingCert.code}
                    onChange={(e) => setEditingCert({ ...editingCert, code: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Título del Certificado</label>
                  <input
                    value={editingCert.title}
                    onChange={(e) => setEditingCert({ ...editingCert, title: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Entidad Emisora</label>
                  <input
                    value={editingCert.issuer}
                    onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">ID de Credencial</label>
                  <input
                    value={editingCert.credentialId}
                    onChange={(e) =>
                      setEditingCert({ ...editingCert, credentialId: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Fecha / Vigencia</label>
                  <input
                    value={editingCert.issueDate}
                    onChange={(e) => setEditingCert({ ...editingCert, issueDate: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    Imagen del Certificado (JPG/PNG → Auto .WebP)
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#5bb5b9] px-4 py-2 text-xs font-semibold text-slate-950">
                    <ImagePlus className="h-4 w-4" />
                    Subir Certificado
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleCertImageUpload(e.target.files?.[0])}
                    />
                  </label>
                  {conversionStatus && (
                    <p className="mt-1 font-mono-tech text-[11px] text-emerald-400">
                      {conversionStatus}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Descripción</label>
                <textarea
                  rows={3}
                  value={editingCert.description}
                  onChange={(e) =>
                    setEditingCert({ ...editingCert, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const exists = certificates.some((c) => c.id === editingCert.id);
                    if (exists) updateCertificate(editingCert);
                    else addCertificate(editingCert);
                    setEditingCert(null);
                    showSavedToast('Certificado guardado.');
                  }}
                  className="rounded-xl bg-[#5bb5b9] px-5 py-2 text-xs font-semibold text-slate-950"
                >
                  Guardar Certificado
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BRAND & TRAINING */}
          {activeTab === 'brand' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Nombre de Marca</label>
                  <input
                    value={brandConfig.brandName}
                    onChange={(e) => updateBrandConfig({ brandName: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Badge Superior</label>
                  <input
                    value={brandConfig.heroBadge}
                    onChange={(e) => updateBrandConfig({ heroBadge: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Email de Contacto</label>
                  <input
                    value={brandConfig.contactEmail}
                    onChange={(e) => updateBrandConfig({ contactEmail: e.target.value })}
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">
                    WhatsApp (ej. 573001234567)
                  </label>
                  <input
                    value={brandConfig.whatsappNumber}
                    onChange={(e) => updateBrandConfig({ whatsappNumber: e.target.value })}
                    placeholder="Código de país + número sin +"
                    className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                  />
                </div>
                {!isSupabaseConfigured && (
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">
                      PIN de Administrador
                    </label>
                    <input
                      value={brandConfig.adminPin}
                      onChange={(e) => updateBrandConfig({ adminPin: e.target.value })}
                      className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Subtítulo Principal</label>
                <textarea
                  rows={3}
                  value={brandConfig.heroSubtitle}
                  onChange={(e) => updateBrandConfig({ heroSubtitle: e.target.value })}
                  className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 text-sm text-white"
                />
              </div>

              {/* Training Tracks Editor */}
              <div className="space-y-4 border-t border-white/10 pt-5">
                <h4 className="font-display text-base font-bold text-white">
                  Programas de Capacitación (CSWA / CSWP)
                </h4>
                <div className="grid gap-4 lg:grid-cols-2">
                  {trainingTracks.map((track: CertificationTrack) => (
                    <div
                      key={track.code}
                      className="space-y-3 rounded-xl border border-white/10 bg-[#070a0f] p-4"
                    >
                      <span className="font-mono-tech text-xs font-bold text-[#5bb5b9]">
                        {track.code}
                      </span>
                      <input
                        value={track.title}
                        onChange={(e) =>
                          updateTrainingTrack({ ...track, title: e.target.value })
                        }
                        className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-1.5 text-sm text-white"
                      />
                      <input
                        value={track.duration}
                        onChange={(e) =>
                          updateTrainingTrack({ ...track, duration: e.target.value })
                        }
                        className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-1.5 text-xs text-white"
                      />
                      <textarea
                        rows={2}
                        value={track.description}
                        onChange={(e) =>
                          updateTrainingTrack({ ...track, description: e.target.value })
                        }
                        className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PUBLISH LIVE & BACKUP */}
          {activeTab === 'backup' && (
            <div className="max-w-2xl space-y-6">
              {isSupabaseConfigured && (
                <div className="rounded-xl border border-emerald-500/35 bg-[#070a0f] p-5">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                    <h4 className="font-display text-base font-bold text-white">
                      Base de Datos Supabase Conectada (Tiempo Real + RLS)
                    </h4>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    Cada proyecto, certificado o ajuste que guardes se sincroniza automáticamente con Supabase y se refleja al instante en tu celular y en el navegador de cualquier cliente. Si tienes cambios locales pendientes en este equipo, súbelos ahora con un clic:
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isSyncingAll}
                      onClick={async () => {
                        setIsSyncingAll(true);
                        try {
                          await syncLocalToSupabase();
                          showSavedToast('¡Catálogo completo sincronizado con Supabase!');
                        } catch (err) {
                          setPublishError(
                            err instanceof Error ? err.message : 'Error al sincronizar con Supabase.'
                          );
                        } finally {
                          setIsSyncingAll(false);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                    >
                      <Database className="h-4 w-4" />
                      {isSyncingAll
                        ? 'Sincronizando con Supabase...'
                        : 'Sincronizar Catálogo Local → Supabase'}
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-[#5bb5b9]/35 bg-[#070a0f] p-5">
                <h4 className="font-display text-base font-bold text-white">
                  Publicar en Tiempo Real para Todos tus Clientes
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                  Tus cambios se guardan primero en este equipo. Para que <strong className="text-white">cualquier cliente que abra tu link</strong> vea inmediatamente los nuevos proyectos, fotos <span className="text-[#5bb5b9]">.webp</span>, archivos 3D y certificados, pega una vez tu GitHub Personal Access Token (con permiso <em>Contents: Read &amp; Write</em> en <code>Catalogo-CADCO</code>) y presiona <strong>Publicar en Vivo</strong>.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">
                      GitHub Token (se guarda solo en tu navegador)
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => {
                        setGithubToken(e.target.value);
                        setPublishError(null);
                      }}
                      placeholder="github_pat_... o ghp_..."
                      className="w-full rounded-lg border border-white/15 bg-[#050608] px-3 py-2 font-mono-tech text-xs text-white"
                    />
                  </div>

                  {publishError && (
                    <p className="text-xs text-rose-400">{publishError}</p>
                  )}

                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={async () => {
                      setIsPublishing(true);
                      setPublishError(null);
                      try {
                        await publishLiveToGitHub();
                        showSavedToast('¡Catálogo publicado en vivo para todos los clientes!');
                      } catch (err) {
                        setPublishError(
                          err instanceof Error ? err.message : 'Error al publicar en GitHub.'
                        );
                      } finally {
                        setIsPublishing(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#5bb5b9] px-5 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-[#4ea5a9] disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {isPublishing ? 'Publicando en vivo...' : 'Publicar Cambios en Vivo Ahora'}
                  </button>
                </div>
              </div>

              <div className="space-y-3 border-t border-white/10 pt-5">
                <h4 className="text-sm font-bold text-white">Respaldo Local (.JSON)</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:border-[#5bb5b9]"
                  >
                    <Download className="h-4 w-4 text-[#5bb5b9]" />
                    Descargar Respaldo (.JSON)
                  </button>

                  <button
                    type="button"
                    onClick={() => backupInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-white hover:border-[#5bb5b9]"
                  >
                    <Upload className="h-4 w-4 text-[#5bb5b9]" />
                    Restaurar desde (.JSON)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetToDefaults();
                      showSavedToast('Catálogo restaurado a valores iniciales.');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-medium text-rose-300"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restablecer Catálogo Base
                  </button>
                </div>
              </div>

              <input
                ref={backupInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => handleImportBackup(e.target.files?.[0])}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
