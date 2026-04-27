# Estructura de un Proyecto Next.js

## Carpetas y archivos principales

| Ruta | Descripción |
|------|-------------|
| **`src/app/`** | Carpeta que contiene las rutas de la aplicación (App Router). Aquí se definen las páginasmediante archivos `page.js` y los layouts con `layout.js`. |
| **`src/app/layout.js`** | Define el layout raíz que envuelve todas las páginas. Aquí se configuran fuentes, metadata global y la estructura HTML base. |
| **`src/app/page.js`** | Componente que representa la página principal (`/`). Es el punto de entrada visible al cargar la app. |
| **`src/app/globals.css`** | Estilos CSS globales. En proyectos con Tailwind, importa el módulo `@tailwindcss` y define variables CSS (tema claro/oscuro). |
| **`src/app/favicon.ico`** | Icono que aparece en la pestaña del navegador. |
| **`public/`** | Carpeta de archivos estáticos (imágenes, fuentes, archivos públicos) que se sirven tal cual. Accesibles en la URL raíz (`/next.svg`). |
| **`src/`** | Código fuente de la aplicación. En Next.js 13+ se usa la convención `src/app` para mejor organización. |
| **`node_modules/`** | Dependencias instaladas del proyecto (Next.js, React, Tailwind, ESLint, etc.). |
| **`.next/`** | Carpeta generada automáticamente por Next.js con el build de producción (caché, código compilado). No se toca manualmente. |
| **`skills-lock.json`** | Archivo de configuración de skills (extensiones/funciones especializadas de Claude Code). |
| **`AGENTS.md`** | Instrucciones específicas para los agentes de IA que trabajan en el proyecto. |

## Archivos de configuración

| Archivo | Descripción |
|---------|-------------|
| **`package.json`** | Define el proyecto, scripts disponibles (`dev`, `build`, `start`, `lint`) y dependencias. |
| **`next.config.mjs`** | Configuración del bundler de Next.js. Aquí se pueden habilitar/deshabilitar características como `eslint`, `tailwind`, etc. |
| **`eslint.config.mjs`** | Configuración de ESLint para análisis estático del código. |
| **`jsconfig.json`** | Permite usar importaciones con paths absolutos (`@/components` en lugar de paths relativos). |
| **`postcss.config.mjs`** | Configuración de PostCSS para procesar CSS (usado por Tailwind). |
| **`tailwind.config.ts`** | Configuración de Tailwind CSS (temas, colores, plugins). No existe aún en este proyecto. |
| **`.gitignore`** | Archivos y carpetas que Git debe ignorar (node_modules, .next, archivos secretos, etc.). |
| **`CLAUDE.md`** | Archivo de documentación específico del proyecto para Claude Code. |
| **`README.md`** | Documentación general del proyecto. |

## Notas sobre la estructura

- **App Router (`src/app/`)**: Sistema de enrutamiento basado en archivos donde cada carpeta representa una ruta y `page.js` es el componente visible.
- **Sin `src/pages/`**: Este proyecto usa el App Router moderno en lugar del Pages Router antiguo.
- **Tailwind CSS v4**: Integrado via PostCSS con `@import "tailwindcss"` en globals.css.
- **Sin TypeScript**: Este proyecto usa JavaScript puro (`.js`), aunque Next.js soporta TypeScript con `.ts`/`.tsx`.