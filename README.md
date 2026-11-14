# CADCO — Catálogo Interactivo 3D de Ingeniería & Diseño CAD

Catálogo web profesional, responsivo y compartible por enlace para **CADCO**, especializado en:
- **Diseño CAD & Modelado Mecánico** en SolidWorks (CSWA & CSWP)
- **Planimetría Técnica & Tolerancias GD&T** (ASME Y14.5 / ISO 2768)
- **Ensambles, Chapa Metálica y Superficies**
- **Capacitaciones para Certificaciones CSWA & CSWP**

## Motores 3D y Librerías Integradas
- **Three.js** (Licencia MIT) + **React Three Fiber & Drei** (Licencia MIT): Renderizado PBR en tiempo real, vista explosionada animada, malla y controles orbitales.
- **Babylon.js** (Licencia Apache 2.0): Motor alternativo de inspección PBR industrial.
- **Online 3D Viewer (`online-3d-viewer`)** (Licencia MIT): Visor universal drag-and-drop para abrir archivos reales `.STEP`, `.IGES`, `.STL`, `.OBJ`, `.3DS` y `.GLB` directo en el navegador.

## Desarrollo Local
```bash
npm install
npm run dev
```

## Despliegue Automático (GitHub Pages)
El repositorio incluye `.github/workflows/deploy.yml`. Al subir los cambios a la rama `main` y activar **Settings → Pages → Source: GitHub Actions**, el catálogo quedará publicado en un enlace compartible listo para enviar a clientes y estudiantes.
