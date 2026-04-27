export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/debug/rag?subjectId=xxx
 * Returns diagnostics about what's stored in the DB for a given subject.
 * DEVELOPMENT ONLY — remove before production deployment.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 1. Count chunks for this subject
  const { count: chunkCount } = await supabase
    .from("document_chunks")
    .select("*", { count: "exact", head: true })
    .eq("subject_id", subjectId || "")
    .eq("user_id", user.id);

  // 2. Count chunks globally for this user
  const { count: totalChunks } = await supabase
    .from("document_chunks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 3. Count documents
  const { count: docCount } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("subject_id", subjectId || "")
    .eq("user_id", user.id);

  // 4. Get a sample chunk to verify embedding dimension
  const { data: sampleChunk } = await supabase
    .from("document_chunks")
    .select("id, content, embedding")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const embeddingDims = sampleChunk?.embedding
    ? (Array.isArray(sampleChunk.embedding) ? sampleChunk.embedding.length : "not-array")
    : null;

  return NextResponse.json({
    userId: user.id,
    subjectId,
    chunksForSubject: chunkCount,
    totalChunksForUser: totalChunks,
    documentsForSubject: docCount,
    sampleChunk: sampleChunk
      ? {
          id: sampleChunk.id,
          contentPreview: sampleChunk.content?.substring(0, 100),
          embeddingDimensions: embeddingDims,
        }
      : null,
  });
}
