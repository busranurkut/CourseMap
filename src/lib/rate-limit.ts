import { NextRequest, NextResponse } from "next/server";

// Lightweight in-memory rate limiter (fixed window per client IP).
//
// Note: on serverless platforms each instance has its own memory, so this is a
// best-effort guard against casual abuse, not a distributed limiter. For strict,
// cross-instance limits, back this with Redis/Upstash. It still meaningfully caps
// bursts from a single client hitting a warm instance.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitOptions {
  /** Max requests allowed per window. */
  limit?: number;
  /** Window length in milliseconds. */
  windowMs?: number;
  /** Distinguishes limiters for different routes. */
  scope?: string;
}

/**
 * Returns a 429 NextResponse when the caller has exceeded the limit, or null when
 * the request is allowed.
 */
export function checkRateLimit(
  req: NextRequest,
  { limit = 10, windowMs = 60_000, scope = "global" }: RateLimitOptions = {},
): NextResponse | null {
  const key = `${scope}:${clientIp(req)}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (existing.count >= limit) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return NextResponse.json(
      { error: `Too many requests. Please wait ${retryAfter}s and try again.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  existing.count += 1;
  return null;
}

// Opportunistic cleanup so the map doesn't grow unbounded on long-lived instances.
let lastSweep = Date.now();
export function maybeSweep() {
  const now = Date.now();
  if (now - lastSweep < 5 * 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key);
  }
}
