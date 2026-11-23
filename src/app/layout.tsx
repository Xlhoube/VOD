import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CinePT — Onde Ver Filmes e Séries em Portugal",
  description:
    "Descubra em que plataformas de streaming oficiais estão disponíveis os seus filmes e séries favoritos em Portugal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-rose-500/30 selection:text-rose-200`}
      >
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-500">
            <div className="mx-auto max-w-7xl px-4">
              <p>
                CinePT © {new Date().getFullYear()} — Agregador de Streaming em
                Portugal. Dados fornecidos pela API do TMDB.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
