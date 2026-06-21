import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function EthicsNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
      <p>
        Only upload or paste materials you are allowed to use for professional evaluation.
        CourseMap does not redistribute coursebook content. Generated reports are
        decision-support documents and should be reviewed by a qualified teacher or
        coordinator.
      </p>
    </div>
  );
}
