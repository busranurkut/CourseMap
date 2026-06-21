"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { LEARNER_LEVELS } from "@/lib/validation";
import { cn } from "@/lib/utils";

const DIAGNOSE_PROBLEMS = [
  "The unit is boring.",
  "The reading is too difficult.",
  "The listening is too difficult.",
  "There is not enough speaking.",
  "There is not enough writing.",
  "There is too much controlled practice.",
  "Vocabulary is not recycled.",
  "Grammar is too isolated.",
  "The unit does not match the exam.",
  "The topic does not fit my learners.",
  "The lesson is too long.",
  "The lesson needs a better final task.",
  "Mixed levels make the unit difficult to teach.",
  "Large class size makes the tasks difficult.",
];

// Map friendly diagnose phrases to canonical problem tags used by the recipe engine.
const TO_TAG: Record<string, string> = {
  "The unit is boring.": "Topic is not engaging",
  "The reading is too difficult.": "Weak reading support",
  "The listening is too difficult.": "Weak listening support",
  "There is not enough speaking.": "Not enough speaking",
  "There is not enough writing.": "Not enough writing",
  "There is too much controlled practice.": "Too much controlled practice",
  "Vocabulary is not recycled.": "Not enough vocabulary recycling",
  "Grammar is too isolated.": "Grammar is too isolated",
  "The unit does not match the exam.": "Not exam-aligned",
  "The topic does not fit my learners.": "Topic does not fit my learners",
  "The lesson is too long.": "Too long for available time",
  "The lesson needs a better final task.": "Needs a better final task",
  "Mixed levels make the unit difficult to teach.": "Mixed levels hard to teach",
  "Large class size makes the tasks difficult.": "Large class size",
};

export function DiagnoseForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [learnerLevel, setLearnerLevel] = useState("");
  const [classSize, setClassSize] = useState("");
  const [availableLessonTime, setAvailableLessonTime] = useState("");
  const [unitTopic, setUnitTopic] = useState("");
  const [unitText, setUnitText] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggle(p: string) {
    setSelected((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("Select at least one problem.");
      return;
    }
    if (!learnerLevel) {
      toast.error("Please choose a learner level.");
      return;
    }
    if (unitText.trim().length < 20) {
      toast.error("Please add a short unit summary (at least 20 characters).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTags: selected.map((s) => TO_TAG[s] ?? s),
          learnerLevel,
          classSize,
          availableLessonTime,
          unitTopic,
          unitText,
          evidenceNotes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status}).`);
      }
      const data = await res.json();
      toast.success("Diagnosis ready.");
      router.push(`/evaluations/${data.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>What problem are you trying to solve?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {DIAGNOSE_PROBLEMS.map((p) => {
              const active = selected.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(p)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>A few details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="d-level">Learner level *</Label>
            <Select
              id="d-level"
              value={learnerLevel}
              onChange={(e) => setLearnerLevel(e.target.value)}
            >
              <option value="">Select…</option>
              {LEARNER_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="d-class">Class size</Label>
            <Input
              id="d-class"
              placeholder="e.g. 28"
              value={classSize}
              onChange={(e) => setClassSize(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="d-time">Lesson time</Label>
            <Input
              id="d-time"
              placeholder="e.g. 50 minutes"
              value={availableLessonTime}
              onChange={(e) => setAvailableLessonTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="d-topic">Unit topic</Label>
            <Input
              id="d-topic"
              placeholder="e.g. City life"
              value={unitTopic}
              onChange={(e) => setUnitTopic(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="d-summary">Unit summary *</Label>
            <Textarea
              id="d-summary"
              className="min-h-[100px]"
              placeholder="Briefly summarize the unit in your own words (do not paste copyrighted text)."
              value={unitText}
              onChange={(e) => setUnitText(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="d-evidence">Evidence notes (optional)</Label>
            <Textarea
              id="d-evidence"
              placeholder="The reading is relevant, but the post-reading stage only checks comprehension."
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Diagnosing…" : "Get quick adaptation plan"}
      </Button>
    </form>
  );
}
