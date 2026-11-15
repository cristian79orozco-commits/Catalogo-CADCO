import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Switch,
} from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Award,
  Box,
  CheckCircle2,
  Database,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  Film,
  FolderPlus,
  ImagePlus,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  Mail,
  Pencil,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useCatalogStore } from '../../store/useCatalogStore';
import { convertImageToWebp } from '../../utils/imageConverter';
import { optimizeCadFile } from '../../utils/cadOptimizer';
import { optimizeVideoForHero } from '../../utils/videoOptimizer';
import { HeroVideoShowcase } from '../viewers/HeroVideoShowcase';
import type {
  BrandConfig,
  CadModelType,
  CatalogCategory,
  CatalogProject,
  CertificationTrack,
  CustomCadFile,
  DigitalCertificate,
  GalleryPhoto,
  HeroShowcaseMode,
} from '../../types';

type AdminTab = 'projects' | 'featured' | 'certificates' | 'brand' | 'backup';

const MODEL_PRESETS: Array<{ value: CadModelType; label: string }> = [
  { value: 'planetary-gear', label: 'Reductor Planetario 4:1' },
  { value: 'hydraulic-flange', label: 'Brida Hidráulica CNC' },
  { value: 'robot-gripper', label: 'Pinza Robótica Articulada' },
  { value: 'sheet-metal-bracket', label: 'Soporte Chapa Metálica' },
  { value: 'piston-assembly', label: 'Subensamble Pistón-Biela' },
  { value: 'industrial-valve', label: 'Válvula Industrial DN80' },
];

