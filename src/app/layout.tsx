import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coursemap-eight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CourseMap — Coursebook Evaluation & Adaptation",
    template: "%s · CourseMap",
  },
  description:
    "From coursebook evaluation to actionable adaptation. A literature-grounded dashboard for English teachers, materials developers and prep-school coordinators.",
  keywords: [
    "ELT",
    "TEFL",
    "TESOL",
    "coursebook evaluation",
    "materials adaptation",
    "materials development",
    "CEFR",
    "English language teaching",
  ],
  authors: [{ name: "CourseMap" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "CourseMap — Coursebook Evaluation & Adaptation",
    description:
      "Evaluate a coursebook unit against your teaching context and turn it into a concrete, literature-grounded adaptation plan.",
    siteName: "CourseMap",
  },
  twitter: {
    card: "summary_large_image",
    title: "CourseMap — Coursebook Evaluation & Adaptation",
    description:
      "From coursebook evaluation to actionable adaptation — for English teachers and prep-school coordinators.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <SiteNav />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
            <footer className="no-print border-t border-border bg-card">
              <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
                CourseMap supports professional decision-making. It does not replace
                teacher judgment. Reports are decision-support documents and should be
                reviewed by a qualified teacher or coordinator.
              </div>
            </footer>
          </div>
          <Toaster richColors closeButton position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
