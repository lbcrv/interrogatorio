import type { Metadata } from "next";
import { Covered_By_Your_Grace, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// The detective's marker notes in the margins. Short words only.
const hand = Covered_By_Your_Grace({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: "400",
});

const title = "Interrogatorio · La corona de Santa Rita";
const description = "Un juego de detectives: tres sospechosos, 24 preguntas y una corona que no aparece. En español y en inglés.";

export const metadata: Metadata = {
  // Share cards need absolute image URLs. SITE_URL overrides it for another domain.
  metadataBase: new URL(process.env.SITE_URL ?? "https://interrogatorio-five.vercel.app"),
  title,
  description,
  openGraph: { title, description, type: "website", locale: "es_HN", siteName: "Interrogatorio" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${serif.variable} ${mono.variable} ${hand.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
