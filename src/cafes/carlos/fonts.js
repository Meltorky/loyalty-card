import { Playfair_Display, Nunito_Sans, Cairo } from "next/font/google";

// Playfair Display = elegant but very readable headings / names
export const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--carlos-display",
  display: "swap",
});

// Nunito Sans = clean, warm and easy to read on phones
export const body = Nunito_Sans({
  subsets: ["latin"],
  variable: "--carlos-body",
  display: "swap",
});

// Arabic fallback so Arabic names look good too (only downloaded when Arabic text is shown)
export const arabic = Cairo({
  subsets: ["arabic"],
  variable: "--carlos-arabic",
  display: "swap",
});

export const fontVars = `${display.variable} ${body.variable} ${arabic.variable}`;