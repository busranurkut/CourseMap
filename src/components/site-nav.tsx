"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/evaluations/new", label: "New" },
  { href: "/diagnose", label: "Fix a unit" },
  { href: "/recipes", label: "Recipes" },
  { href: "/evaluations", label: "History" },
  { href: "/literature", label: "Literature" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="no-print sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-foreground">CourseMap</span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              From evaluation to adaptation
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {links.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-md px-2.5 py-2 text-sm font-medium transition-colors sm:px-3",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
