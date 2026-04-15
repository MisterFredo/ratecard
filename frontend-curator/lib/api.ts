const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ratecard-backend-prod.onrender.com/api";

// 🔥 toujours sans slash final
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

// =====================================================
// CORE REQUEST
// =====================================================

async function request(method: string, path: string, body?: any) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${BASE_URL}${cleanPath}`;

  // --------------------------------------------------
  // 👤 USER ID (SOURCE UNIQUE)
  // --------------------------------------------------
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("user_id")
      : null;

  console.log("🌐 API CALL →", method, url);
  console.log("👤 USER_ID:", userId);

  let res: Response;

  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(userId ? { "x-user-id": userId } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (e) {
    console.error("❌ Network error:", e);
    throw new Error("Impossible de contacter le serveur");
  }

  let json: any = null;

  try {
    json = await res.json();
  } catch {
    throw new Error(`Réponse non JSON du backend (${res.status})`);
  }

  // =====================================================
  // 🔥 GESTION ERREURS (SAFE)
  // =====================================================

  if (!res.ok) {
    console.error("❌ API error:", json);

    if (res.status === 401) {
      console.warn("⚠️ 401 → user_id absent ou invalide");
      // ❌ on ne logout PAS
      // ❌ on ne supprime PAS le localStorage
    }

    throw new Error(
      json?.detail ||
      json?.message ||
      `Erreur API (${res.status})`
    );
  }

  return json;
}

// =====================================================
// EXPORT API
// =====================================================

export const api = {
  get: (path: string) => request("GET", path),
  post: (path: string, body: any) => request("POST", path, body),
  put: (path: string, body: any) => request("PUT", path, body),
  delete: (path: string) => request("DELETE", path),
};
