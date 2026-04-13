const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ratecard-backend-prod.onrender.com/api";

// 🔥 toujours sans slash final
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

async function request(method: string, path: string, body?: any) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${BASE_URL}${cleanPath}`;

  console.log("API CALL →", method, url);

  // 🔥 récupération du token (client only)
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // 🔥 JWT
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  let json: any = null;

  try {
    json = await res.json();
  } catch (e) {
    throw new Error(`Réponse non JSON du backend (${res.status})`);
  }

  // =====================================================
  // 🔥 GESTION ERREURS + SESSION
  // =====================================================

  if (!res.ok) {
    console.error("❌ API error:", json);

    // 🔥 logout automatique si token invalide
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("role");

        window.location.href = "/login";
      }
    }

    throw new Error(json?.detail || json?.message || "Erreur API");
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