const CATEGORY_BADGES: Record<Exclude<CatalogCategory, 'all'>, string> = {
  mecanico: 'Modelado Mecánico',
  planimetria: 'Planimetría & GD&T',
  ensambles: 'Ensambles & Cinemática',
  superficies: 'Chapa & Superficies',
};

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
    solidworksModules: [],
    tags: [],
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
  const saveBrandAndTraining = useCatalogStore((s) => s.saveBrandAndTraining);
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
  const [projectFilter, setProjectFilter] = useState('');
  const [editingProject, setEditingProject] = useState<CatalogProject | null>(null);
  const [editingCert, setEditingCert] = useState<DigitalCertificate | null>(null);
  const [draftBrand, setDraftBrand] = useState<BrandConfig>(brandConfig);
  const [draftTracks, setDraftTracks] = useState<CertificationTrack[]>(trainingTracks);
  const [isBrandDirty, setIsBrandDirty] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [conversionStatus, setConversionStatus] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const backupInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdminOpen && !isBrandDirty) {
      setDraftBrand(brandConfig);
      setDraftTracks(trainingTracks);
    }
  }, [isAdminOpen, brandConfig, trainingTracks, isBrandDirty]);

  const filteredProjects = useMemo(() => {
    const q = projectFilter.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [projects, projectFilter]);

  const notifySuccess = (msg: string) => {
    setSaveError(null);
    toast.success(msg);
  };

  const notifyError = (msg: string) => {
    setSaveError(msg);
    toast.error(msg);
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginAdminWithSupabase(emailInput, passwordInput);
    if (ok) {
      setPasswordInput('');
      notifySuccess('Sesión de administrador iniciada.');
    }
  };

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
        logs.push(
          `${file.name}: ${res.originalSizeKb}KB → ${res.webpSizeKb}KB WebP (-${res.savingsPercent}%)`
        );
      } catch {
        logs.push(`Error al convertir ${file.name}`);
      }
    }

    setEditingProject({
      ...editingProject,
      photos: [...editingProject.photos, ...newPhotos],
    });
    setConversionStatus(logs.join(' | '));
    if (newPhotos.length > 0) {
      notifySuccess(`${newPhotos.length} imagen(es) optimizada(s) a .WebP.`);
    }
  };

  const processCadFileUpload = async (file: File): Promise<CustomCadFile | null> => {
    setSaveError(null);
    try {
      const optimized = await optimizeCadFile(file);
      if (optimized.savingsPercent > 0) {
        setConversionStatus(
          `${optimized.methodLabel} (${optimized.name}): ${optimized.originalSizeKb}KB → ${optimized.optimizedSizeKb}KB (-${optimized.savingsPercent}%)`
        );
      } else {
        setConversionStatus(
          `Modelo 3D listo (${optimized.name}): ${optimized.optimizedSizeKb}KB`
        );
      }
      return { name: optimized.name, dataUrl: optimized.dataUrl };
    } catch (err) {
      notifyError(
        err instanceof Error
          ? err.message
          : 'El archivo 3D supera el límite de 50 MB o no se pudo procesar.'
      );
      return null;
    }
  };

  const handleProjectCadUpload = async (file: File | undefined) => {
    if (!file || !editingProject) return;
    const cadFile = await processCadFileUpload(file);
    if (!cadFile) return;
    setEditingProject({
      ...editingProject,
      customCadFile: cadFile,
    });
    notifySuccess(`Archivo 3D "${file.name}" adjuntado al proyecto.`);
  };

  const handleHeroCadUpload = async (file: File | undefined) => {
    if (!file) return;
    const cadFile = await processCadFileUpload(file);
    if (!cadFile) return;
    setDraftBrand({
      ...draftBrand,
      heroCadFile: cadFile,
    });
    setIsBrandDirty(true);
    notifySuccess(`Modelo 3D principal "${file.name}" cargado. Guarda los cambios para publicarlo en el Hero.`);
  };

  const handleHeroVideoUpload = async (file: File | undefined) => {
    if (!file) return;
    setVideoProgress(0);
    try {
      const optimized = await optimizeVideoForHero(file, (pct) => setVideoProgress(pct));
      setDraftBrand((prev) => ({
        ...prev,
        heroVideoFile: {
          name: optimized.name,
          mimeType: optimized.mimeType,
          dataUrl: optimized.dataUrl,
          width: optimized.width,
          height: optimized.height,
          durationSec: optimized.durationSec,
          originalSizeKb: optimized.originalSizeKb,
          optimizedSizeKb: optimized.optimizedSizeKb,
        },
        heroShowcaseMode: 'video',
      }));
      setIsBrandDirty(true);
      setConversionStatus(
        `Video optimizado (${optimized.width}×${optimized.height}): ${optimized.originalSizeKb}KB → ${optimized.optimizedSizeKb}KB (-${optimized.savingsPercent}%)`
      );
      notifySuccess(
        `Video convertido y optimizado (-${optimized.savingsPercent}%). Guarda para publicarlo.`
      );
    } catch (err) {
      notifyError(err instanceof Error ? err.message : 'No se pudo procesar el video.');
    } finally {
      setVideoProgress(null);
    }
  };

  const handleCertImageUpload = async (file: File | undefined) => {
    if (!file || !editingCert) return;
    const res = await convertImageToWebp(file, 1600, 0.88);
    setEditingCert({ ...editingCert, imageDataUrl: res.dataUrl });
    setConversionStatus(
      `Certificado convertido a .webp: ${res.originalSizeKb}KB → ${res.webpSizeKb}KB (-${res.savingsPercent}%)`
    );
    notifySuccess('Imagen de certificado optimizada a .WebP.');
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
    notifySuccess('Respaldo .JSON descargado.');
  };

  const handleImportBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      importSnapshot(parsed);
      setIsBrandDirty(false);
      notifySuccess('Catálogo restaurado desde archivo JSON.');
    } catch {
      notifyError('Error: archivo JSON inválido.');
    }
  };

  const navTabs: Array<{
    id: AdminTab;
    label: string;
    shortLabel: string;
    icon: React.FC<{ className?: string }>;
    count?: number;
  }> = [
    {
      id: 'projects',
      label: 'Proyectos CAD',
      shortLabel: 'Proyectos',
      icon: Box,
      count: projects.length,
    },
    {
      id: 'featured',
      label: 'Trabajo Destacado',
      shortLabel: 'Destacado',
      icon: Sparkles,
    },
    {
      id: 'certificates',
      label: 'Certificados',
      shortLabel: 'Certificados',
      icon: Award,
      count: certificates.length,
    },
    {
      id: 'brand',
      label: 'Marca & Capacitación',
      shortLabel: 'Marca',
      icon: Settings,
    },
    {
      id: 'backup',
      label: 'Publicar & Respaldo',
      shortLabel: 'Publicar',
      icon: Upload,
    },
  ];

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setEditingProject(null);
    setEditingCert(null);
    setConversionStatus(null);
    setSaveError(null);
  };

  return (
    <Dialog open={isAdminOpen} onClose={closeAdminModal} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition duration-200 data-closed:opacity-0"
      />

      <div className="fixed inset-0 flex items-center justify-center p-0 sm:p-4 lg:p-6">
        {!isAdminAuthenticated ? (
          <DialogPanel
            transition
            className="mx-4 w-full max-w-md rounded-2xl border border-[#5bb5b9]/35 bg-[#0b0e13] p-6 shadow-[0_24px_80px_-16px_rgba(91,181,185,0.28)] transition duration-200 data-closed:scale-95 data-closed:opacity-0"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#5bb5b9]/30 bg-[#5bb5b9]/15 text-[#5bb5b9]">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="font-display text-lg font-bold text-white">
                    CADCO Admin Studio
                  </DialogTitle>
                  <p className="text-xs text-slate-400">
                    Acceso protegido con Supabase Auth
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAdminModal}
                aria-label="Cerrar"
                className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-white/25 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isSupabaseConfigured ? (
              <form onSubmit={handleSupabaseLogin} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-300">
                    Correo de Administrador
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
                      className="cadco-input w-full py-2.5 pr-4 pl-10 text-sm"
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
                      className="cadco-input w-full py-2.5 pr-10 pl-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {authError && (
                  <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="cadco-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
                >
                  {isAuthLoading ? 'Verificando acceso...' : 'Ingresar al Studio CADCO'}
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200">
                Faltan las variables de entorno <code>VITE_SUPABASE_URL</code> y{' '}
                <code>VITE_SUPABASE_ANON_KEY</code>. Configúralas en <code>.env</code> (local) o
                en GitHub Secrets (producción) para habilitar el acceso seguro.
              </div>
            )}
          </DialogPanel>
        ) : (
          <DialogPanel
            transition
            className="flex h-[100dvh] w-full max-w-7xl flex-col overflow-hidden bg-[#0b0e13] shadow-[0_24px_90px_-16px_rgba(0,0,0,0.9)] transition duration-200 data-closed:scale-95 data-closed:opacity-0 sm:h-[92vh] sm:rounded-2xl sm:border sm:border-[#5bb5b9]/35 lg:flex-row"
          >
            {/* DESKTOP WORKSTATION SIDEBAR */}
            <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-white/10 bg-[#070a0f] p-4 lg:flex">
              <div className="space-y-6">
                <div className="rounded-xl border border-[#5bb5b9]/25 bg-[#0b0e13] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#5bb5b9] px-2 py-0.5 font-mono-tech text-[10px] font-bold text-slate-950">
                      ADMIN STUDIO
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono-tech text-[10px] text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {isSupabaseConfigured ? 'ONLINE' : 'LOCAL'}
                    </span>
                  </div>
                  <h2 className="mt-2.5 font-display text-sm font-bold text-white">
                    {brandConfig.brandName}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Gestión centralizada del catálogo
                  </p>
                </div>

                <nav className="space-y-1.5" aria-label="Secciones de administración">
                  {navTabs.map(({ id, label, icon: Icon, count }) => {
                    const active = activeTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleTabChange(id)}
                        className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                          active
                            ? 'border border-[#5bb5b9]/40 bg-[#5bb5b9]/15 text-[#5bb5b9]'
                            : 'border border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{label}</span>
                        </span>
                        {typeof count === 'number' && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 font-mono-tech text-[10px] ${
                              active
                                ? 'bg-[#5bb5b9] text-slate-950'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="rounded-xl border border-white/10 bg-[#0b0e13]/70 p-3.5">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
                    <Layers className="h-3.5 w-3.5 text-[#5bb5b9]" />
                    <span>Resumen del Portafolio</span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-[#050608] p-2">
                      <div className="font-mono-tech text-base font-bold text-white">
                        {projects.length}
                      </div>
                      <div className="text-[10px] text-slate-400">Trabajos</div>
                    </div>
                    <div className="rounded-lg bg-[#050608] p-2">
                      <div className="font-mono-tech text-base font-bold text-white">
                        {certificates.length}
                      </div>
                      <div className="text-[10px] text-slate-400">Certificados</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-white/10 pt-4">
                {adminEmail && (
                  <div className="truncate rounded-lg bg-[#0b0e13] px-3 py-2 font-mono-tech text-[11px] text-[#5bb5b9]">
                    {adminEmail}
                  </div>
                )}
                <button
                  type="button"
                  onClick={logoutAdmin}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar Sesión
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT COLUMN */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              {/* TOP HEADER BAR (Responsive) */}
              <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#080b10] px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#5bb5b9] px-2 py-0.5 font-mono-tech text-[10px] font-bold text-slate-950 lg:hidden">
                      STUDIO
                    </span>
                    <DialogTitle className="truncate font-display text-sm font-bold text-white sm:text-base">
                      {navTabs.find((t) => t.id === activeTab)?.label}
                    </DialogTitle>
                    {isBrandDirty && (activeTab === 'brand' || activeTab === 'featured') && (
                      <span className="hidden rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 font-mono-tech text-[10px] text-amber-300 sm:inline-flex">
                        Sin guardar
                      </span>
                    )}
                  </div>
                  {adminEmail && (
                    <p className="truncate font-mono-tech text-[10px] text-slate-400 lg:hidden">
                      {adminEmail}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {syncError && (
                    <span className="hidden rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-300 sm:inline-flex">
                      {syncError}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={logoutAdmin}
                    aria-label="Cerrar sesión"
                    className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 hover:border-rose-400/50 hover:text-rose-300 lg:hidden"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                  <button
                    type="button"
                    onClick={closeAdminModal}
                    aria-label="Cerrar panel"
                    className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-300 transition hover:border-[#5bb5b9] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </header>

              {/* MOBILE / TABLET HORIZONTAL TABS */}
              <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-white/10 bg-[#070a0f] px-3 py-2 lg:hidden">
                {navTabs.map(({ id, shortLabel, icon: Icon, count }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleTabChange(id)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? 'bg-[#5bb5b9] text-slate-950'
                          : 'border border-white/10 bg-[#0b0e13] text-slate-300'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{shortLabel}</span>
                      {typeof count === 'number' && (
                        <span
                          className={`rounded px-1 font-mono-tech text-[10px] ${
                            active ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SCROLLABLE WORKSPACE BODY */}
              <div className="flex-1 overflow-y-auto bg-cad-grid p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  {/* TAB 1: PROJECTS LIST */}
                  {activeTab === 'projects' && !editingProject && (
                    <motion.div
                      key="projects-list"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="mx-auto max-w-5xl space-y-5"
                    >
                      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b0e13]/90 p-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1 sm:max-w-xs">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            type="search"
                            name="admin-project-search"
                            autoComplete="off"
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            placeholder="Filtrar proyectos por código o título..."
                            className="cadco-input w-full py-2 pr-3 pl-9 text-xs"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSaveError(null);
                            setEditingProject(createEmptyProject());
                          }}
                          className="cadco-btn-primary px-4 py-2.5 text-xs"
                        >
                          <FolderPlus className="h-4 w-4" />
                          Nuevo Trabajo CAD
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredProjects.map((p) => (
                          <div
                            key={p.id}
                            className="cadco-card flex flex-col justify-between p-4"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="rounded-md border border-[#5bb5b9]/30 bg-[#5bb5b9]/10 px-2 py-0.5 font-mono-tech text-[11px] font-semibold text-[#5bb5b9]">
                                  {p.code}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {p.featured && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 font-mono-tech text-[10px] text-amber-300">
                                      <Sparkles className="h-3 w-3" />
                                      Hero
                                    </span>
                                  )}
                                  <span className="rounded bg-white/5 px-2 py-0.5 font-mono-tech text-[10px] text-slate-400">
                                    {p.photos.length} img · {p.customCadFile ? '3D' : 'Base'}
                                  </span>
                                </div>
                              </div>
                              <h4 className="mt-3 font-display text-sm font-bold text-white">
                                {p.title}
                              </h4>
                              <p className="mt-1 text-[11px] font-medium text-[#5bb5b9]/85">
                                {CATEGORY_BADGES[p.category]}
                              </p>
                              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-400">
                                {p.quickSummary}
                              </p>
                            </div>

                            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setSaveError(null);
                                  setConversionStatus(null);
                                  setEditingProject(p);
                                }}
                                className="cadco-btn-secondary flex-1 py-1.5 text-xs"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Editar
                              </button>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={async () => {
                                  setIsSaving(true);
                                  setSaveError(null);
                                  try {
                                    await deleteProject(p.id);
                                    notifySuccess('Proyecto eliminado de la base de datos.');
                                  } catch (err) {
                                    notifyError(
                                      err instanceof Error
                                        ? err.message
                                        : 'Error al eliminar proyecto.'
                                    );
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }}
                                aria-label={`Eliminar ${p.title}`}
                                className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 1: PROJECT EDITOR */}
                  {activeTab === 'projects' && editingProject && (
                    <motion.div
                      key="project-editor"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="mx-auto max-w-4xl space-y-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProject(null);
                              setSaveError(null);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-[#5bb5b9] hover:text-white"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Volver
                          </button>
                          <div>
                            <h3 className="font-display text-base font-bold text-white">
                              {editingProject.title}
                            </h3>
                            <p className="font-mono-tech text-[11px] text-[#5bb5b9]">
                              {editingProject.code}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#070a0f] px-3 py-1.5">
                          <span className="text-xs font-medium text-slate-300">
                            Destacar en Hero 3D
                          </span>
                          <Switch
                            checked={Boolean(editingProject.featured)}
                            onChange={(checked) =>
                              setEditingProject({ ...editingProject, featured: checked })
                            }
                            className="group inline-flex h-5 w-9 items-center rounded-full bg-slate-700 transition data-checked:bg-[#5bb5b9]"
                          >
                            <span className="size-3.5 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-4.5" />
                          </Switch>
                        </div>
                      </div>

                      {/* General Info Card */}
                      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-4 sm:p-5">
                        <h4 className="font-display text-sm font-bold text-white">
                          Información General
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">Código</label>
                            <input
                              value={editingProject.code}
                              onChange={(e) =>
                                setEditingProject({ ...editingProject, code: e.target.value })
                              }
                              className="cadco-input w-full px-3 py-2 font-mono-tech text-xs"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Título del Trabajo
                            </label>
                            <input
                              value={editingProject.title}
                              onChange={(e) =>
                                setEditingProject({ ...editingProject, title: e.target.value })
                              }
                              className="cadco-input w-full px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-xs text-slate-400">Subtítulo</label>
                            <input
                              value={editingProject.subtitle}
                              onChange={(e) =>
                                setEditingProject({ ...editingProject, subtitle: e.target.value })
                              }
                              className="cadco-input w-full px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">Categoría</label>
                            <select
                              value={editingProject.category}
                              onChange={(e) =>
                                setEditingProject({
                                  ...editingProject,
                                  category: e.target.value as Exclude<CatalogCategory, 'all'>,
                                })
                              }
                              className="cadco-input w-full px-3 py-2 text-sm"
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
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Resumen Rápido (Tarjeta)
                            </label>
                            <textarea
                              rows={3}
                              value={editingProject.quickSummary}
                              onChange={(e) =>
                                setEditingProject({
                                  ...editingProject,
                                  quickSummary: e.target.value,
                                })
                              }
                              className="cadco-input w-full px-3 py-2 text-xs leading-relaxed"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Descripción Completa
                            </label>
                            <textarea
                              rows={3}
                              value={editingProject.description}
                              onChange={(e) =>
                                setEditingProject({
                                  ...editingProject,
                                  description: e.target.value,
                                })
                              }
                              className="cadco-input w-full px-3 py-2 text-xs leading-relaxed"
                            />
                          </div>
                        </div>
                      </section>

                      {/* Technical Specs Card */}
                      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-4 sm:p-5">
                        <h4 className="font-display text-sm font-bold text-white">
                          Especificaciones Técnicas
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                                className="cadco-input w-full px-3 py-2 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Applied Skills & Specialties Editor */}
                      <section className="space-y-3 rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-4 sm:p-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="font-display text-sm font-bold text-white">
                              Habilidades y Especialidades Aplicadas
                            </h4>
                            <p className="text-xs text-slate-400">
                              Agrega o elimina libremente las habilidades técnicas reales aplicadas en este proyecto.
                            </p>
                          </div>
                          {editingProject.solidworksModules.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingProject({ ...editingProject, solidworksModules: [] })
                              }
                              className="w-fit text-xs text-rose-400 hover:underline"
                            >
                              Limpiar todas
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            value={newSkillInput}
                            onChange={(e) => setNewSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const trimmed = newSkillInput.trim();
                                if (!trimmed) return;
                                if (!editingProject.solidworksModules.includes(trimmed)) {
                                  setEditingProject({
                                    ...editingProject,
                                    solidworksModules: [...editingProject.solidworksModules, trimmed],
                                  });
                                }
                                setNewSkillInput('');
                              }
                            }}
                            placeholder="Ej. Chapa Metálica, Soldadura, Planos ASME Y14.5, Ensambles..."
                            className="cadco-input min-h-[40px] flex-1 px-3 py-2 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = newSkillInput.trim();
                              if (!trimmed) return;
                              if (!editingProject.solidworksModules.includes(trimmed)) {
                                setEditingProject({
                                  ...editingProject,
                                  solidworksModules: [...editingProject.solidworksModules, trimmed],
                                });
                              }
                              setNewSkillInput('');
                            }}
                            className="cadco-btn-primary min-h-[40px] shrink-0 px-4 py-2 text-xs"
                          >
                            Agregar Habilidad
                          </button>
                        </div>

                        {editingProject.solidworksModules.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {editingProject.solidworksModules.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#5bb5b9]/35 bg-[#5bb5b9]/10 px-2.5 py-1 font-mono-tech text-[11px] text-[#5bb5b9]"
                              >
                                {skill}
                                <button
                                  type="button"
                                  aria-label={`Quitar ${skill}`}
                                  onClick={() =>
                                    setEditingProject({
                                      ...editingProject,
                                      solidworksModules: editingProject.solidworksModules.filter(
                                        (m) => m !== skill
                                      ),
                                    })
                                  }
                                  className="rounded p-0.5 text-[#5bb5b9]/80 transition hover:bg-[#5bb5b9]/20 hover:text-white"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="font-mono-tech text-[11px] text-slate-500">
                            Sin habilidades asignadas. Agrega las que correspondan a este trabajo.
                          </p>
                        )}
                      </section>

                      {/* 3D Model Attachment */}
                      <section className="rounded-2xl border border-[#5bb5b9]/30 bg-[#0b0e13]/95 p-4 sm:p-5">
                        <h4 className="flex items-center gap-2 font-display text-sm font-bold text-white">
                          <FileCode2 className="h-4 w-4 text-[#5bb5b9]" />
                          Modelo 3D de la Pieza o Ensamble
                        </h4>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
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
                              className="cadco-input w-full px-3 py-2 text-xs"
                            >
                              {MODEL_PRESETS.map((m) => (
                                <option key={m.value} value={m.value}>
                                  {m.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Subir Archivo CAD Propio (.STEP, .STL, .OBJ, .GLB · máx. 50 MB)
                            </label>
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#5bb5b9]/40 bg-[#5bb5b9]/10 px-3.5 py-2 text-xs font-medium text-[#5bb5b9] transition hover:bg-[#5bb5b9]/20">
                                <Upload className="h-3.5 w-3.5" />
                                {editingProject.customCadFile
                                  ? `Cambiar (${editingProject.customCadFile.name})`
                                  : 'Adjuntar Archivo 3D'}
                                <input
                                  type="file"
                                  accept=".stp,.step,.igs,.iges,.stl,.obj,.3ds,.gltf,.glb"
                                  className="hidden"
                                  onChange={(e) => {
                                    void handleProjectCadUpload(e.target.files?.[0]);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              {editingProject.customCadFile && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingProject({
                                      ...editingProject,
                                      customCadFile: undefined,
                                    })
                                  }
                                  className="text-xs text-rose-400 hover:underline"
                                >
                                  Quitar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* WebP Photo Uploader */}
                      <section className="rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h4 className="flex items-center gap-2 font-display text-sm font-bold text-white">
                              <ImagePlus className="h-4 w-4 text-[#5bb5b9]" />
                              Galería de Fotos & Planos (Auto .WebP)
                            </h4>
                            {conversionStatus && (
                              <p className="mt-1 font-mono-tech text-[11px] text-emerald-400">
                                {conversionStatus}
                              </p>
                            )}
                          </div>
                          <label className="cadco-btn-primary cursor-pointer px-3.5 py-2 text-xs">
                            <ImagePlus className="h-3.5 w-3.5" />
                            Subir JPG / PNG
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
                              className="rounded-xl border border-white/10 bg-[#050608] p-2.5"
                            >
                              {photo.imageDataUrl ? (
                                <img
                                  src={photo.imageDataUrl}
                                  alt={photo.title}
                                  className="h-24 w-full rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-24 items-center justify-center rounded-lg bg-white/5 font-mono-tech text-[11px] text-slate-400">
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
                                className="cadco-input mt-2 w-full px-2.5 py-1.5 text-xs"
                              />
                              <div className="mt-1.5 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingProject({
                                      ...editingProject,
                                      photos: editingProject.photos.filter(
                                        (p) => p.id !== photo.id
                                      ),
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
                      </section>

                      {saveError && (
                        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
                          {saveError}
                        </p>
                      )}

                      {/* Sticky Action Footer */}
                      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-white/10 bg-[#0b0e13]/95 px-4 py-3 backdrop-blur-md">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => {
                            setEditingProject(null);
                            setSaveError(null);
                          }}
                          className="cadco-btn-secondary px-4 py-2 text-xs disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={async () => {
                            setIsSaving(true);
                            setSaveError(null);
                            try {
                              const exists = projects.some((p) => p.id === editingProject.id);
                              if (exists) await updateProject(editingProject);
                              else await addProject(editingProject);
                              setEditingProject(null);
                              notifySuccess('¡Proyecto guardado en la base de datos!');
                            } catch (err) {
                              notifyError(
                                err instanceof Error
                                  ? err.message
                                  : 'Error al guardar el proyecto.'
                              );
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          className="cadco-btn-primary px-5 py-2 text-xs disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {isSaving ? 'Guardando en Supabase...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: CERTIFICATES LIST */}
                  {activeTab === 'certificates' && !editingCert && (
                    <motion.div
                      key="certs-list"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="mx-auto max-w-5xl space-y-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b0e13]/90 p-4">
                        <p className="text-xs text-slate-300">
                          Sube tus certificados digitales oficiales (conversión automática a{' '}
                          <strong className="text-[#5bb5b9]">.webp</strong>).
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSaveError(null);
                            setEditingCert(createEmptyCertificate());
                          }}
                          className="cadco-btn-primary px-4 py-2 text-xs"
                        >
                          <Award className="h-4 w-4" />
                          Agregar Certificado
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="cadco-card flex flex-col justify-between p-4"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="rounded-md bg-[#5bb5b9] px-2 py-0.5 font-mono-tech text-[11px] font-bold text-slate-950">
                                  {cert.code}
                                </span>
                                <span className="font-mono-tech text-[11px] text-slate-400">
                                  {cert.imageDataUrl ? 'Imagen .WebP lista' : 'Sin imagen'}
                                </span>
                              </div>
                              <h4 className="mt-2.5 font-display text-base font-bold text-white">
                                {cert.title}
                              </h4>
                              <p className="mt-1 font-mono-tech text-xs text-slate-400">
                                ID: {cert.credentialId}
                              </p>
                            </div>
                            <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setSaveError(null);
                                  setConversionStatus(null);
                                  setEditingCert(cert);
                                }}
                                className="cadco-btn-secondary flex-1 py-1.5 text-xs"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Editar / Subir Imagen
                              </button>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={async () => {
                                  setIsSaving(true);
                                  setSaveError(null);
                                  try {
                                    await deleteCertificate(cert.id);
                                    notifySuccess(
                                      'Certificado eliminado de la base de datos.'
                                    );
                                  } catch (err) {
                                    notifyError(
                                      err instanceof Error
                                        ? err.message
                                        : 'Error al eliminar certificado.'
                                    );
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }}
                                className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: CERTIFICATE EDITOR */}
                  {activeTab === 'certificates' && editingCert && (
                    <motion.div
                      key="cert-editor"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="mx-auto max-w-3xl space-y-5"
                    >
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCert(null);
                              setSaveError(null);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-[#5bb5b9] hover:text-white"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Volver
                          </button>
                          <h3 className="font-display text-base font-bold text-white">
                            Editar Certificado Digital
                          </h3>
                        </div>
                      </div>

                      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-4 sm:p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Sigla (ej. CSWP, CSWA)
                            </label>
                            <input
                              value={editingCert.code}
                              onChange={(e) =>
                                setEditingCert({ ...editingCert, code: e.target.value })
                              }
                              className="cadco-input w-full px-3 py-2 font-mono-tech text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Título del Certificado
                            </label>
                            <input
                              value={editingCert.title}
                              onChange={(e) =>
                                setEditingCert({ ...editingCert, title: e.target.value })
                              }
                              className="cadco-input w-full px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Entidad Emisora
                            </label>
                            <input
                              value={editingCert.issuer}
                              onChange={(e) =>
                                setEditingCert({ ...editingCert, issuer: e.target.value })
                              }
                              className="cadco-input w-full px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              ID de Credencial
                            </label>
                            <input
                              value={editingCert.credentialId}
                              onChange={(e) =>
                                setEditingCert({
                                  ...editingCert,
                                  credentialId: e.target.value,
                                })
                              }
                              className="cadco-input w-full px-3 py-2 font-mono-tech text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Fecha / Vigencia
                            </label>
                            <input
                              value={editingCert.issueDate}
                              onChange={(e) =>
                                setEditingCert({ ...editingCert, issueDate: e.target.value })
                              }
                              className="cadco-input w-full px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Imagen del Certificado (Auto .WebP)
                            </label>
                            <label className="cadco-btn-primary cursor-pointer px-4 py-2 text-xs">
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
                              <p className="mt-1.5 font-mono-tech text-[11px] text-emerald-400">
                                {conversionStatus}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs text-slate-400">
                            Descripción
                          </label>
                          <textarea
                            rows={3}
                            value={editingCert.description}
                            onChange={(e) =>
                              setEditingCert({ ...editingCert, description: e.target.value })
                            }
                            className="cadco-input w-full px-3 py-2 text-sm"
                          />
                        </div>
                      </section>

                      {saveError && (
                        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
                          {saveError}
                        </p>
                      )}

                      <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-2xl border border-white/10 bg-[#0b0e13]/95 px-4 py-3 backdrop-blur-md">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => {
                            setEditingCert(null);
                            setSaveError(null);
                          }}
                          className="cadco-btn-secondary px-4 py-2 text-xs disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={async () => {
                            setIsSaving(true);
                            setSaveError(null);
                            try {
                              const exists = certificates.some((c) => c.id === editingCert.id);
                              if (exists) await updateCertificate(editingCert);
                              else await addCertificate(editingCert);
                              setEditingCert(null);
                              notifySuccess('¡Certificado guardado en la base de datos!');
                            } catch (err) {
                              notifyError(
                                err instanceof Error
                                  ? err.message
                                  : 'Error al guardar el certificado.'
                              );
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          className="cadco-btn-primary px-5 py-2 text-xs disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {isSaving ? 'Guardando en Supabase...' : 'Guardar Certificado'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: TRABAJO DESTACADO (VITRINA HERO EXCLUSIVA) */}
                  {activeTab === 'featured' && (
                    <motion.div
                      key="featured-tab"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-5"
                    >
                      <section className="space-y-4 rounded-2xl border border-[#5bb5b9]/25 bg-[#0b0e13]/95 p-4 sm:p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="font-display text-sm font-bold text-white sm:text-base">
                              Visualizador Exclusivo · Trabajo Destacado (Hero)
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-slate-400">
                              Configura qué se muestra en la vitrina principal del catálogo. Puedes subir un video en cualquier formato estándar (se convierte automáticamente a WebM optimizado) o un modelo 3D propio.
                            </p>
                          </div>
                          {isBrandDirty ? (
                            <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 font-mono-tech text-[11px] text-amber-300">
                              Cambios sin guardar
                            </span>
                          ) : (
                            <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono-tech text-[11px] text-emerald-300">
                              Sincronizado
                            </span>
                          )}
                        </div>

                        {/* Modo activo del visualizador Hero */}
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-300">
                            Modo de Visualización del Hero
                          </label>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {(
                              [
                                { id: 'auto', label: 'Automático', desc: 'Prioriza Video → 3D' },
                                { id: 'video', label: 'Video WebM', desc: 'Solo video optimizado' },
                                { id: 'cad3d', label: 'Modelo 3D', desc: 'Archivo 3D propio' },
                                { id: 'procedural', label: 'Base CAD', desc: 'Mecanismo interactivo' },
                              ] as Array<{ id: HeroShowcaseMode; label: string; desc: string }>
                            ).map((opt) => {
                              const active = (draftBrand.heroShowcaseMode ?? 'auto') === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setDraftBrand({ ...draftBrand, heroShowcaseMode: opt.id });
                                    setIsBrandDirty(true);
                                  }}
                                  className={`min-h-[44px] rounded-xl border px-3 py-2 text-left transition ${
                                    active
                                      ? 'border-[#5bb5b9] bg-[#5bb5b9]/15 text-white'
                                      : 'border-white/10 bg-[#070a0f] text-slate-400 hover:border-white/25 hover:text-slate-200'
                                  }`}
                                >
                                  <div className="font-display text-xs font-semibold text-white">
                                    {opt.label}
                                  </div>
                                  <div className="mt-0.5 text-[10px] text-slate-400">{opt.desc}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Video Destacado del Hero */}
                        <div className="space-y-3 rounded-xl border border-white/10 bg-[#070a0f] p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <Film className="h-4 w-4 shrink-0 text-[#5bb5b9]" />
                                <h5 className="font-display text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
                                  Video del Trabajo Destacado (Conversión Automática)
                                </h5>
                              </div>
                              <p className="text-xs leading-relaxed text-slate-400">
                                Acepta cualquier formato estándar (.MP4, .MOV, .WEBM, .AVI, .MKV, .M4V). Al subirlo se convierte y comprime automáticamente a <span className="font-mono-tech text-[#5bb5b9]">.WebM 720p</span> para máxima fluidez y mínimo peso en base de datos.
                              </p>
                              {draftBrand.heroVideoFile && (
                                <p className="font-mono-tech text-[11px] text-emerald-300">
                                  Activo: {draftBrand.heroVideoFile.name} ·{' '}
                                  {draftBrand.heroVideoFile.width}×{draftBrand.heroVideoFile.height} ·{' '}
                                  {draftBrand.heroVideoFile.optimizedSizeKb} KB (antes{' '}
                                  {draftBrand.heroVideoFile.originalSizeKb} KB)
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              <label
                                className={`inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#5bb5b9]/40 bg-[#5bb5b9]/15 px-3.5 py-2 text-xs font-semibold text-[#5bb5b9] transition hover:bg-[#5bb5b9]/25 ${
                                  videoProgress !== null ? 'pointer-events-none opacity-60' : ''
                                }`}
                              >
                                <Upload className="h-3.5 w-3.5" />
                                {videoProgress !== null
                                  ? `Convirtiendo ${videoProgress}%...`
                                  : draftBrand.heroVideoFile
                                    ? 'Cambiar Video'
                                    : 'Subir Video'}
                                <input
                                  type="file"
                                  accept="video/*,.mp4,.mov,.webm,.avi,.mkv,.m4v,.ogv"
                                  className="hidden"
                                  disabled={videoProgress !== null}
                                  onChange={(e) => {
                                    void handleHeroVideoUpload(e.target.files?.[0]);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              {draftBrand.heroVideoFile && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDraftBrand({
                                      ...draftBrand,
                                      heroVideoFile: undefined,
                                      heroShowcaseMode:
                                        draftBrand.heroShowcaseMode === 'video'
                                          ? 'auto'
                                          : draftBrand.heroShowcaseMode,
                                    });
                                    setIsBrandDirty(true);
                                    notifySuccess('Video destacado retirado. Guarda para aplicar.');
                                  }}
                                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Quitar
                                </button>
                              )}
                            </div>
                          </div>

                          {videoProgress !== null && (
                            <div className="space-y-1.5 pt-1">
                              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-[#5bb5b9] transition-all duration-200"
                                  style={{ width: `${videoProgress}%` }}
                                />
                              </div>
                              <p className="font-mono-tech text-[10px] text-slate-400">
                                Optimizando fotogramas y compresión WebM para el catálogo... {videoProgress}%
                              </p>
                            </div>
                          )}

                          {draftBrand.heroVideoFile && (
                            <div className="h-[200px] overflow-hidden rounded-xl border border-white/10 sm:h-[240px]">
                              <HeroVideoShowcase video={draftBrand.heroVideoFile} />
                            </div>
                          )}
                        </div>

                        {/* Modelo 3D Principal del Hero */}
                        <div className="rounded-xl border border-white/10 bg-[#070a0f] p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <Box className="h-4 w-4 shrink-0 text-[#5bb5b9]" />
                                <h5 className="font-display text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
                                  Modelo 3D Principal del Hero
                                </h5>
                              </div>
                              <p className="text-xs leading-relaxed text-slate-400">
                                Sube un ensamble o pieza (.GLB, .GLTF, .STEP, .STL, .OBJ, .IGES) con colores y texturas reales para mostrarlo cuando no haya video activo.
                              </p>
                              <p className="font-mono-tech text-[11px] text-[#5bb5b9]">
                                {draftBrand.heroCadFile
                                  ? `Activo: ${draftBrand.heroCadFile.name}`
                                  : 'Sin modelo 3D propio · Se usará el archivo 3D del proyecto destacado o el mecanismo base.'}
                              </p>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border border-[#5bb5b9]/40 bg-[#5bb5b9]/15 px-3.5 py-2 text-xs font-semibold text-[#5bb5b9] transition hover:bg-[#5bb5b9]/25">
                                <Upload className="h-3.5 w-3.5" />
                                {draftBrand.heroCadFile ? 'Cambiar Modelo 3D' : 'Subir Modelo 3D'}
                                <input
                                  type="file"
                                  accept=".stp,.step,.igs,.iges,.stl,.obj,.3ds,.gltf,.glb"
                                  className="hidden"
                                  onChange={(e) => {
                                    void handleHeroCadUpload(e.target.files?.[0]);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              {draftBrand.heroCadFile && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDraftBrand({ ...draftBrand, heroCadFile: undefined });
                                    setIsBrandDirty(true);
                                    notifySuccess('Modelo 3D principal retirado. Guarda para aplicar.');
                                  }}
                                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Quitar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </section>

                      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-white/10 bg-[#0b0e13]/95 px-4 py-3 backdrop-blur-md">
                        {isBrandDirty && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => {
                              setDraftBrand(brandConfig);
                              setDraftTracks(trainingTracks);
                              setIsBrandDirty(false);
                            }}
                            className="cadco-btn-secondary px-4 py-2 text-xs disabled:opacity-50"
                          >
                            Descartar cambios
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isSaving || videoProgress !== null}
                          onClick={async () => {
                            setIsSaving(true);
                            setSaveError(null);
                            try {
                              await saveBrandAndTraining(draftBrand, draftTracks);
                              setIsBrandDirty(false);
                              notifySuccess('¡Trabajo Destacado guardado en la base de datos!');
                            } catch (err) {
                              notifyError(
                                err instanceof Error
                                  ? err.message
                                  : 'Error al guardar el Trabajo Destacado.'
                              );
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          className="cadco-btn-primary px-5 py-2.5 text-xs disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Guardando...' : 'Guardar Trabajo Destacado'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: BRAND & TRAINING */}
                  {activeTab === 'brand' && (
                    <motion.div
                      key="brand-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="mx-auto max-w-4xl space-y-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#0b0e13]/95 px-4 py-3">
                        <p className="text-xs text-slate-300">
                          Edita libremente los textos de marca, contacto y capacitación. Presiona{' '}
                          <strong className="text-[#5bb5b9]">
                            Guardar Cambios en Base de Datos
                          </strong>{' '}
                          al terminar.
                        </p>
                        {isBrandDirty ? (
                          <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 font-mono-tech text-[11px] text-amber-300">
                            Cambios pendientes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono-tech text-[11px] text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" />
                            Sincronizado
                          </span>
                        )}
                      </div>

                      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-4 sm:p-5">
                        <h4 className="font-display text-sm font-bold text-white">
                          Identidad y Contacto
                        </h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Nombre de Marca
                            </label>
                            <input
                              value={draftBrand.brandName}
                              onChange={(e) => {
                                setDraftBrand({ ...draftBrand, brandName: e.target.value });
                                setIsBrandDirty(true);
                              }}
                              className="cadco-input w-full px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Badge Superior
                            </label>
                            <input
                              value={draftBrand.heroBadge}
                              onChange={(e) => {
                                setDraftBrand({ ...draftBrand, heroBadge: e.target.value });
                                setIsBrandDirty(true);
                              }}
                              className="cadco-input w-full px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              Email de Contacto
                            </label>
                            <input
                              value={draftBrand.contactEmail}
                              onChange={(e) => {
                                setDraftBrand({ ...draftBrand, contactEmail: e.target.value });
                                setIsBrandDirty(true);
                              }}
                              className="cadco-input w-full px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
                              WhatsApp (ej. 573001234567)
                            </label>
                            <input
                              value={draftBrand.whatsappNumber}
                              onChange={(e) => {
                                setDraftBrand({ ...draftBrand, whatsappNumber: e.target.value });
                                setIsBrandDirty(true);
                              }}
                              placeholder="Código de país + número sin +"
                              className="cadco-input w-full px-3 py-2 font-mono-tech text-sm"
                            />
                          </div>
                          {!isSupabaseConfigured && (
                            <div>
                              <label className="mb-1.5 block text-xs text-slate-400">
                                PIN de Administrador
                              </label>
                              <input
                                value={draftBrand.adminPin}
                                onChange={(e) => {
                                  setDraftBrand({ ...draftBrand, adminPin: e.target.value });
                                  setIsBrandDirty(true);
                                }}
                                className="cadco-input w-full px-3 py-2 font-mono-tech text-sm"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs text-slate-400">
                            Subtítulo Principal
                          </label>
                          <textarea
                            rows={3}
                            value={draftBrand.heroSubtitle}
                            onChange={(e) => {
                              setDraftBrand({ ...draftBrand, heroSubtitle: e.target.value });
                              setIsBrandDirty(true);
                            }}
                            className="cadco-input w-full px-3 py-2 text-sm leading-relaxed"
                          />
                        </div>
                      </section>

                      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-4 sm:p-5">
                        <h4 className="font-display text-sm font-bold text-white">
                          Programas de Capacitación (CSWA / CSWP)
                        </h4>
                        <div className="grid gap-4 lg:grid-cols-2">
                          {draftTracks.map((track: CertificationTrack, idx: number) => (
                            <div
                              key={track.code}
                              className="space-y-3 rounded-xl border border-white/10 bg-[#070a0f] p-4"
                            >
                              <span className="inline-block rounded bg-[#5bb5b9]/15 px-2 py-0.5 font-mono-tech text-xs font-bold text-[#5bb5b9]">
                                {track.code}
                              </span>
                              <input
                                value={track.title}
                                onChange={(e) => {
                                  const next = [...draftTracks];
                                  next[idx] = { ...track, title: e.target.value };
                                  setDraftTracks(next);
                                  setIsBrandDirty(true);
                                }}
                                className="cadco-input w-full px-3 py-2 text-sm"
                              />
                              <input
                                value={track.duration}
                                onChange={(e) => {
                                  const next = [...draftTracks];
                                  next[idx] = { ...track, duration: e.target.value };
                                  setDraftTracks(next);
                                  setIsBrandDirty(true);
                                }}
                                className="cadco-input w-full px-3 py-2 text-xs"
                              />
                              <textarea
                                rows={2}
                                value={track.description}
                                onChange={(e) => {
                                  const next = [...draftTracks];
                                  next[idx] = { ...track, description: e.target.value };
                                  setDraftTracks(next);
                                  setIsBrandDirty(true);
                                }}
                                className="cadco-input w-full px-3 py-2 text-xs leading-relaxed"
                              />
                            </div>
                          ))}
                        </div>
                      </section>

                      {saveError && (
                        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
                          {saveError}
                        </p>
                      )}

                      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-white/10 bg-[#0b0e13]/95 px-4 py-3 backdrop-blur-md">
                        {isBrandDirty && (
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => {
                              setDraftBrand(brandConfig);
                              setDraftTracks(trainingTracks);
                              setIsBrandDirty(false);
                              setSaveError(null);
                            }}
                            className="cadco-btn-secondary px-4 py-2 text-xs disabled:opacity-50"
                          >
                            Descartar Cambios
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={async () => {
                            setIsSaving(true);
                            setSaveError(null);
                            try {
                              await saveBrandAndTraining(draftBrand, draftTracks);
                              setIsBrandDirty(false);
                              notifySuccess(
                                '¡Marca y capacitación guardadas en la base de datos!'
                              );
                            } catch (err) {
                              notifyError(
                                err instanceof Error
                                  ? err.message
                                  : 'Error al guardar la configuración.'
                              );
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          className="cadco-btn-primary px-5 py-2.5 text-xs disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving
                            ? 'Guardando en base de datos...'
                            : 'Guardar Cambios en Base de Datos'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: PUBLISH LIVE & BACKUP */}
                  {activeTab === 'backup' && (
                    <motion.div
                      key="backup-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="mx-auto max-w-3xl space-y-5"
                    >
                      {isSupabaseConfigured && (
                        <section className="rounded-2xl border border-emerald-500/35 bg-[#0b0e13]/95 p-5">
                          <div className="flex items-center gap-2.5 text-emerald-300">
                            <ShieldCheck className="h-5 w-5" />
                            <h4 className="font-display text-base font-bold text-white">
                              Base de Datos Supabase Conectada (Tiempo Real + RLS)
                            </h4>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-slate-300">
                            Cada proyecto, certificado o ajuste guardado se sincroniza con
                            Supabase y se refleja al instante en cualquier dispositivo. Si tienes
                            cambios locales pendientes, súbelos ahora:
                          </p>
                          <div className="mt-4">
                            <button
                              type="button"
                              disabled={isSyncingAll}
                              onClick={async () => {
                                setIsSyncingAll(true);
                                setPublishError(null);
                                try {
                                  await syncLocalToSupabase();
                                  notifySuccess(
                                    '¡Catálogo completo sincronizado con Supabase!'
                                  );
                                } catch (err) {
                                  const msg =
                                    err instanceof Error
                                      ? err.message
                                      : 'Error al sincronizar con Supabase.';
                                  setPublishError(msg);
                                  notifyError(msg);
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
                        </section>
                      )}

                      <section className="rounded-2xl border border-[#5bb5b9]/35 bg-[#0b0e13]/95 p-5">
                        <h4 className="font-display text-base font-bold text-white">
                          Publicar en Tiempo Real para Todos tus Clientes
                        </h4>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                          Pega una vez tu GitHub Personal Access Token (con permiso{' '}
                          <em>Contents: Read &amp; Write</em> en <code>Catalogo-CADCO</code>) y
                          presiona <strong>Publicar en Vivo</strong>.
                        </p>

                        <div className="mt-4 space-y-3">
                          <div>
                            <label className="mb-1.5 block text-xs text-slate-400">
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
                              className="cadco-input w-full px-3 py-2 font-mono-tech text-xs"
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
                                notifySuccess(
                                  '¡Catálogo publicado en vivo para todos los clientes!'
                                );
                              } catch (err) {
                                const msg =
                                  err instanceof Error
                                    ? err.message
                                    : 'Error al publicar en GitHub.';
                                setPublishError(msg);
                                notifyError(msg);
                              } finally {
                                setIsPublishing(false);
                              }
                            }}
                            className="cadco-btn-primary px-5 py-2.5 text-xs disabled:opacity-50"
                          >
                            <Upload className="h-4 w-4" />
                            {isPublishing
                              ? 'Publicando en vivo...'
                              : 'Publicar Cambios en Vivo Ahora'}
                          </button>
                        </div>
                      </section>

                      <section className="space-y-3 rounded-2xl border border-white/10 bg-[#0b0e13]/95 p-5">
                        <h4 className="font-display text-sm font-bold text-white">
                          Respaldo Local (.JSON)
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleExportBackup}
                            className="cadco-btn-secondary px-4 py-2.5 text-xs"
                          >
                            <Download className="h-4 w-4 text-[#5bb5b9]" />
                            Descargar Respaldo (.JSON)
                          </button>

                          <button
                            type="button"
                            onClick={() => backupInputRef.current?.click()}
                            className="cadco-btn-secondary px-4 py-2.5 text-xs"
                          >
                            <Upload className="h-4 w-4 text-[#5bb5b9]" />
                            Restaurar desde (.JSON)
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              resetToDefaults();
                              setIsBrandDirty(false);
                              notifySuccess('Catálogo restaurado a valores iniciales.');
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restablecer Catálogo Base
                          </button>
                        </div>
                      </section>

                      <input
                        ref={backupInputRef}
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={(e) => handleImportBackup(e.target.files?.[0])}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </DialogPanel>
        )}
      </div>
    </Dialog>
  );
};
