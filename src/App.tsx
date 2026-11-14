import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Check, FileBox, Menu, Search, Share2, X } from 'lucide-react';
import { CATALOG_PROJECTS, CATEGORY_LABELS } from './data/catalogData';
import { useCatalogStore } from './store/useCatalogStore';
import type { CatalogCategory } from './types';
import { HeroSection } from './components/sections/HeroSection';
import { ProjectCard } from './components/catalog/ProjectCard';
import { TrainingSection } from './components/sections/TrainingSection';
import { TechAndContactSection } from './components/sections/TechAndContactSection';

const ProjectInspectorModal = React.lazy(() =>
  import('./components/catalog/ProjectInspectorModal').then((m) => ({
    default: m.ProjectInspectorModal,
  }))
);

const Online3DUniversalViewer = React.lazy(() =>
  import('./components/viewers/Online3DUniversalViewer').then((m) => ({
    default: m.Online3DUniversalViewer,
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
  const selectedCategory = useCatalogStore((s) => s.selectedCategory);
  const setSelectedCategory = useCatalogStore((s) => s.setSelectedCategory);
  const searchQuery = useCatalogStore((s) => s.searchQuery);
  const setSearchQuery = useCatalogStore((s) => s.setSearchQuery);
  const selectedProjectId = useCatalogStore((s) => s.selectedProjectId);
  const openProject = useCatalogStore((s) => s.openProject);
  const closeProject = useCatalogStore((s) => s.closeProject);
  const isUniversalViewerOpen = useCatalogStore((s) => s.isUniversalViewerOpen);
  const setUniversalViewerOpen = useCatalogStore((s) => s.setUniversalViewerOpen);
  const copiedProjectId = useCatalogStore((s) => s.copiedProjectId);
  const markLinkCopied = useCatalogStore((s) => s.markLinkCopied);
  const syncFromUrl = useCatalogStore((s) => s.syncFromUrl);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catalogLinkCopied, setCatalogLinkCopied] = useState(false);

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CATALOG_PROJECTS.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.specs.material.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const selectedProject = useMemo(
    () => CATALOG_PROJECTS.find((p) => p.id === selectedProjectId) ?? null,
    [selectedProjectId]
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
      setCatalogLinkCopied(true);
      setTimeout(() => setCatalogLinkCopied(false), 2500);
    } catch {
      setCatalogLinkCopied(true);
    }
  };

  return (
    <div className="min-h-screen bg-cad-grid text-slate-100">
      {/* Top Navbar */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#050608]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <img
              src="./cadco-logo.png"
              alt="CADCO"
              className="h-9 w-auto rounded-md bg-black object-contain px-1.5 py-0.5"
            />
            <span className="hidden font-mono-tech text-[11px] tracking-wider text-[#5bb5b9] uppercase sm:inline">
              CAD · SolidWorks · CSWP
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            <a href="#catalogo" className="transition hover:text-[#5bb5b9]">
              Catálogo 3D
            </a>
            <a href="#capacitacion" className="transition hover:text-[#5bb5b9]">
              Capacitación CSWA/CSWP
            </a>
            <a href="#tecnologia" className="transition hover:text-[#5bb5b9]">
              Motores 3D
            </a>
            <a href="#contacto" className="transition hover:text-[#5bb5b9]">
              Contacto
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUniversalViewerOpen(true)}
              className="hidden items-center gap-1.5 rounded-lg border border-[#5bb5b9]/40 bg-[#5bb5b9]/10 px-3 py-1.5 text-xs font-semibold text-[#5bb5b9] transition hover:bg-[#5bb5b9] hover:text-slate-950 sm:inline-flex"
            >
              <FileBox className="h-3.5 w-3.5" />
              Visor STEP/STL
            </button>

            <button
              type="button"
              onClick={handleCopyCatalogUrl}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#5bb5b9] px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-[#4ea5a9]"
            >
              {catalogLinkCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>¡Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Compartir Catálogo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Menú"
              className="rounded-lg border border-white/10 p-1.5 text-slate-300 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0b0e13] px-4 py-4 md:hidden">
            <div className="flex flex-col space-y-3 text-sm font-medium text-slate-200">
              <a href="#catalogo" onClick={() => setMobileMenuOpen(false)}>
                Catálogo 3D
              </a>
              <a href="#capacitacion" onClick={() => setMobileMenuOpen(false)}>
                Capacitación CSWA/CSWP
              </a>
              <a href="#tecnologia" onClick={() => setMobileMenuOpen(false)}>
                Motores 3D
              </a>
              <a href="#contacto" onClick={() => setMobileMenuOpen(false)}>
                Contacto
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setUniversalViewerOpen(true);
                }}
                className="inline-flex items-center gap-2 text-left text-[#5bb5b9]"
              >
                <FileBox className="h-4 w-4" />
                Abrir Visor Universal STEP/STL
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        <HeroSection onOpenUniversalViewer={() => setUniversalViewerOpen(true)} />

        {/* Catalog Grid Section */}
        <section id="catalogo" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <span className="font-mono-tech text-xs font-semibold tracking-wider text-[#5bb5b9] uppercase">
                  Portafolio Técnico Interactivo
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
                  Catálogo de Componentes & Planimetría
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Haz clic en <strong className="text-white">Inspeccionar 3D</strong> para rotar, explosionar o cambiar el motor gráfico, o revisa los planos técnicos y tolerancias al instante.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar pieza, código, material..."
                  className="w-full rounded-xl border border-white/15 bg-[#0b0e13] py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 outline-none focus:border-[#5bb5b9]"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="mt-7 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-[#5bb5b9] text-slate-950 shadow-md shadow-[#5bb5b9]/20'
                      : 'border border-white/10 bg-[#0b0e13] text-slate-300 hover:border-[#5bb5b9]/40 hover:text-white'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Grid */}
            {filteredProjects.length === 0 ? (
              <div className="mt-12 rounded-2xl border border-white/10 bg-[#0b0e13]/80 p-12 text-center">
                <p className="text-slate-300">
                  No se encontraron proyectos con ese criterio.
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
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </section>

        <TrainingSection />
        <TechAndContactSection onOpenUniversalViewer={() => setUniversalViewerOpen(true)} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050608] py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="./cadco-logo.png" alt="CADCO" className="h-6 w-auto" />
            <span>© {new Date().getFullYear()} CADCO Engineering · Diseño CAD & Capacitación SolidWorks</span>
          </div>
          <span className="font-mono-tech text-[11px] text-slate-500">
            Three.js (MIT) · R3F (MIT) · Babylon.js (Apache 2.0) · Online 3D Viewer (MIT)
          </span>
        </div>
      </footer>

      {/* Lazy Modals */}
      <Suspense fallback={null}>
        {selectedProject && (
          <ProjectInspectorModal project={selectedProject} onClose={closeProject} />
        )}
        {isUniversalViewerOpen && (
          <Online3DUniversalViewer onClose={() => setUniversalViewerOpen(false)} />
        )}
      </Suspense>
    </div>
  );
}

export default App;
