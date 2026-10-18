import { notFound } from "next/navigation";
import { cafes, getCafe } from "../../cafes";

// Only cafes registered in /cafes/index.js exist; anything else is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(cafes).map((cafe) => ({ cafe }));
}

export async function generateMetadata({ params }) {
  const { cafe } = await params;
  const entry = getCafe(cafe);
  if (!entry) return {};
  return { title: entry.config.title, description: entry.config.description };
}

export async function generateViewport({ params }) {
  const { cafe } = await params;
  return { themeColor: getCafe(cafe)?.config.themeColor };
}

export default async function CafePage({ params }) {
  const { cafe } = await params;
  const entry = getCafe(cafe);
  if (!entry) notFound();

  const { Component } = entry;
  return <Component />;
}