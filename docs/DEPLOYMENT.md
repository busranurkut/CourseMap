# Deploying CourseMap (free, public website)

This guide makes CourseMap a public website using **GitHub + Vercel + Neon Postgres**
— all on free tiers. No AI key is required (the built-in fallback report generator
works for everyone).

```
Your code on GitHub  ──▶  Vercel (runs the app)  ──▶  Neon (stores evaluations)
```

You will do this once. After that, every time you push code to GitHub, Vercel
re-deploys automatically.

---

## Step 1 — Put the code on GitHub

1. Create a new **empty** repository at https://github.com/new (e.g. `coursemap`).
   Do **not** add a README/license there — this project already has them.
2. In a terminal:

   ```bash
   cd coursemap
   git init
   git add .
   git commit -m "Initial CourseMap MVP"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/coursemap.git
   git push -u origin main
   ```

> `.env` and the local database are git-ignored, so no secrets are uploaded.

---

## Step 2 — Create a free Postgres database (Neon)

1. Go to https://neon.tech and sign up (you can use your GitHub account).
2. Create a project (any name). Choose a region near you.
3. Open **Connection Details** and copy the **connection string**. It looks like:

   ```
   postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

> **Use the pooled connection for serverless.** On the Neon connection screen,
> enable **"Pooled connection"** — the hostname will contain `-pooler`
> (e.g. `ep-xxxx-pooler.region.aws.neon.tech`). Serverless platforms like Vercel
> open many short-lived connections, and the pooler prevents you from exhausting
> the database's connection limit under traffic. Use this pooled string for
> `DATABASE_URL` in both Vercel and local `.env`.

Keep this handy — you'll paste it into Vercel, and into your local `.env`.

### Database migrations

This project uses Prisma **migrations** (in `prisma/migrations/`). On Vercel the
`vercel-build` script runs `prisma migrate deploy` automatically, so any future
schema change you commit is applied to the database on the next deploy — no manual
step. Locally, apply migrations with `npm run db:migrate`.

---

## Step 3 — Create the database table

Point your local project at Neon and create the table once:

1. Open `.env` and replace the `DATABASE_URL` placeholder with your Neon string.
2. Run:

   ```bash
   npm install            # if you haven't already
   npx prisma db push     # creates the Evaluation table in Neon
   npm run db:seed        # optional: adds the fictional sample evaluation
   ```

You can now also run the app locally against Neon with `npm run dev`.

---

## Step 4 — Deploy on Vercel

1. Go to https://vercel.com and sign up with **GitHub**.
2. Click **Add New… → Project**, then **Import** your `coursemap` repository.
3. Vercel auto-detects Next.js. Before clicking Deploy, open **Environment
   Variables** and add:

   | Name           | Value                                            |
   | -------------- | ------------------------------------------------ |
   | `DATABASE_URL` | your Neon connection string (from Step 2)        |

   _(Leave `ANTHROPIC_API_KEY` out to keep the free, fallback-only behavior.)_

4. Click **Deploy**. After ~1 minute you get a public URL like
   `https://coursemap.vercel.app` — shareable with anyone.

That's it. 🎉

---

## Updating the live site

Just push to GitHub; Vercel redeploys automatically:

```bash
git add .
git commit -m "Describe your change"
git push
```

If you ever change `prisma/schema.prisma`, run `npx prisma db push` again
(pointed at Neon) to apply the change to the database.

---

## Optional — enable AI reports later

In Vercel → your project → **Settings → Environment Variables**, add
`ANTHROPIC_API_KEY` with a key from https://console.anthropic.com/, then redeploy.
Note: every visitor's AI report is billed to that key. Without it, everyone still
gets the built-in template-based reports for free.

---

## Things to know about a public deployment

- **No login (yet).** All visitors share the same evaluation history. This is fine
  for a demo/portfolio. Real multi-user separation needs accounts — see
  [`ROADMAP.md`](ROADMAP.md).
- **Copyright.** The public site must follow the same rules as everywhere else —
  do not paste entire copyrighted units. See
  [`ETHICS_AND_COPYRIGHT.md`](ETHICS_AND_COPYRIGHT.md).
- **Free tiers sleep.** Neon/Vercel free tiers may have brief cold starts after
  inactivity. That's normal.

## Alternative hosts

Any platform that runs a Node/Next.js server works (Render, Railway, Fly.io). The
only requirement is a Postgres database via `DATABASE_URL`. Render additionally
supports a persistent disk if you prefer to keep SQLite — in that case set the
Prisma `provider` back to `sqlite` and use a disk-backed `DATABASE_URL`.
