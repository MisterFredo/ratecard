const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ratecard.onrender.com/api";

export const api = {
  async get(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    return res.json();
  },

  async post(path: string, body: any) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async put(path: string, body: any) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async delete(path: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });
    return res.json();
  }
};
