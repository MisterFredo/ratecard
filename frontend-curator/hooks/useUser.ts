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
      const decoded = JSON.parse(atob(base64Payload));
      return decoded;
    } catch {
      return null;
    }
  }

  function loadUser() {
    const token = localStorage.getItem("token");

    console.log("🔐 TOKEN:", token);

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const payload = parseToken(token);

    if (!payload) {
      console.warn("❌ TOKEN INVALID");
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      return;
    }

    // 🔐 expiration check
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.warn("🔒 TOKEN EXPIRED");
      localStorage.removeItem("token");
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
  }

  useEffect(() => {
    loadUser();

    // 🔥 FIX CRITIQUE : recheck quand tu reviens sur l’onglet
    window.addEventListener("focus", loadUser);

    return () => {
      window.removeEventListener("focus", loadUser);
    };
  }, []);

  return { user, loading };
}
