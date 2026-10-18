import "./globals.css";

// Neutral shell shared by every cafe. Fonts, colors and design live inside each cafe's folder.
export const metadata = {
  title: "Loyalty Cards",
  description: "Your cafe loyalty cards, always in your pocket.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}