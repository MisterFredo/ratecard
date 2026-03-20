// frontend-curator/lib/api.ts

/**
 * =========================================================
 * CONFIG
 * =========================================================
 * ⚠️ L’URL backend DOIT être définie via env
 * (Render Dev / Prod)
 */
const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!RAW_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

/**
 * Normalisation :
 * - supprime les slashs finaux
 */
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

/**
 * =========================================================
 * CORE REQUEST
 * =========================================================
 */
async function request(method: string, path: string, body?: any) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const url = `${BASE_URL}/api${cleanPath}`;

  // 🔍 DEBUG (tu peux retirer après validation)
  console.log("API CALL →", method, url);

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store", // important pour admin / data fraîche
  });

  let json: any = null;

  try {
    json = await res.json();
  } catch (e) {
    throw new Error(`Réponse non JSON du backend (${res.status})`);
  }

  if (!res.ok) {
    console.error("❌ API error:", json);
    throw new Error(
      json?.detail || json?.message || "Erreur API"
    );
  }

  return json;
}

/**
 * =========================================================
 * API WRAPPER
 * =========================================================
 */
export const api = {
  get: (path: string) => request("GET", path),
  post: (path: string, body: any) => request("POST", path, body),
  put: (path: string, body: any) => request("PUT", path, body),
  delete: (path: string) => request("DELETE", path),
};
