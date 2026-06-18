import { supabase } from "@/integrations/supabase/client";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function buildApiUrl(path) {
  if (!path.startsWith("/")) {
    throw new Error(`buildApiUrl expects a relative path starting with '/': ${path}`);
  }
  return `${API_URL}${path}`;
}

/**
 * Make an authenticated API call with JWT token
 */
export async function authenticatedFetch(urlOrPath, options = {}) {
  const url = typeof urlOrPath === "string" && urlOrPath.startsWith("/")
    ? buildApiUrl(urlOrPath)
    : urlOrPath;

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("User not authenticated");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${session.access_token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  return response.json();
}
