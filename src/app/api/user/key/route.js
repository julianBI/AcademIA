import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptApiKey, decryptApiKey } from "@/lib/encryption";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("gemini_api_key_encrypted")
      .eq("id", user.id)
      .single();

    const hasKey = !!(profile && profile.gemini_api_key_encrypted);
    
    return NextResponse.json({ hasKey });
  } catch (error) {
    return NextResponse.json({ error: "Error comprobando API Key" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "No se proporcionó API Key" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Cifrar la clave antes de guardarla
    const encryptedKey = encryptApiKey(apiKey);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ gemini_api_key_encrypted: encryptedKey })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
      return NextResponse.json({ error: "Error guardando la API Key en la BD" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
