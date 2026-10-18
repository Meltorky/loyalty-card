import { notFound } from "next/navigation";
import { cafes, getCafe } from "../../../cafes";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.entries(cafes)
    .filter(([, c]) => c.Admin)
    .map(([cafe]) => ({ cafe }));
}

export async function generateMetadata({ params }) {
  const { cafe } = await params;
  const entry = getCafe(cafe);
  if (!entry) return {};
  return {
    title: `${entry.config.name} – Staff`,
    robots: { index: false, follow: false }, // keep the cashier page out of Google
  };
}

export async function generateViewport({ params }) {
  const { cafe } = await params;
  return { themeColor: getCafe(cafe)?.config.themeColor };
}

export default async function AdminPage({ params }) {
  const { cafe } = await params;
  const entry = getCafe(cafe);
  if (!entry?.Admin) notFound();

  const { Admin } = entry;
  return <Admin />;
}
