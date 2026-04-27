# CLAUDE.md — AcademIA
> Contexto de proyecto para Claude Code / Agentes de IA
> Última actualización: 27 de Abril 2026 (Core RAG completado)

---

## ¿Qué es este proyecto?

**AcademIA** es una WebApp de tutoría virtual inteligente para estudiantes universitarios. Permite a los estudiantes subir sus materiales de estudio (PDFs, Word, TXT) e interactuar con un chatbot contextualizado que responde **exclusivamente** basándose en esos documentos usando una arquitectura RAG con **Gemini 2.5 Flash** y búsqueda vectorial en Supabase.

---

## Stack Técnico (Actualizado)

```
Frontend:  Next.js 15 (App Router) + React + Tailwind CSS v4
Backend:   Next.js API Routes (server-side)
Base de datos: Supabase (PostgreSQL + Auth + Storage + pgvector)
IA:        Google Gemini 2.5 Flash (Generación) + Gemini Embedding 2 (Vectores)
Seguridad: Cifrado AES-256 para API Keys de usuario en la base de datos
```

---

## Estructura de Carpetas (Actual)

```
academIA/
├── src/
│   ├── app/
│   │   ├── page.js                        # Landing Page (pública)
│   │   ├── (auth)/                        # login/ y register/
│   │   ├── (app)/
│   │   │   ├── dashboard/page.js          # Dashboard de materias
│   │   │   └── subjects/
│   │   │       └── [id]/
│   │   │           ├── page.js            # Detalle de materia
│   │   │           ├── chat/page.js       # Chatbot RAG Socrático
│   │   │           └── quiz/page.js       # Evaluación dinámica
│   │   ├── api/
│   │   │   ├── upload/route.js            # Extracción + Embeddings
│   │   │   ├── chat/route.js              # Streaming RAG
│   │   │   ├── quiz/route.js              # Generación JSON Quiz
│   │   │   └── user/key/route.js          # Gestión segura de API Keys
│   │   ├── layout.js
│   │   └── globals.css
│   ├── components/
│   │   ├── chat/ (ChatWindow, ApiKeyModal, MessageBubble)
│   │   ├── documents/ (FileUploader)
│   │   ├── quiz/ (QuizQuestion, QuizResults)
│   │   └── auth/ (LogoutButton)
│   ├── lib/
│   │   ├── supabase/ (client, server)
│   │   ├── gemini/ (client, prompts)
│   │   ├── rag/ (chunker, extractor)
│   │   └── encryption.js                  # Lógica de cifrado AES
├── supabase-master-schema.sql             # Esquema completo DB
├── LogicaDB.md                            # Documentación técnica DB
└── README.md                              # Guía profesional
```

---

## Variables de Entorno (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza... (Opcional, se prioriza la del usuario en DB)
```

---

## Guía de Desarrollo RAG

1. **Ingesta**: El texto se extrae en `extractor.js`, se divide en `chunker.js` y se guarda con embeddings en `upload/route.js`.
2. **Recuperación**: El chat usa la función RPC `match_document_chunks` de Supabase para buscar contexto.
3. **Generación**: Se envía el contexto y la pregunta a Gemini 2.5 Flash en `chat/route.js`.
4. **Seguridad**: Siempre usar `getUserGeminiKey()` en el backend para recuperar la clave cifrada del usuario.
