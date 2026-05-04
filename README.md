# Halton Meter — Dashboard

> Local web dashboard for [Halton Meter](https://meter.haltonlabs.com) — visualises LLM API spend, project attribution, and cost reconciliation.

Built with Next.js 16, TypeScript strict, Tailwind 4, and Recharts. Connects to the Halton Meter daemon over loopback HTTP — nothing leaves your machine.

---

## Prerequisites

The dashboard is a read-only frontend. It requires the **Halton Meter daemon** running locally to have any data to show.

Install the daemon via [pipx](https://pipx.pypa.io) (recommended) or `uv`:

```bash
pipx install halton-meter
```

Then run the one-time setup:

```bash
halton-meter init --apps   # generates mitmproxy CA, trusts it in keychain, writes launchd plists
halton-meter status        # confirm: HEALTHY, all 3 components
```

The daemon exposes an HTTP API on `http://localhost:8765` by default. The dashboard reads from that address.

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/haltonlabs/halton-meter-dashboard.git
cd halton-meter-dashboard

# 2. Install dependencies
npm install

# 3. Configure (only needed if you've changed daemon.api_port from the default 8765)
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL if your daemon is on a different port

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The sidebar shows **Live / Stale / Offline** based on the daemon's last activity.

---

## Configuration

Copy `.env.local.example` to `.env.local`:

```env
# URL of the Halton Meter daemon API (default: http://localhost:8765)
NEXT_PUBLIC_API_URL=http://localhost:8765

# Optional: run the dashboard on a different port (default: 3000)
# PORT=3001
```

If you've changed `daemon.api_port` in `~/.halton-meter/config.toml`, set `NEXT_PUBLIC_API_URL` to match and update the CORS allow-list in that same file:

```toml
# ~/.halton-meter/config.toml
[daemon]
api_port = 8766

[cors]
allow_origins = ["http://localhost:3000"]
```

---

## Pages

| Route | What it shows |
|---|---|
| `/overview` | Top-line spend, recent activity, provider split, top projects |
| `/projects` | All projects with status and last-active |
| `/projects/[slug]` | Per-project detail: spend, model breakdown, requests table, policies |
| `/projects/[slug]/report` | Print-ready A4 client cost report — `Cmd+P` to export PDF |
| `/reconciliation` | Variance against provider billing (provider admin key required) |
| `/audit` | Full audit log of captured requests and policy events |
| `/settings/pricing-rates` | Edit the cost matrix per provider |
| `/settings/about` | App version, daemon status, data location |

---

## First run

Until the daemon ingests its first LLM request every page renders an empty state. Send any request through a client that uses the system proxy (Claude Code, Anthropic SDK, OpenAI SDK, etc.) and it will appear in **Overview** within ~60 seconds.

---

## Build and lint

```bash
npm run lint
npm run build
```

Both must pass with zero errors before opening a PR. TypeScript is in strict mode — no `any` without justification.

---

## Where data lives

Nothing in the dashboard touches `localStorage` for state beyond theme preference and the most-recent reconciliation provider. All metrics come from the daemon, which stores them in `~/.halton-meter/db.sqlite`. Nothing leaves your machine.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript strict |
| Styling | Tailwind 4 + CSS custom properties (`globals.css` is the design system) |
| Charts | Recharts + hand-rolled SVG |
| Components | shadcn/ui primitives |

---

## Contributing

Issues and PRs welcome. The dashboard talks to the daemon via `src/lib/api.ts` — that's the only file that knows about the daemon's HTTP contract. All money values arrive in **millicents** (1 USD = 100,000 mc) and are converted to USD floats at the adapter boundary so components stay unit-agnostic.

---

## Related

- **[halton-meter](https://github.com/haltonlabs/halton-meter)** — the daemon (private): proxy, SQLite store, FastAPI, CLI
- **[PyPI](https://pypi.org/project/halton-meter/)** — `pipx install halton-meter`
- **[meter.haltonlabs.com](https://meter.haltonlabs.com)** — product page
