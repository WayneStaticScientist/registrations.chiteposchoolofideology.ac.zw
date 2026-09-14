import "@/styles/globals.css";
import clsx from "clsx";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Sidebar } from "@/components/admin/Sidebar";
export const metadata: Metadata = {
  title: {
    default: "Chitepo School Of Ideology",
    template: `%s - Chitepo School Of Ideology`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
              {/* Simple Top Header */}
              <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-40 text-zinc-900">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-zinc-800">Registrations Portal</h2>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    Admin View
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                     <span className="text-sm font-bold text-zinc-500">AD</span>
                  </div>
                </div>
              </header>

              {/* Content Area */}
              <div className="flex-1 p-8 overflow-auto text-zinc-900">
                <div className="max-w-7xl mx-auto w-full">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
