# CLAUDE.md — AcademIA
> Contexto de proyecto para Claude Code / Agentes de IA
> Última actualización: Abril 2026

---

## ¿Qué es este proyecto?

**AcademIA** es una WebApp de tutoría virtual inteligente para estudiantes universitarios de la PUCMM (República Dominicana). Permite a los estudiantes subir sus materiales de estudio (PDFs, Word, PPT, imágenes, texto) e interactuar con un chatbot contextualizado que responde **exclusivamente** basándose en esos documentos usando una arquitectura RAG con **Gemini 2.5 Flash**.

---

## Stack Técnico

```
Frontend:  Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
Backend:   Next.js API Routes (server-side)
Base de datos: Supabase (PostgreSQL + Auth + Storage)
IA:        Google Gemini 2.5 Flash API (Long Context RAG)
Fallback:  DeepSeek-V3 API
```

---

## Estructura de Carpetas

```
academIA/
├── app/
│   ├── page.tsx                        # Landing Page (publica, sin auth)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── dashboard/page.tsx          # Lista de materias + métricas rápidas
│   │   ├── subjects/
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Vista de materia (documentos)
│   │   │       ├── chat/page.tsx       # Chatbot RAG
│   │   │       └── quiz/page.tsx       # Cuestionario generado
│   │   └── analytics/page.tsx          # Dashboard de progreso completo
│   ├── api/
│   │   ├── upload/route.ts             # Upload + extracción + chunking
│   │   ├── chat/route.ts               # Orquestador RAG → Gemini
│   │   ├── quiz/route.ts               # Generación de cuestionarios
│   │   └── analytics/route.ts          # KPIs y métricas
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ApiKeyModal.tsx
│   ├── dashboard/
│   │   ├── SubjectCard.tsx
│   │   └── MetricChart.tsx
│   ├── documents/
│   │   ├── FileUploader.tsx
│   │   └── DocumentList.tsx
│   └── quiz/
│       ├── QuizQuestion.tsx
│       └── QuizResults.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Supabase browser client
│   │   └── server.ts                   # Supabase server client (SSR)
│   ├── gemini/
│   │   ├── client.ts                   # Gemini SDK init
│   │   └── prompts.ts                  # System prompts centralizados
│   ├── rag/
│   │   ├── chunker.ts                  # Lógica de chunking de documentos
│   │   ├── extractor.ts               # Extracción de texto por tipo de archivo
│   │   └── retriever.ts               # Recuperación de chunks relevantes
│   └── utils.ts
├── types/
│   └── index.ts                        # Tipos TypeScript del proyecto
├── middleware.ts                        # Auth guard con Supabase
├── .env.local                          # Variables de entorno (NO subir a git)
└── CLAUDE.md                           # Este archivo
```

---

## Variables de Entorno (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role (solo en servidor, nunca en cliente)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Gemini (solo como fallback del servidor si se decide manejar clave global)
# En producción, la clave la provee cada usuario desde la UI
GEMINI_API_KEY=AIza...

# DeepSeek (fallback)
DEEPSEEK_API_KEY=sk-...
```

> **IMPORTANTE:** La API Key de Gemini la ingresa cada estudiante desde la UI y se almacena cifrada en `profiles.gemini_api_key_encrypted`. Nunca se guarda en texto plano.

---

## Esquema de Base de Datos (Supabase)

```sql
-- Perfiles extendidos (1:1 con auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  gemini_api_key_encrypted TEXT,  -- cifrado antes de guardar
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materias del estudiante
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos subidos
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,  -- 'pdf' | 'docx' | 'pptx' | 'txt' | 'image'
  storage_path TEXT NOT NULL,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chunks del RAG (texto fragmentado de cada documento)
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sesiones de chat
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensajes del chat
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cuestionarios generados y sus resultados
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  questions_json JSONB NOT NULL,  -- array de {question, options[], correct, explanation}
  score NUMERIC(5,2),             -- 0.00 - 100.00
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métricas de estudio
CREATE TABLE study_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  study_time_minutes INTEGER DEFAULT 0,
  chat_messages_count INTEGER DEFAULT 0,
  quiz_score NUMERIC(5,2),
  date DATE DEFAULT CURRENT_DATE
);
```

### RLS (Row Level Security) — OBLIGATORIO en todas las tablas

```sql
-- Patrón estándar para cada tabla con user_id:
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own data"
  ON subjects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Repetir para: documents, document_chunks, chat_sessions,
