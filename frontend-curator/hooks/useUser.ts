import { useEffect, useState } from "react";

type User = {
  user_id: string;
  role: string;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function loadUser() {
    const user_id = localStorage.getItem("user_id");
    const role = localStorage.getItem("role");

    console.log("👤 USER_ID:", user_id);

    if (!user_id) {
      setUser(null);
      setLoading(false);
      return;
    }

    setUser({
      user_id,
      role: role || "user",
    });

    setLoading(false);
  }

  useEffect(() => {
    loadUser();

    // 🔥 garde le refresh onglet (utile)
    window.addEventListener("focus", loadUser);

    return () => {
      window.removeEventListener("focus", loadUser);
    };
  }, []);

  return { user, loading };
}
