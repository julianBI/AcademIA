-- =====================================================================
-- FIX RAG: Limpiar chunks con embeddings incorrectos y resetear el índice.
-- El código ahora usa outputDimensionality: 768 en gemini-embedding-2
-- por lo que el esquema vector(768) es correcto.
-- Ejecutar en el SQL Editor de Supabase.
-- =====================================================================

-- 1. Borrar el índice existente para recrearlo limpio
DROP INDEX IF EXISTS document_chunks_embedding_idx;

-- 2. Borrar TODOS los chunks almacenados (tenían dimensiones incorrectas)
TRUNCATE TABLE document_chunks;

-- 3. Asegurar que la columna sea vector(768)
ALTER TABLE document_chunks 
  ALTER COLUMN embedding TYPE vector(768);

-- 4. Recrear el índice HNSW (768 está dentro del límite de 2000)
CREATE INDEX document_chunks_embedding_idx
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops);

-- 5. Actualizar la función RPC de búsqueda
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_subject_id UUID
)
RETURNS TABLE (id UUID, document_id UUID, content TEXT, similarity float)
LANGUAGE plpgsql SECURITY DEFINER
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

-- Verificar dimensión final (debe mostrar vector(768))
SELECT column_name, udt_name
FROM information_schema.columns
WHERE table_name = 'document_chunks' AND column_name = 'embedding';