-- chat_messages, quizzes, study_metrics, profiles
```

---

## API Routes — Contratos

### POST `/api/upload`
```typescript
// Request: FormData con campos:
// - file: File
// - subjectId: string
// - userId: string

// Response:
{
  documentId: string,
  chunksCreated: number,
  message: string
}
```

### POST `/api/chat`
```typescript
// Request:
{
  message: string,
  subjectId: string,
  sessionId: string,
  geminiApiKey: string,   // desde el cliente (nunca se persiste aquí)
  studyTechnique?: 'socratic' | 'feynman' | 'breakdown' | 'spaced'
}

// Response (stream):
// text/event-stream con chunks de la respuesta de Gemini
```

### POST `/api/quiz`
```typescript
// Request:
{
  subjectId: string,
  geminiApiKey: string,
  questionCount?: number  // default: 5
}

// Response:
{
  quizId: string,
  questions: Array<{
    question: string,
    options: string[],
    correct: number,      // índice de la opción correcta
    explanation: string
  }>
}
```

### GET `/api/analytics?userId=&subjectId=`
```typescript
// Response:
{
  totalStudyTime: number,
  totalSessions: number,
  averageQuizScore: number,
  documentCount: number,
  recentScores: Array<{ date: string, score: number }>,
  subjectBreakdown: Array<{ name: string, time: number, score: number }>
}
```

---

## Lógica RAG — Detalles de Implementación

### Extracción por tipo de archivo (`lib/rag/extractor.ts`)

```typescript
// PDF       → pdf-parse
// DOCX      → mammoth
// PPTX      → pptx2json o officegen
// TXT       → fs.readFileSync directo
// Imagen    → Gemini Vision (describe el contenido)
```

### Chunking (`lib/rag/chunker.ts`)

```typescript
// Estrategia: Chunks de ~800 caracteres con overlap de ~100
// Conservar párrafos completos cuando sea posible
// Cada chunk guarda: content, chunk_index, document_id, subject_id
```

### Recuperación (`lib/rag/retriever.ts`)

```typescript
// Estrategia actual: Long Context RAG
// - Traer TODOS los chunks de la materia activa
// - Enviar como contexto completo a Gemini 2.5 Flash
// - Gemini resuelve la relevancia con su ventana de contexto extendida
// Futuro: embeddings + similitud vectorial (pgvector en Supabase)
```

---

## System Prompts (Centralizado en `lib/gemini/prompts.ts`)

### Prompt Base del Tutor

```typescript
export const TUTOR_SYSTEM_PROMPT = `
Eres AcademIA, un tutor académico especializado y estricto.

REGLAS ABSOLUTAS:
1. Responde ÚNICA Y EXCLUSIVAMENTE con información que aparezca en el CONTEXTO proporcionado.
2. Si la respuesta no está en el contexto, di: "Esta información no se encuentra en el material que has cargado."
3. NUNCA inventes datos, fechas, nombres o conceptos que no estén en el contexto.
4. Cita o referencia el fragmento relevante del material cuando sea posible.
5. Adapta la complejidad de la explicación al nivel universitario.

CONTEXTO DEL MATERIAL DEL ESTUDIANTE:
{context}

TÉCNICA DE ESTUDIO ACTIVA: {studyTechnique}
`;

