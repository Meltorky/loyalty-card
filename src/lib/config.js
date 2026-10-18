// Global API url – change it here (or via NEXT_PUBLIC_API_URL in .env.local)
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://demoyazan-production.up.railway.app/";

export const apiBase = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;
