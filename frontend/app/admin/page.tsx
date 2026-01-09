import AdminShell from "./AdminShell";

export default function AdminHome() {
  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold mb-4">
        Dashboard Ratecard
      </h1>
      <p>
        Bienvenue dans l’espace admin. Choisissez une section dans le menu.
      </p>
    </AdminShell>
  );
}
