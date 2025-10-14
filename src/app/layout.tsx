// src/app/layout.tsx
import "../styles/globals.css";
import type { Metadata } from "next";
import InfoButton from "@/components/InfoButton";

export const metadata: Metadata = {
  title: "Weather • Next.js + SQL",
  description: "Real weather app with CRUD persistence (Prisma + SQL)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const devName = process.env.NEXT_PUBLIC_DEVELOPER_NAME || "Your Name";

  return (
    <html lang="en">
      {/* Gradient classes moved to the body to avoid @apply issues in CSS */}
      <body className="bg-gradient-to-br from-sky-200 via-indigo-100 to-emerald-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100 antialiased">
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight">🌤️ Weather</h1>
              <InfoButton />
            </div>
            <div className="flex items-center gap-3 text-sm opacity-80">
              <span>
                Built by <strong>{devName}</strong>
              </span>
              <span>•</span>
              <a
                href="https://open-meteo.com"
                className="hover:opacity-100 underline"
                target="_blank"
                rel="noreferrer"
              >
                Powered by Open-Meteo
              </a>
            </div>
          </header>

          {children}

          <footer className="text-sm opacity-70 py-6">
            Demo app • Next.js + Prisma (SQLite) • Leaflet map • Optional YouTube + exports
          </footer>
        </div>
      </body>
    </html>
  );
}
