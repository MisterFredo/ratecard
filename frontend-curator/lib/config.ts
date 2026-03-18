export function apiUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  return `${base}${path}`;
}
