# PLAN.md — AcademIA
> Plataforma Web de Tutoría Virtual con IA y RAG para Estudiantes Universitarios
> Elaborado por: Manuela Londoño · Angely Daritsy Brito | PUCMM, República Dominicana

---

## 1. Resumen del Proyecto

**AcademIA** es una WebApp inteligente que actúa como tutor virtual personalizado para estudiantes universitarios. Combina una arquitectura **RAG (Retrieval-Augmented Generation)** con el modelo **Gemini 2.5 Flash** de Google para responder preguntas basadas exclusivamente en los materiales de estudio que cada estudiante sube a la plataforma.

### Problema que resuelve
El 80% de los estudiantes universitarios en RD presenta hábitos de estudio deficientes, lo que deriva en bajo rendimiento y deserción. No existen mecanismos de acompañamiento personalizado y proactivo adaptados al contexto local.

### Propuesta de valor
- Chatbot contextualizado al material del estudiante (sin alucinaciones libres)
- Generación automática de cuestionarios adaptativos
- Dashboard de progreso con KPIs de comprensión
- Técnicas de estudio integradas (Socrático, Feynman, Práctica Espaciada)

---

## 2. Stack Tecnológico

| Capa | Tecnología | Rol |
|---|---|---|
| **Frontend** | Next.js 14 + React + TypeScript | SSR, routing, UI principal |
| **Estilos** | Tailwind CSS | Responsive design, componentes |
| **Backend** | Next.js API Routes | Lógica del servidor, orquestación RAG |
| **BaaS** | Supabase (PostgreSQL + Storage + Auth) | BD relacional, archivos, autenticación |
| **IA / LLM** | Gemini 2.5 Flash API (Google) | Generación de respuestas, análisis |
| **Extracción** | PDF-parse / Mammoth / pptx2json | Procesamiento de documentos |
| **Fallback LLM** | DeepSeek-V3 API | Contingencia si Gemini falla |
| **Control versiones** | Git + GitHub | Repositorio compartido |
| **Gestión tareas** | Microsoft Planner (Kanban) | Seguimiento ágil |

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                  │
│  Landing → Auth → Temas → Chatbot → Dashboard           │
└──────────────────────┬──────────────────────────────────┘
                       │ API Routes (Next.js)
┌──────────────────────▼──────────────────────────────────┐
│                    BACKEND / ORQUESTADOR                │
│  1. Upload Handler   2. RAG Pipeline   3. Analytics     │
└──────┬───────────────────────┬───────────────────────────┘
       │                       │
┌──────▼──────┐      ┌─────────▼────────────────────────┐
│  SUPABASE   │      │       GEMINI 2.5 FLASH API        │
│  - Auth     │      │  Long Context RAG Window          │
│  - Storage  │      │  System Prompt (tutor académico)  │
│  - PostgreSQL│     │  Temp controlada para fidelidad   │
│  - RLS      │      └──────────────────────────────────┘
└─────────────┘
```

### Flujo RAG (Long Context)
```
Documento subido
    → Extracción de texto (PDF/Word/PPT/imagen)
    → Chunking lógico (fragmentos con contexto)
    → Almacenamiento en Supabase (tabla: document_chunks)
    → Query del usuario
    → Recuperación de chunks relevantes por materia
    → Inyección en contexto de Gemini 2.5 Flash
    → Respuesta fundamentada en el material del estudiante
```

---

## 4. Modelo de Datos (Supabase / PostgreSQL)

```sql
-- Usuarios
profiles (id, email, gemini_api_key_encrypted, created_at)

-- Materias
subjects (id, user_id, name, description, color, created_at)

-- Documentos
documents (id, subject_id, user_id, name, file_type, storage_path, created_at)

-- Chunks del RAG
document_chunks (id, document_id, subject_id, content, chunk_index, created_at)

-- Sesiones de chat
chat_sessions (id, user_id, subject_id, created_at)

-- Mensajes del chat
chat_messages (id, session_id, role [user|assistant], content, created_at)

-- Cuestionarios
quizzes (id, user_id, subject_id, questions_json, score, completed_at)

