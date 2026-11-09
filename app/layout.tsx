import "#styles/globals.css";
import type { Metadata, Viewport } from "next";

import { siteConfig } from "#config/site.ts";
import { fontSans } from "#lib/fonts.ts";
import { cn } from "#lib/utils.ts";
import { ToastProvider } from "#components/ui/toaster.tsx";
import { LoadingProvider } from "#components/loading-provider.tsx";
import { SiteFooter } from "#components/site-footer.tsx";
import { SiteHeader } from "#components/site-header.tsx";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `try{const t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch{}`,
            }}
          />
        </head>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
          )}
        >
          <LoadingProvider>
            <ToastProvider>
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </div>
            </ToastProvider>
          </LoadingProvider>
        </body>
      </html>
    </>
  );
}
