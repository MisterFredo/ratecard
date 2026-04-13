export function useUser() {
  function parseToken(token: string) {
    try {
      const base64Payload = token.split(".")[1];
      return JSON.parse(atob(base64Payload));
    } catch {
      return null;
    }
  }

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) return null;

  const payload = parseToken(token);

  if (!payload) return null;

  return {
    email: payload.email,
    role: payload.role,
  };
}
