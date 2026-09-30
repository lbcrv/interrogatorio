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

export const metadata: Metadata = {
  title: "Interrogatorio",
  description: "La corona de Santa Rita. Three suspects, 24 questions, one crown.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${serif.variable} ${mono.variable} ${hand.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
