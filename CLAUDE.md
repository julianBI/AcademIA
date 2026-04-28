# CLAUDE.md — AcademIA
> Contexto de proyecto para Claude Code / Agentes de IA
> Última actualización: 28 de Abril 2026 (Resiliencia y Analíticas)

---

## ¿Qué es este proyecto?

**AcademIA** es una WebApp de tutoría virtual inteligente para estudiantes universitarios. Permite a los estudiantes subir sus materiales de estudio (PDFs, Word, TXT) e interactuar con un chatbot contextualizado que responde **exclusivamente** basándose en esos documentos usando una arquitectura RAG híbrida con **Gemini Flash/Pro** y búsqueda vectorial en Supabase.

---

## Stack Técnico (Actualizado)

```
Frontend:  Next.js 16 (App Router) + React 19 + Tailwind CSS v4
Backend:   Next.js API Routes (Node.js runtime)
Base de datos: Supabase (PostgreSQL + Auth + Storage + pgvector)
IA:        Google Gemini 1.5/2.0 Flash (Fallback automático a Pro)
Seguridad: Cifrado AES-256 para API Keys de usuario
RAG:       Híbrido (Long Context + Búsqueda Vectorial HNSW 768d)
Visualización: Recharts para Analíticas de Estudio
```

---

## Estructura de Carpetas (Actualizada)

```
academIA/
├── src/
│   ├── app/
│   │   ├── (auth)/                        # login/ y register/
│   │   ├── (app)/
│   │   │   ├── dashboard/page.js          # Vista general
│   │   │   ├── analytics/page.js          # Estadísticas (Recharts)
│   │   │   └── subjects/
│   │   │       ├── page.js                # Lista de materias
│   │   │       └── [id]/
│   │   │           ├── page.js            # Gestión de documentos
│   │   │           ├── chat/page.js       # Chatbot RAG
│   │   │           └── quiz/page.js       # Evaluación dinámica
│   │   ├── api/
│   │   │   ├── upload/route.js            # Ingesta (Embeddings 768d)
│   │   │   ├── chat/route.js              # Streaming RAG
│   │   │   ├── quiz/route.js              # Quizzes con Fallback
│   │   │   └── analytics/route.js         # Métricas de uso
│   ├── components/
│   │   ├── chat/ (ChatWindow, MessageBubble, ApiKeyModal)
│   │   ├── documents/ (FileUploader, DeleteConfirmModal)
│   │   ├── layout/ (Sidebar, Navbar)
│   │   └── ui/ (Cards, Buttons, Charts)
│   ├── lib/
│   │   ├── gemini/ (client, prompts)      # Lógica de Fallback
│   │   ├── supabase/ (client, server)
│   │   └── encryption.js                  # Cifrado AES
```

---

## Variables de Entorno (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ENCRYPTION_KEY=tu_clave_de_32_bytes
```

---

## Guía de Desarrollo (Fallback & RAG)

1. **Robustez**: Todas las llamadas a Gemini deben usar `generateContentWithFallback` o `generateChatResponse` de `lib/gemini/client.js` para manejar errores de cuota 429.
2. **Priorización**: Los modelos Flash se intentan primero debido a sus límites gratuitos superiores.
3. **Ingesta**: Los documentos se dividen en chunks de ~800 caracteres y se generan embeddings de 768 dimensiones (reducidos desde 3072).
4. **Seguridad**: Nunca hardcodear API Keys. Usar siempre el sistema de cifrado para las llaves de los usuarios.
