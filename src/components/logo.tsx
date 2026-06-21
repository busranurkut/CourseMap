import { cn } from "@/lib/utils";

/** CourseMap brand mark: a route from a start node up to a goal node. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-8 w-8", className)}
      role="img"
      aria-label="CourseMap logo"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="hsl(var(--primary))" />
      <path
        d="M18 44C18 44 22 30 32 30C42 30 46 20 46 20"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="18" cy="44" r="5" fill="hsl(var(--primary-foreground))" />
      <circle cx="32" cy="30" r="5" fill="hsl(var(--primary-foreground))" opacity="0.6" />
      <circle cx="46" cy="20" r="5" fill="hsl(var(--primary-foreground))" />
    </svg>
  );
}
