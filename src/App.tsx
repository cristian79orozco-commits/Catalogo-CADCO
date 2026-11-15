import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import {
  Award,
  Box,
  Check,
  GraduationCap,
  Layers,
  Lock,
  Mail,
  Search,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { CATEGORY_LABELS } from './data/catalogData';
import { useCatalogStore, type CatalogViewTab } from './store/useCatalogStore';
import type { CatalogCategory } from './types';
import { ProjectCard } from './components/catalog/ProjectCard';
import { R3FCadViewer } from './components/viewers/R3FCadViewer';
import { CustomCadFileViewer } from './components/viewers/CustomCadFileViewer';
import { HeroVideoShowcase } from './components/viewers/HeroVideoShowcase';
import { CertificatesSection } from './components/sections/CertificatesSection';
import { TrainingSection } from './components/sections/TrainingSection';
import { ContactSection } from './components/sections/ContactSection';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';

const ProjectInspectorModal = React.lazy(() =>
  import('./components/catalog/ProjectInspectorModal').then((m) => ({
    default: m.ProjectInspectorModal,
  }))
);

const AdminStudioModal = React.lazy(() =>
  import('./components/admin/AdminStudioModal').then((m) => ({
    default: m.AdminStudioModal,
  }))
);

const CATEGORIES: CatalogCategory[] = [
  'all',
  'mecanico',
  'planimetria',
  'ensambles',
  'superficies',
];

export function App() {
  const activeView = useCatalogStore((s) => s.activeView);
  const setActiveView = useCatalogStore((s) => s.setActiveView);
  const projects = useCatalogStore((s) => s.projects);
  const certificates = useCatalogStore((s) => s.certificates);
  const brandConfig = useCatalogStore((s) => s.brandConfig);
  const selectedCategory = useCatalogStore((s) => s.selectedCategory);
  const setSelectedCategory = useCatalogStore((s) => s.setSelectedCategory);
  const searchQuery = useCatalogStore((s) => s.searchQuery);
  const setSearchQuery = useCatalogStore((s) => s.setSearchQuery);
  const selectedProjectId = useCatalogStore((s) => s.selectedProjectId);
  const openProject = useCatalogStore((s) => s.openProject);
  const closeProject = useCatalogStore((s) => s.closeProject);
  const copiedProjectId = useCatalogStore((s) => s.copiedProjectId);
  const markLinkCopied = useCatalogStore((s) => s.markLinkCopied);
  const syncFromUrl = useCatalogStore((s) => s.syncFromUrl);
  const fetchLiveCatalog = useCatalogStore((s) => s.fetchLiveCatalog);
  const subscribeRealtime = useCatalogStore((s) => s.subscribeRealtime);
  const initAdminSession = useCatalogStore((s) => s.initAdminSession);
  const openAdminModal = useCatalogStore((s) => s.openAdminModal);

  const [catalogLinkCopied, setCatalogLinkCopied] = useState(false);

  useEffect(() => {
    syncFromUrl();
    void initAdminSession();
    void fetchLiveCatalog();
    const unsubscribe = subscribeRealtime();
    return () => {
      unsubscribe();
    };
  }, [syncFromUrl, initAdminSession, fetchLiveCatalog, subscribeRealtime]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.solidworksModules.some((m) => m.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.specs.software.toLowerCase().includes(q)
      );
    });
  }, [projects, selectedCategory, searchQuery]);

  const featuredProject = useMemo(
    () => projects.find((p) => p.featured) ?? projects[0] ?? null,
    [projects]
  );

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const handleOpen3D = useCallback(
    (projectId: string) => openProject(projectId, 0),
    [openProject]
  );

  const handleOpenPhoto = useCallback(
    (projectId: string, photoIndex: number) => openProject(projectId, photoIndex),
    [openProject]
  );

  const handleCopyProjectLink = useCallback(
    async (projectId: string) => {
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      url.searchParams.set('proyecto', projectId);
      try {
        await navigator.clipboard.writeText(url.toString());
      } catch {
        // Fallback ignored
      }
      markLinkCopied(projectId);
    },
    [markLinkCopied]
  );

  const handleCopyCatalogUrl = async () => {
    try {
      const cleanUrl = window.location.origin + window.location.pathname;
      await navigator.clipboard.writeText(cleanUrl);
    } catch {
      // Fallback ignored
    }
    setCatalogLinkCopied(true);
    setTimeout(() => setCatalogLinkCopied(false), 2500);
  };

  const navItems: Array<{
    id: CatalogViewTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'portfolio', label: 'Catálogo de Trabajos', icon: Layers, badge: projects.length },
    {
      id: 'certificates',
      label: 'Certificados Oficiales',
      icon: ShieldCheck,
      badge: certificates.length,
    },
    { id: 'training', label: 'Capacitación CSWA / CSWP', icon: GraduationCap },
    { id: 'contact', label: 'Contacto Directo', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 lg:flex">
      {/* Desktop Left Architectural Sidebar Rail */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[290px] lg:flex-col lg:justify-between lg:border-r lg:border-white/10 lg:bg-[#080b10]">
        <div className="p-6">
          {/* Brand Identity */}
          <div className="rounded-2xl border border-white/10 bg-[#050608] p-4">
            <img
              src="./cadco-logo.png"
              alt={brandConfig.brandName}
              className="h-11 w-auto object-contain"
            />
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#5bb5b9]/30 bg-[#5bb5b9]/10 px-2.5 py-0.5 font-mono-tech text-[10px] font-medium text-[#5bb5b9]">
              <Award className="h-3 w-3" />
              <span>SolidWorks CSWA · CSWP</span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
              Portafolio profesional de diseño CAD 3D, modelado mecánico, planimetría técnica y formación.
            </p>
          </div>

          {/* Catalog Navigation */}
          <nav className="mt-6 space-y-1.5" aria-label="Secciones del catálogo">
            {navItems.map(({ id, label, icon: Icon, badge }) => {
              const active = activeView === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveView(id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
                    active
                      ? 'border border-[#5bb5b9]/40 bg-[#5bb5b9]/15 text-white shadow-sm'
                      : 'border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${active ? 'text-[#5bb5b9]' : 'text-slate-500'}`}
                    />
                    <span>{label}</span>
                  </span>
                  {badge !== undefined && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 font-mono-tech text-[10px] ${
                        active
                          ? 'bg-[#5bb5b9] font-bold text-slate-950'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 border-t border-white/10 p-5">
          <button
            type="button"
            onClick={handleCopyCatalogUrl}
            className="cadco-btn-primary w-full px-4 py-2.5 text-xs"
          >
            {catalogLinkCopied ? (
              <>
                <Check className="h-4 w-4" />
                <span>¡Enlace Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>Compartir Catálogo</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>© {new Date().getFullYear()} {brandConfig.brandName}</span>
            <button
              type="button"
              onClick={openAdminModal}
              aria-label="Acceso privado"
              title="Acceso privado"
              className="rounded p-1 text-slate-700 transition hover:text-slate-400"
            >
              <Lock className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar & Navigation */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080b10]/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img
              src="./cadco-logo.png"
              alt={brandConfig.brandName}
              className="h-8 w-auto rounded bg-black px-1.5 py-0.5 object-contain"
            />
            <span className="rounded border border-[#5bb5b9]/30 bg-[#5bb5b9]/10 px-2 py-0.5 font-mono-tech text-[10px] text-[#5bb5b9]">
              CSWP
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCatalogUrl}
              className="inline-flex items-center gap-1 rounded-lg bg-[#5bb5b9] px-3 py-1.5 text-xs font-semibold text-slate-950"
            >
              {catalogLinkCopied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{catalogLinkCopied ? 'Copiado' : 'Compartir'}</span>
            </button>
            <button
              type="button"
              onClick={openAdminModal}
              aria-label="Acceso privado"
              className="rounded-lg p-1.5 text-slate-700"
            >
              <Lock className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#5bb5b9] text-slate-950'
                    : 'bg-white/5 text-slate-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Catalog Workspace */}
      <main className="flex-1 bg-cad-grid lg:pl-[290px]">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
          <AnimatePresence mode="wait">
            {activeView === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="space-y-8"
              >
                {/* Featured 3D Engineering Dossier Banner */}
                {featuredProject && (
                  <section className="relative overflow-hidden rounded-2xl border border-[#5bb5b9]/30 bg-[#0b0e13]/95 shadow-[0_20px_60px_-20px_rgba(91,181,185,0.2)]">
                    <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#5bb5b9]/10 blur-3xl" />
                    <div className="relative grid items-stretch lg:grid-cols-12">
                      <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6">
                        <div>
                          <div className="cadco-badge px-3 py-1 text-[11px] font-medium">
                            <Award className="h-3.5 w-3.5" />
                            <span>{brandConfig.heroBadge}</span>
                          </div>
                          <h1 className="mt-4 font-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[42px]">
                            {brandConfig.heroTitlePrefix}{' '}
                            <span className="text-[#5bb5b9]">{brandConfig.heroTitleHighlight}</span>{' '}
                            {brandConfig.heroTitleSuffix}
                          </h1>
                          <p className="mt-3.5 text-sm leading-relaxed text-slate-300 sm:text-base">
                            {brandConfig.heroSubtitle}
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                          <button
                            type="button"
                            onClick={() => handleOpen3D(featuredProject.id)}
                            className="cadco-btn-primary px-5 py-2.5 text-xs sm:text-sm"
                          >
                            <Box className="h-4 w-4" />
                            Inspeccionar Trabajo Destacado
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveView('certificates')}
                            className="cadco-btn-secondary px-4 py-2.5 text-xs sm:text-sm"
                          >
                            <ShieldCheck className="h-4 w-4 text-[#5bb5b9]" />
                            Ver Certificados
                          </button>
                        </div>
                      </div>

                      {/* Live Featured Showcase Stage (Video / 3D CAD / Procedural) */}
                      {(() => {
                        const mode = brandConfig.heroShowcaseMode ?? 'auto';
                        const hasVideo = Boolean(brandConfig.heroVideoFile);
                        const cadFile = brandConfig.heroCadFile ?? featuredProject.customCadFile;

                        const showVideo =
                          (mode === 'video' && hasVideo) || (mode === 'auto' && hasVideo);
                        const showCustomCad =
                          !showVideo &&
                          Boolean(cadFile) &&
                          (mode === 'cad3d' || mode === 'auto');

                        return (
                          <div className="relative h-[300px] overflow-hidden border-t border-white/10 bg-[#050608] sm:h-[340px] lg:col-span-6 lg:h-[400px] lg:border-t-0 lg:border-l">
                            {showVideo && brandConfig.heroVideoFile ? (
                              <HeroVideoShowcase video={brandConfig.heroVideoFile} />
                            ) : showCustomCad && cadFile ? (
                              <CustomCadFileViewer cadFile={cadFile} clean={true} />
                            ) : (
                              <R3FCadViewer
                                modelType={featuredProject.modelType}
                                exploded={false}
                                wireframe={false}
                                autoRotate={true}
                                compact={true}
                              />
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </section>
                )}

                {/* Filter & Search Toolbar */}
                <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                          selectedCategory === cat
                            ? 'bg-[#5bb5b9] text-slate-950'
                            : 'border border-white/10 bg-[#0b0e13] text-slate-300 hover:border-[#5bb5b9]/40 hover:text-white'
                        }`}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      name="catalog-search"
                      autoComplete="off"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar trabajo, código, norma..."
                      className="cadco-input w-full py-2 pr-4 pl-9 text-xs"
                    />
                  </div>
                </div>

                {/* Portfolio Grid */}
                {filteredProjects.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#0b0e13]/80 p-12 text-center">
                    <p className="text-sm text-slate-300">
                      No se encontraron trabajos con ese criterio.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="mt-4 rounded-lg bg-[#5bb5b9] px-4 py-2 text-xs font-semibold text-slate-950"
                    >
                      Mostrar Todos
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isCopied={copiedProjectId === project.id}
                        onOpen3D={handleOpen3D}
                        onOpenPhoto={handleOpenPhoto}
                        onCopyLink={handleCopyProjectLink}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeView === 'certificates' && (
              <motion.div
                key="certificates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <CertificatesSection />
              </motion.div>
            )}

            {activeView === 'training' && (
              <motion.div
                key="training"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <TrainingSection />
              </motion.div>
            )}

            {activeView === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <ContactSection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Suspense fallback={null}>
        {selectedProject && (
          <ProjectInspectorModal project={selectedProject} onClose={closeProject} />
        )}
        <AdminStudioModal />
      </Suspense>
      <WhatsAppFloatingButton />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#0b0e13',
            border: '1px solid rgba(91, 181, 185, 0.35)',
            color: '#f1f5f9',
          },
        }}
      />
    </div>
  );
}

export default App;
