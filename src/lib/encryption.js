import crypto from 'crypto';

// Usamos un secreto del entorno o un fallback (solo para desarrollo)
// En producción, asegúrate de tener ENCRYPTION_KEY en .env.local de 32 bytes exactos
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 32).padEnd(32, '0');
const ALGORITHM = 'aes-256-cbc';

export function encryptApiKey(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptApiKey(text) {
  if (!text) return null;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function getUserGeminiKey(supabase, userId) {
  const { data } = await supabase.from('profiles').select('gemini_api_key_encrypted').eq('id', userId).single();
  if (data && data.gemini_api_key_encrypted) {
    try {
      return decryptApiKey(data.gemini_api_key_encrypted);
    } catch (e) {
      console.error("Error decrypting key", e);
      return null;
    }
  }
  return null;
}
