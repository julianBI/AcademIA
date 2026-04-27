-- =====================================================================
-- FIX CRÍTICO: Ajustar dimensión del vector al modelo gemini-embedding-2
-- gemini-embedding-2 produce vectores de 3072 dimensiones por defecto.
-- El schema anterior usaba 768, causando que los embeddings se DESCARTARAN.
-- Ejecutar en el SQL Editor de Supabase.
-- =====================================================================

-- 1. Borrar el índice anterior (incompatible con el cambio de tipo)
DROP INDEX IF EXISTS document_chunks_embedding_idx;

-- 2. Borrar todos los chunks existentes (tienen embeddings con dimensiones incorrectas)
TRUNCATE TABLE document_chunks;

-- 3. Alterar la columna al tamaño correcto para gemini-embedding-2
ALTER TABLE document_chunks 
  ALTER COLUMN embedding TYPE vector(3072);

-- 4. Recrear el índice con las dimensiones correctas
CREATE INDEX document_chunks_embedding_idx
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops);

-- 5. Actualizar la función RPC para que acepte el nuevo tamaño de vector
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(3072),
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
SECURITY DEFINER
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
    AND (match_threshold = 0.0 OR 1 - (dc.embedding <=> query_embedding) > match_threshold)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Verificación: debe mostrar 3072
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'document_chunks' AND column_name = 'embedding';
