-- 1. Habilitar la extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Asegurar que las tablas base existen (profiles, subjects, documents)
-- (Asumo que ya las creaste basado en CLAUDE.md, pero si no, debes crearlas)

-- 3. Crear la tabla de chunks con la columna de embeddings (768 dimensiones para Gemini text-embedding-004)
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(768), -- Campo para los vectores de Gemini
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS en document_chunks
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own chunks"
  ON document_chunks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Crear índice para acelerar la búsqueda vectorial
CREATE INDEX ON document_chunks USING hnsw (embedding vector_ip_ops);

-- 6. Crear función RPC (Remote Procedure Call) para la búsqueda de similitud
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_subject_id UUID
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.subject_id = p_subject_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
