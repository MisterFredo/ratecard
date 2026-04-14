import { useEffect, useState } from "react";

type User = {
  email: string;
  role: string;
  user_id: string;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function parseToken(token: string) {
    try {
      const base64Payload = token.split(".")[1];
      return JSON.parse(atob(base64Payload));
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const payload = parseToken(token);

    if (!payload) {
      setUser(null);
      setLoading(false);
      return;
    }

    // --------------------------------------------------
    // 🔥 CHECK EXPIRATION
    // --------------------------------------------------
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("role");

      setUser(null);
      setLoading(false);
      return;
    }

    setUser({
      email: payload.email,
      role: payload.role,
      user_id: payload.user_id,
    });

    setLoading(false);
  }, []);

  return { user, loading };
}
