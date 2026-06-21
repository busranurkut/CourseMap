export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 animate-pulse rounded-lg bg-muted md:col-span-1" />
        <div className="h-32 animate-pulse rounded-lg bg-muted md:col-span-2" />
      </div>
      <div className="h-80 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
