"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HistoryRowActions({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this evaluation? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/evaluations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed.");
      router.refresh();
    } catch {
      setDeleting(false);
      alert("Could not delete this evaluation.");
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/evaluations/${id}`}>
          <Eye className="h-4 w-4" /> View
        </Link>
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete} disabled={deleting}>
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 text-destructive" />
        )}
      </Button>
    </div>
  );
}
