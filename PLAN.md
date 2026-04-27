# Plan de Ejecución: AcademIA - Tutoría Inteligente con RAG

Este documento detalla la hoja de ruta para el desarrollo de la plataforma AcademIA.

---

## 📍 Fase 1: Infraestructura y Base de Datos (COMPLETADO ✅)
- [x] Configuración de proyecto Next.js 15.
- [x] Integración de Supabase (Auth, DB, Storage).
- [x] Implementación de extensión `pgvector` para búsqueda semántica.
- [x] Creación del esquema maestro de base de datos (`supabase-master-schema.sql`).
- [x] Configuración de políticas de seguridad (RLS).

## 📍 Fase 2: Autenticación y Dashboard (COMPLETADO ✅)
- [x] Pantallas de Login y Registro con validaciones.
- [x] Dashboard de materias con vista de cuadrícula.
- [x] Sistema de Logout global.
- [x] Gestión de API Keys de Gemini por usuario con cifrado AES-256 (Persistencia en DB).

## 📍 Fase 3: Pipeline de RAG y Procesamiento (COMPLETADO ✅)
- [x] Extractor de texto para PDF, DOCX y TXT.
- [x] Lógica de Chunking (fragmentación semántica de 800 chars).
- [x] Generación de Embeddings usando `gemini-embedding-2`.
- [x] Almacenamiento vectorial en Supabase.
- [x] Función RPC `match_document_chunks` para búsqueda de similitud.

## 📍 Fase 4: Chatbot y Tutoría Socrática (COMPLETADO ✅)
- [x] Interfaz de chat profesional con burbujas de mensaje.
- [x] Orquestador RAG en el backend (Búsqueda → Contexto → Gemini).
- [x] Streaming de respuesta con Gemini 2.5 Flash.
- [x] Prompts de tutoría socrática (técnicas Feynman, Active Recall).

## 📍 Fase 5: Evaluación y Cuestionarios (COMPLETADO ✅)
- [x] Generador de cuestionarios JSON basado en contexto.
- [x] Interfaz de preguntas con feedback inmediato y explicaciones.
- [x] Pantalla de resultados con score y métricas.

## 📍 Fase 6: Documentación y Despliegue (COMPLETADO ✅)
- [x] Creación de `LogicaDB.md` (arquitectura técnica).
- [x] Creación de `README.md` profesional.
- [x] Actualización de `CLAUDE.md`.
- [x] Despliegue a GitHub (`https://github.com/julianBI/AcademIA.git`).

---

## 🔜 Próximos Pasos (Opcionales / Futuros)
1. **Soporte Multimedia**: Extracción de texto desde imágenes (OCR) usando Gemini Vision.
2. **Historial de Chat**: Persistencia de sesiones de chat en la base de datos (actualmente es volátil por sesión).
3. **Métricas Reales**: Poblar `study_metrics` con eventos reales de uso.
4. **Optimización de Chunks**: Ajustar el solapamiento (*overlap*) para mejorar la calidad del RAG.
