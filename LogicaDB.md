# Lógica de la Base de Datos y Flujo RAG (AcademIA)

Este documento detalla la estructura relacional de la base de datos alojada en Supabase y explica cómo interactúan las tablas para hacer posible la Inteligencia Artificial (RAG - Retrieval-Augmented Generation).

---

## 🏗️ Estructura de Tablas y Relaciones

La base de datos está diseñada con un enfoque centrado en el **Usuario** y la **Materia**. Todas las tablas principales tienen habilitado `Row Level Security (RLS)` para asegurar que cada estudiante solo tenga acceso a sus propios datos.

### 1. `profiles`
*   **Qué almacena:** Información extendida del usuario.
*   **Campos clave:** `id`, `email`, `gemini_api_key_encrypted`.
*   **Relaciones:** 
    *   **1:1** con `auth.users` (La tabla interna de Supabase que maneja contraseñas). El perfil se crea automáticamente mediante un *Trigger* cuando alguien se registra.
    *   Relación de "Padre" (1:N) con todas las demás tablas del sistema (Materias, Documentos, etc.).

### 2. `subjects` (Materias)
*   **Qué almacena:** Las asignaturas que el estudiante decide crear para organizar su estudio (ej. "Estructura de Datos").
*   **Relaciones:** 
    *   **N:1** con `profiles` (Un usuario tiene muchas materias).

### 3. `documents` (Documentos)
*   **Qué almacena:** La metadata (nombre, peso, extensión) de los PDFs, DOCX o TXT que el usuario sube a una materia.
*   **Relaciones:**
    *   **N:1** con `subjects` (Una materia tiene muchos documentos).
    *   **N:1** con `profiles` (Saber de quién es el documento).

### 4. `document_chunks` (Fragmentos / El corazón del RAG)
*   **Qué almacena:** El texto puro de los documentos extraído y cortado en pequeños trozos (~800 caracteres). Además, almacena el **Vector** (un arreglo de 768 números) generado por la IA de Google para representar el significado matemático de ese texto.
*   **Relaciones:**
    *   **N:1** con `documents` (De qué archivo salió este trozo de texto).
    *   **N:1** con `subjects` (A qué materia pertenece para poder buscar rápido).

### 5. `chat_sessions` y `chat_messages`
*   **Qué almacenan:** El historial de conversaciones con el Tutor IA. La "sesión" agrupa la charla, y los "mensajes" guardan el diálogo exacto (rol `user` o `assistant`).
*   **Relaciones:** 
    *   Una sesión pertenece a una `subject`.
    *   Un mensaje (**N:1**) pertenece a una `chat_session`.

### 6. `quizzes` (Cuestionarios)
*   **Qué almacena:** Las preguntas autogeneradas por la IA en formato JSON, junto con la puntuación final (`score`) que sacó el usuario al resolverlo.
*   **Relaciones:** Pertenece a una `subject` y a un `profile`.

### 7. `study_metrics` (Métricas)
*   **Qué almacena:** Datos estadísticos por día y materia (tiempo de estudio, cantidad de mensajes enviados, etc.) para poblar el Dashboard de progreso.
*   **Relaciones:** Pertenece a una `subject` y a un `profile`.

---

## ⚙️ Flow Process (Caso de Uso: Preguntarle a la IA)

Para entender cómo funciona el **RAG** (Generación Aumentada por Recuperación), simulemos el viaje de un documento desde que se sube hasta que la IA lo usa para responder una pregunta.

### Fase 1: Ingesta del Conocimiento (Upload)
1. **El estudiante sube "Fisica_Cuantica.pdf" a la materia "Física".**
2. El servidor extrae todo el texto del PDF (ej. 10 páginas de texto plano).
3. El servidor usa el **Chunker** y divide ese texto gigante en 50 trozos más pequeños (chunks).
4. El servidor le envía esos 50 trozos al modelo *Gemini Embedding 2*.
5. La IA devuelve 50 vectores matemáticos (uno por cada trozo).
6. Se guarda **1 fila en `documents`** y **50 filas en `document_chunks`** en Supabase.

### Fase 2: Recuperación y Respuesta (Chat RAG)
1. **El estudiante entra al Chat y escribe:** *"¿Qué es el entrelazamiento cuántico?"*
2. El servidor toma esa pregunta y la envía a *Gemini Embedding 2*, que la convierte en su propio **Vector Pregunta**.
3. El servidor le dice a Supabase: *"Oye, ejecuta la función `match_document_chunks` usando este Vector Pregunta y búscame los 5 chunks de esta Materia que matemáticamente se parezcan más"*.
4. Supabase usa la extensión `pgvector` y encuentra en milisegundos los 5 párrafos del "Fisica_Cuantica.pdf" que hablan de entrelazamiento.
5. El servidor agarra esos 5 párrafos y arma un **Super Prompt (Contexto)** oculto:
   > *"Eres un tutor. Usa estrictamente esta información para responder: [Párrafo 1] [Párrafo 2]... El estudiante pregunta: ¿Qué es el entrelazamiento cuántico?"*
6. Se envía ese Super Prompt a **Gemini 2.5 Flash**.
7. La IA lee el contexto, redacta la respuesta perfecta basada solo en los apuntes del alumno, y la transmite de regreso a la pantalla en tiempo real.