-- Métricas
study_metrics (id, user_id, subject_id, study_time_minutes, quiz_score, date)
```

**RLS (Row Level Security):** Cada tabla tiene políticas que restringen acceso únicamente al `user_id` del token JWT activo.

---

## 5. Funcionalidades por Módulo

### 5.1 Autenticación y Credenciales
- [ ] Registro con email/contraseña (Supabase Auth)
- [ ] Login con sesión persistente
- [ ] Ingreso y almacenamiento cifrado de API Key de Gemini
- [ ] Logout seguro

### 5.2 Gestión de Materias y Documentos
- [ ] CRUD de materias (nombre, color, descripción)
- [ ] Upload de archivos: PDF, Word (.docx), PowerPoint (.pptx), imágenes, texto plano
- [ ] Extracción y chunking automático al subir
- [ ] Listado de documentos por materia
- [ ] Eliminación de documentos (y sus chunks)

### 5.3 Chatbot RAG
- [ ] Interfaz de chat por materia
- [ ] Recuperación de chunks relevantes para cada query
- [ ] Llamada a Gemini 2.5 Flash con contexto inyectado
- [ ] System Prompt con rol de tutor académico estricto
- [ ] Técnicas pedagógicas aplicadas: Socrático, Feynman, Desglose, Práctica Espaciada
- [ ] Historial de conversación persistido en Supabase

### 5.4 Generación de Cuestionarios
- [ ] Prompt especializado para generar preguntas tipo test del material
- [ ] Variedad: opción múltiple, verdadero/falso, completar
- [ ] Almacenamiento de resultados (score, fecha)
- [ ] Feedback inmediato por pregunta

### 5.5 Dashboard de Progreso
- [ ] Tiempo de estudio acumulado por materia
- [ ] Historial de scores de cuestionarios (gráfico de línea)
- [ ] Número de sesiones de chat
- [ ] Documentos cargados por materia
- [ ] KPI de comprensión estimado (basado en resultados)

---

## 6. Fases de Desarrollo

### FASE 1 — Pre-Proyecto (Backend Core) ✅ En ejecución
**Objetivo:** Backend al 80% funcional

| Tarea | Responsable | Estado |
|---|---|---|
| Setup proyecto Next.js + Supabase | Manuela | ✅ |
| Esquema de base de datos + RLS | Manuela | ✅ |
| Autenticación (registro/login) | Manuela | ✅ |
| Upload de documentos a Supabase Storage | Manuela | ✅ |
| Extracción de texto y chunking | Manuela | ✅ |
| Integración API Gemini (chat básico) | Manuela | ✅ |
| Pruebas de integración backend | Ambas | 🔄 En Proceso |
| Pruebas con asesora | Ambas | 🔄 En Proceso |
| Capítulos I-IV del Informe Final | Ambas | ✅ |

### FASE 2 — Proyecto Final (Frontend + Integración + Deploy)
**Inicio:** 06 de abril 2026 | **Fin estimado:** 24 de julio 2026

| Tarea | Duración | Inicio | Fin | Responsable |
|---|---|---|---|---|
| Desarrollo Frontend completo | 5 sem | 06-abr | 08-may | Angely |
| Integración de todos los módulos | 2 sem | 11-may | 22-may | Ambas |
| Pruebas de funcionalidad y usabilidad | 3 sem | 25-may | 12-jun | Ambas |
| Pruebas piloto con ≥5 usuarios | 2 sem | 15-jun | 26-jun | Ambas |
| Ajustes finales post-piloto | 2 sem | 29-jun | 10-jul | Ambas |
| Despliegue en producción | 1 sem | 13-jul | 17-jul | Manuela |
| Cierre del proyecto | 1 sem | 20-jul | 24-jul | Ambas |

---

## 7. Pantallas de la Aplicación

### 7.1 Landing Page (`/`)

Pagina publica de entrada a la app. Primera impresion del producto: debe comunicar el valor de AcademIA de forma clara antes de invitar al usuario a registrarse o iniciar sesion. **No requiere autenticacion.**

#### Estructura de secciones (top hacia bottom)

**Navbar fijo**
- Logo + nombre "AcademIA" a la izquierda
- Botones a la derecha: `Iniciar sesion` (outline, borde teal) y `Crear cuenta` (relleno teal, primario)

**Hero Section**
- Headline principal: *"Tu tutor inteligente, siempre disponible"*
- Subheadline: breve descripcion del problema (habitos de estudio deficientes, falta de acompanamiento personalizado)
- CTA principal: boton `Comenzar gratis` que redirige a `/register`
- CTA secundario: link `Ya tengo cuenta, iniciar sesion` que redirige a `/login`
- Ilustracion o imagen representativa (estudiante interactuando con chatbot o dashboard)

**Seccion "Como funciona?"** — 3 pasos visuales con iconos
1. Sube tus materiales (PDFs, Word, PPT, imagenes)
2. Chatea con tu tutor sobre el contenido cargado
3. Genera cuestionarios y mide tu progreso academico

**Seccion de Caracteristicas** — grid de 4 cards
- Chatbot contextualizado exclusivamente a tu material
- Cuestionarios adaptativos generados automaticamente
- Dashboard de progreso con KPIs de comprension
- Tecnicas de estudio integradas: Feynman, Socratico, Practica Espaciada

**Seccion "Por que AcademIA?"**
- Dato estadistico del problema: el 80% de los estudiantes universitarios en RD presenta dificultades con sus habitos de estudio
- Posicionamiento: AcademIA como solucion accesible, personalizada y basada en IA

**Footer**
- Logo + descripcion corta de la plataforma
- Links: Terminos de uso, Privacidad
- Creditos: Proyecto de Grado ICC, PUCMM 2026

#### Notas de diseno
- Fondo principal blanco; secciones alternas con `bg-brand-blush/30`
- Navbar con `bg-brand-teal text-white`
- Boton primario: `bg-brand-teal text-white`, boton outline: `border-brand-teal text-brand-teal`
- Totalmente responsive con diseno mobile-first usando Tailwind CSS

### 7.2 Autenticación (`/auth`)
- Formulario de registro / login
- Validaciones en tiempo real
- Redirección post-auth a `/dashboard`

### 7.3 Dashboard Principal (`/dashboard`)
- Tarjetas de materias registradas
- Resumen de métricas globales
- Botón "Nueva Materia"

### 7.4 Vista de Materia (`/subjects/[id]`)
- Lista de documentos subidos
- Drag & drop para subir archivos
- Acceso al chatbot de esa materia
- Generación de cuestionario

### 7.5 Chatbot (`/subjects/[id]/chat`)
- Input para API Key (solo primera vez)
- Historial de mensajes estilizado
- Indicador de carga mientras Gemini responde
- Selector de técnica de estudio

### 7.6 Cuestionario (`/subjects/[id]/quiz`)
- Pregunta por pregunta con progreso
- Feedback inmediato
- Pantalla de resultados con score

### 7.7 Dashboard de Métricas (`/analytics`)
- Gráficos de progreso (Recharts)
- Tabla de sesiones recientes
- Comparativa por materia

---

## 8. Plan de Pruebas

### Pruebas de Control RAG
- El modelo no debe inventar datos no presentes en el PDF (tolerancia: ≤2 errores)
- Si se excede, se ajusta temperatura de Gemini y system prompt

### Métricas de Calidad de Respuesta
- **Relevancia:** ¿La respuesta atiende la pregunta?
- **Fidelidad:** ¿La información proviene del documento?

### Prueba Piloto con Usuarios
- Mínimo 5 estudiantes de PUCMM
- Meta de satisfacción: ≥ 4.5 / 5.0 en escala UX

---

## 9. Plan de Riesgos

| Riesgo | Probabilidad | Impacto | Estrategia | Activación |
|---|---|---|---|---|
| Fallo API Gemini | Posible | Alto | Fallback a DeepSeek-V3 | 2+ fallos de conexión consecutivos |
| Alucinaciones IA | Muy probable | Medio | Ajustar system prompt + temperatura | >2 datos inventados en pruebas |
| Latencia RAG | Posible | Medio | Reducir tamaño de chunks | Respuesta >8 seg en promedio |
| Seguridad de datos | Poco probable | Medio | RLS estricto en Supabase | Intento de acceso no autorizado detectado |
| Responsive roto | Muy probable | Bajo | Tailwind + pruebas en móvil | Dashboard ilegible en <768px |

---

## 10. Presupuesto

| Categoría | Descripción | Costo USD |
|---|---|---|
| Hardware | 2 Laptops (ya disponibles) | $0 |
| Gemini API | Free tier (1M tokens/mes) | $0 |
| DeepSeek API | Free tier (backup) | $0 |
| Supabase | Free tier (500MB DB, 1GB Storage) | $0 |
| Vercel Deploy | Free tier | $0 |
| Contingencia | Pay-as-you-go si se agota free tier | $20 USD |
| **TOTAL** | | **$20 USD** |

---

## 11. Criterios de Éxito

- [ ] El chatbot responde correctamente basado en el material subido (sin inventar)
- [ ] Los cuestionarios generados son pertinentes al documento cargado
- [ ] El dashboard muestra métricas actualizadas en tiempo real
- [ ] Satisfacción de usuarios piloto ≥ 4.5/5
- [ ] App responsive y funcional en móvil y desktop
- [ ] Deploy exitoso en producción con HTTPS

---

## 12. Paleta de Colores

La identidad visual de AcademIA se define con los siguientes cinco colores oficiales:

| Token | Hex | Nombre | Uso Principal |
|---|---|---|---|
| `--color-taupe` | `#5B4B49` | Taupe Grey | Textos primarios, headers, íconos sobre fondo claro |
| `--color-pink` | `#DB93B0` | Pink Mist | Acentos, botones secundarios, badges, highlights |
| `--color-blush` | `#F7BFB4` | Powder Blush | Fondos de tarjetas, secciones de bienvenida, hover states |
| `--color-steel` | `#77A0A9` | Cool Steel | Bordes, elementos neutrales, estados deshabilitados, sidebar |
| `--color-teal` | `#16697A` | Stormy Teal | Color primario de marca, CTAs, navbar, botones principales |

