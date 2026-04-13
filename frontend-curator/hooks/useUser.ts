export function useUser() {
  function parseToken(token: string) {
    try {
      const base64Payload = token.split(".")[1];
      return JSON.parse(atob(base64Payload));
    } catch {
      return null;
    }
  }

  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");

  if (!token) return null;

  const payload = parseToken(token);

  if (!payload) return null;

  return {
    email: payload.email,
    role: payload.role,
    user_id: payload.user_id,
  };
}
