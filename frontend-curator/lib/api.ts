const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export const api = {
  async get(path: string) {
    const res = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return res.json();
  },
};
