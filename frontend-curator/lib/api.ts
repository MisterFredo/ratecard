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

  console.log("🌐 API CALL →", method, url);

  // --------------------------------------------------
  // 🔐 TOKEN (client only)
  // --------------------------------------------------
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const authHeader =
    token && token !== "null" && token !== "undefined"
      ? { Authorization: `Bearer ${token}` }
      : {};

  if (token) {
    console.log("🔐 TOKEN PRESENT");
  } else {
    console.log("⚠️ NO TOKEN");
  }

  let res: Response;

  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
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
  } catch (e) {
    throw new Error(`Réponse non JSON du backend (${res.status})`);
  }

  // =====================================================
  // 🔥 GESTION ERREURS + SESSION
  // =====================================================

  if (!res.ok) {
    console.error("❌ API error:", json);

    // 🔥 LOGOUT SI TOKEN INVALID
    if (res.status === 401 && typeof window !== "undefined") {
      const isLoginPage = window.location.pathname.startsWith("/login");

      // évite boucle infinie
      if (!isLoginPage) {
        console.warn("🔒 SESSION EXPIRED → LOGOUT");

        localStorage.removeItem("token");

        const redirect = encodeURIComponent(
          window.location.pathname + window.location.search
        );

        window.location.href = `/login?redirect=${redirect}`;
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
