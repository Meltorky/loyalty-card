import Link from "next/link";
import { cafes } from "../cafes";

// "/" – simple list of the cafes that exist
export default function Home() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", color: "#3a281c", padding: 24 }}>
      <div style={{ textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: "1.4rem" }}>Choose your cafe</h1>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {Object.entries(cafes).map(([slug, { config }]) => (
            <li key={slug}>
              <Link href={`/${slug}`} style={{ color: "#8c6212", fontSize: "1.1rem" }}>
                {config.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}