### Configuración en Tailwind CSS (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          taupe:  '#5B4B49',   // Taupe Grey
          pink:   '#DB93B0',   // Pink Mist
          blush:  '#F7BFB4',   // Powder Blush
          steel:  '#77A0A9',   // Cool Steel
          teal:   '#16697A',   // Stormy Teal — primario
        }
      }
    }
  }
}
export default config
```

### Variables CSS (`globals.css`)

```css
:root {
  --color-taupe:  #5B4B49;   /* Taupe Grey  — texto principal    */
  --color-pink:   #DB93B0;   /* Pink Mist   — acento secundario  */
  --color-blush:  #F7BFB4;   /* Powder Blush — fondos suaves     */
  --color-steel:  #77A0A9;   /* Cool Steel  — neutros / bordes   */
  --color-teal:   #16697A;   /* Stormy Teal — primario de marca  */
}
```

### Guía de Uso

- **Navbar / Header:** fondo `teal` (#16697A), texto blanco
- **Botones primarios (CTA):** `teal` con hover más oscuro (`#0e4f5c`)
- **Botones secundarios:** `pink` (#DB93B0) con texto `taupe`
- **Fondos de página:** blanco o `blush` muy suave (`#F7BFB4` con opacidad 30%)
- **Tarjetas de materias:** borde `steel` (#77A0A9), fondo blanco
- **Textos:** `taupe` (#5B4B49) como color base en lugar de negro puro
- **Links activos / seleccionados:** `teal` con underline
- **Badges / Tags:** fondo `pink` con texto `taupe`
- **Sidebar / Panel lateral:** fondo `steel` oscuro o `teal`

---

## 13. Roles del Equipo


| Persona | Rol | Responsabilidades |
|---|---|---|
| **Manuela Londoño** | Backend & AI Engineer | Supabase, RAG pipeline, Gemini API, chunking, auth |
| **Angely Brito** | Frontend & UX Developer | React components, dashboard, UI/UX, responsive |
| **Laura Ureña Figueroa** | Asesora | Revisión técnica y académica del proyecto |
