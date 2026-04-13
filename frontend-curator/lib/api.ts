// frontend-curator/lib/api.ts

const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ratecard-backend-prod.onrender.com/api";

// 🔥 toujours sans slash final
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");

async function request(method: string, path: string, body?: any) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const url = `${BASE_URL}${cleanPath}`;

  console.log("API CALL →", method, url);

  // 🔥 NEW → récupération token
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // 🔥 KEY
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

  if (!res.ok) {
    console.error("❌ API error:", json);
    throw new Error(json?.detail || json?.message || "Erreur API");
  }

  return json;
}

export const api = {
  get: (path: string) => request("GET", path),
  post: (path: string, body: any) => request("POST", path, body),
  put: (path: string, body: any) => request("PUT", path, body),
  delete: (path: string) => request("DELETE", path),
};