export const STUDY_TECHNIQUES: Record<string, string> = {
  socratic: "Responde con preguntas guía que lleven al estudiante a descubrir la respuesta por sí mismo.",
  feynman: "Explica el concepto como si se lo contaras a alguien sin conocimientos previos, usando analogías simples.",
  breakdown: "Descompón el problema o concepto en partes más pequeñas y ve explicando cada una.",
  spaced: "Conecta el concepto actual con preguntas de repaso de temas anteriores para reforzar la memoria."
};
```

### Prompt de Generación de Cuestionario

```typescript
export const QUIZ_GENERATION_PROMPT = `
Basándote EXCLUSIVAMENTE en el siguiente material de estudio, genera {count} preguntas de opción múltiple.

MATERIAL:
{context}

Devuelve un JSON válido con este formato exacto:
{
  "questions": [
    {
      "question": "¿Pregunta aquí?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct": 0,
      "explanation": "Explicación de por qué es correcta, citando el material."
    }
  ]
}

REGLAS:
- Solo usa información presente en el material
- Varía entre conceptos, definiciones y aplicaciones
- Dificultad progresiva: 40% fácil, 40% medio, 20% difícil
`;
```

---

## Paleta de Colores Oficial

AcademIA utiliza estos cinco colores como sistema de diseño. **Úsalos siempre desde los tokens definidos, nunca hardcodeados.**

| Token Tailwind | Hex | Nombre | Uso |
|---|---|---|---|
| `brand-taupe` | `#5B4B49` | Taupe Grey | Texto principal, headers, íconos |
| `brand-pink` | `#DB93B0` | Pink Mist | Acentos, botones secundarios, badges |
| `brand-blush` | `#F7BFB4` | Powder Blush | Fondos de tarjetas, secciones hero |
| `brand-steel` | `#77A0A9` | Cool Steel | Bordes, estados neutros, sidebar |
| `brand-teal` | `#16697A` | Stormy Teal | **Primario de marca** — navbar, CTAs |

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          taupe:  '#5B4B49',
          pink:   '#DB93B0',
          blush:  '#F7BFB4',
          steel:  '#77A0A9',
          teal:   '#16697A',
        }
      }
    }
  },
  plugins: [],
}
export default config
```

### `app/globals.css`

```css
:root {
  --color-taupe:  #5B4B49;
  --color-pink:   #DB93B0;
  --color-blush:  #F7BFB4;
  --color-steel:  #77A0A9;
  --color-teal:   #16697A;
}
```

### Reglas de uso para Claude Code

- **Navbar / topbar:** `bg-brand-teal text-white`
- **Botón primario:** `bg-brand-teal hover:bg-[#0e4f5c] text-white`
- **Botón secundario:** `bg-brand-pink hover:bg-[#c97d9a] text-brand-taupe`
- **Texto base:** `text-brand-taupe` (no usar `text-gray-900` ni `text-black`)
- **Fondos de cards:** `bg-white border border-brand-steel`
- **Fondos de sección suave:** `bg-brand-blush/30` (30% opacidad)
- **Badges / etiquetas:** `bg-brand-pink/20 text-brand-taupe`
- **Links activos:** `text-brand-teal underline`
- **Sidebar:** `bg-brand-steel text-white` o `bg-brand-teal text-white`

---

## Patrones de Código — Convenciones

### Cliente Supabase en Componentes
```typescript
// app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('created_at', { ascending: false })
  // ...
}
```

### Llamada al Chat (streaming)
```typescript
// components/chat/ChatWindow.tsx
const handleSend = async (message: string) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, subjectId, sessionId, geminiApiKey })
  })
  const reader = response.body?.getReader()
  // Leer stream e ir actualizando el mensaje en tiempo real
}
```

### Upload de archivos
```typescript
// components/documents/FileUploader.tsx
const handleUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('subjectId', subjectId)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const { chunksCreated } = await res.json()
  toast.success(`Documento procesado: ${chunksCreated} fragmentos creados`)
}
```

---

## Tipos TypeScript (`types/index.ts`)

```typescript
export interface Profile {
  id: string
  email: string
  gemini_api_key_encrypted?: string
  created_at: string
}

export interface Subject {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  created_at: string
}

export interface Document {
  id: string
  subject_id: string
  name: string
  file_type: 'pdf' | 'docx' | 'pptx' | 'txt' | 'image'
  storage_path: string
  size_bytes?: number
  created_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface StudyMetric {
  subject_id: string
  study_time_minutes: number
  quiz_score?: number
  date: string
}
```

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build de producción
npm run build

# Linting
npm run lint

# Instalar dependencias clave
npm install @supabase/supabase-js @supabase/ssr
npm install @google/generative-ai
npm install pdf-parse mammoth
npm install @radix-ui/react-dialog lucide-react
npm install recharts
npm install react-dropzone
npm install sonner   # toasts
```

---

## Instrucciones para Claude Code

Cuando trabajes en este proyecto, ten en cuenta:

1. **Seguridad primero:** Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente. Úsalo solo en API Routes del servidor.

2. **API Key de Gemini:** Siempre viene del cliente (el usuario la ingresa). Nunca la loguees ni la persistas en texto plano. Se cifra antes de guardar en Supabase.

3. **RLS siempre activo:** Antes de crear cualquier nueva tabla, agrega la política RLS correspondiente. El patrón es `auth.uid() = user_id`.

4. **Streaming de respuestas:** El endpoint `/api/chat` debe devolver un `ReadableStream` para que el frontend pueda mostrar las respuestas de Gemini token a token.

5. **Manejo de errores de Gemini:** Si la API Key es inválida o se agotaron los tokens gratuitos, devolver un error claro al usuario con instrucciones para revisar su key o actualizar a DeepSeek como fallback.

6. **Chunking conservador:** Los chunks deben ser de ~800 chars con overlap. No cortar en medio de oraciones. Priorizar párrafos completos.

7. **Long Context RAG:** En lugar de búsqueda vectorial compleja, se envían todos los chunks de la materia activa al contexto de Gemini. Gemini 2.5 Flash tiene 1M token de ventana de contexto. Esto simplifica la implementación y es la estrategia elegida por el equipo.

8. **Sistema de técnicas:** El parámetro `studyTechnique` modifica cómo el tutor formula sus respuestas. Si no se especifica, usa un estilo explicativo neutral.

9. **Dashboard:** Los datos deben calcularse en el servidor (`/api/analytics`) y devolverse pre-procesados. Usar Recharts para las visualizaciones en el cliente.

10. **Responsividad:** Usar clases Tailwind con breakpoints `sm:`, `md:`, `lg:`. El chatbot y el dashboard deben ser completamente usables en movil.

11. **Landing Page (`/`):** Es una ruta publica (sin middleware de auth). Debe incluir: Navbar con botones `Iniciar sesion` y `Crear cuenta`, seccion Hero con headline y CTAs hacia `/login` y `/register`, seccion de 3 pasos visuales (subir material, chatear, medir progreso), grid de 4 caracteristicas, seccion del dato estadistico del 80%, y footer con creditos PUCMM. Usar `bg-brand-teal` para el navbar y `bg-brand-blush/30` para secciones alternas.

---

## Estado Actual del Proyecto

```
✅ Completado (Pre-Proyecto):
  - Esquema de base de datos en Supabase
  - Sistema de autenticación
  - Upload y almacenamiento de documentos
  - Extracción de texto y chunking
  - Integración básica con Gemini API
  - Capítulos I-IV del Informe Final

🔄 En Proceso:
  - Pruebas de integración backend
  - Pruebas con asesora (23 de marzo)
  - Preparación para presentación al comité (06 de abril)

⏳ Pendiente (Proyecto Final - desde 06 abril 2026):
  - Frontend completo (Angely)
  - Dashboard de métricas con gráficos
  - Generación de cuestionarios
  - Pruebas piloto con usuarios (≥5 estudiantes PUCMM)
  - Deploy en Vercel + dominio
  - Capítulos V-VII del Informe Final
```
