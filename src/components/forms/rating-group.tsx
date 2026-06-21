"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RatingGroupProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  label: string;
}

const SCALE = [1, 2, 3, 4, 5];

/**
 * Accessible 1–5 rating control.
 * - role="radiogroup" with arrow-key navigation (Left/Down decrement, Right/Up increment)
 * - clicking the selected value again clears it
 */
export function RatingGroup({ value, onChange, label }: RatingGroupProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const current = value ?? 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(5, current + 1) as number);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = current - 1;
      onChange(next < 1 ? undefined : next);
    } else if (/^[1-5]$/.test(e.key)) {
      e.preventDefault();
      onChange(Number(e.key));
    } else if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      onChange(undefined);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex shrink-0 gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {SCALE.map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${n} of 5`}
            tabIndex={-1}
            onClick={() => onChange(active ? undefined : n)}
            className={cn(
              "h-8 w-8 rounded-md border text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
