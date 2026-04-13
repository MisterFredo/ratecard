"use client";

type Props = {
  user: any;
  universes: any[];
  activeUniverse: string | null;
  setActiveUniverse: (v: string | null) => void;
};

export default function Header({
  user,
  universes,
  activeUniverse,
  setActiveUniverse,
}: Props) {
  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-white">

      <div className="font-semibold">Curator</div>

      <div className="flex items-center gap-4">

        {user && (
          <div className="text-sm text-right">
            <div>{user.email}</div>
            <div className="text-xs text-gray-400">{user.role}</div>
          </div>
        )}

        {universes.length > 0 && (
          <select
            value={activeUniverse || ""}
            onChange={(e) =>
              setActiveUniverse(e.target.value || null)
            }
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="">Tous</option>

            {universes.map((u) => (
              <option key={u.id_universe} value={u.id_universe}>
                {u.label}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleLogout}
          className="text-sm text-red-600"
        >
          Logout
        </button>

      </div>
    </div>
  );
}
