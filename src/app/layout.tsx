import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "CourseMap — Coursebook Evaluation & Adaptation",
  description:
    "From coursebook evaluation to actionable adaptation. A literature-grounded dashboard for English teachers, materials developers and prep-school coordinators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <SiteNav />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        <footer className="no-print border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
            CourseMap supports professional decision-making. It does not replace
            teacher judgment. Reports are decision-support documents and should be
            reviewed by a qualified teacher or coordinator.
          </div>
        </footer>
      </body>
    </html>
  );
}
