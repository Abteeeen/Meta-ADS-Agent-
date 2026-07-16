import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;
let runtimeConfig: { url: string; key: string } | null = null;

export function configureSupabaseBrowserClient(url: string, key: string) {
  const normalizedUrl = url.trim();
  const normalizedKey = key.trim();
  if (!normalizedUrl || !normalizedKey) return;
  if (runtimeConfig?.url === normalizedUrl && runtimeConfig.key === normalizedKey) return;

  runtimeConfig = { url: normalizedUrl, key: normalizedKey };
  browserClient = createClient(normalizedUrl, normalizedKey);
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const url = runtimeConfig?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = runtimeConfig?.key ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  browserClient = url && key ? createClient(url, key) : null;
  return browserClient;
}
