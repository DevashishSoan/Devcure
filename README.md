# DevCure

> **AI agent that automatically detects, diagnoses, and repairs failing CI/CD tests — no human needed.**

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agents-6366F1?style=flat)](https://langchain-ai.github.io/langgraph/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)

---

## What is DevCure?

DevCure is the only autonomous QA platform that **generates, applies, and explains code-level patches** — not just UI locator fixes — in an isolated sandbox, with a full reasoning trace that engineers can audit and trust.

A Jest test failed because an API endpoint changed. DevCure detected the schema diff, rewrote the affected assertion, re-ran the suite, and opened a PR — **all in 47 seconds**.

---

## How It Works

**1. Failure Detected** — A push triggers your CI. DevCure's webhook intercepts the test failure output and queues a repair job.

**2. Root Cause Diagnosed** — A LangGraph agent reasons over the failure trace, indexes your codebase, and identifies the precise file and line responsible.

**3. Patch Applied & Verified** — The agent generates a surgical diff, applies it in an isolated sandbox, reruns the full test suite to confirm no regressions, and opens a GitHub PR with a full reasoning trace.

---

## DevCure vs. The Competition

| Capability | DevCure | Testim / Tricentis | Mabl | Functionize |
|---|---|---|---|---|
| **Code-level patch generation** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Agent reasoning transparency** | ✅ Full trace | ❌ Opaque | ❌ Opaque | ❌ Opaque |
| **Sandboxed repair execution** | ✅ Isolated | ❌ No | ❌ No | ❌ No |
| **UI locator self-healing** | 🔄 Roadmap | ✅ Primary focus | ✅ Primary focus | ✅ Primary focus |
| **pytest / Jest support** | ✅ Yes | ❌ UI only | ❌ UI only | ❌ UI only |
| **Open source** | ✅ MIT | ❌ Proprietary | ❌ Proprietary | ❌ Proprietary |

**The wedge:** Every competitor self-heals UI locators. Nobody generates code patches with full reasoning transparency. That's DevCure's defensible territory.

---

## Quick Start

### GitHub Actions (One-line CI Integration)

```yaml
- name: Auto-heal failing tests
  if: failure()
  uses: DevashishSoan/devcure-auto-heal@v1.0.0
  with:
    api-url: ${{ secrets.DEVCURE_API_URL }}
    api-key: ${{ secrets.DEVCURE_API_KEY }}
```

> **[→ View on GitHub Marketplace](https://github.com/DevashishSoan/devcure-auto-heal)**

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # Fill in your keys
python main.py
# → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # Fill in your Supabase + backend URL
npm run dev
# → http://localhost:3000
```

### Trigger Your First Healing Cycle

```bash
# Simulate a full repair cycle (no real repo needed)
python scripts/simulate_run.py

# Or test against a real failing test:
git clone https://github.com/your-org/your-repo
# Add a failing test, push, watch the dashboard
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   GitHub / CI Pipeline               │
│   Push → Webhook → POST /api/v1/webhooks/github      │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│                  FastAPI Backend                      │
│  ┌─────────────────────────────────────────────┐    │
│  │         LangGraph Agent (4-node graph)       │    │
│  │  baseline → diagnose → repair → verify       │    │
│  └─────────────────┬───────────────────────────┘    │
│                    │                                  │
│  ┌─────────────────▼───────────────────────────┐    │
│  │    Sandbox Manager (Docker / Local)          │    │
│  │    Clone → Run Tests → Apply Patch → Verify  │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│          Supabase (Postgres + Realtime)               │
│  runs table → real-time trajectory streaming          │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│          Next.js Dashboard                            │
│  Mission Control UI → RunDetailModal → PR Review      │
└─────────────────────────────────────────────────────┘
```

---

## Configuration

| Variable | Location | Description |
|---|---|---|
| `GEMINI_API_KEY` | `backend/.env` | Google AI Studio API key |
| `SUPABASE_URL` | `backend/.env` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | `backend/.env` | Supabase service role key |
| `SUPABASE_JWT_SECRET` | `backend/.env` | Must match Supabase project JWT secret |
| `GITHUB_TOKEN` | `backend/.env` | Personal access token (repo + PR scope) |
| `GITHUB_WEBHOOK_SECRET` | `backend/.env` | Min 32 chars — used to verify webhook payloads |
| `NEXT_PUBLIC_SUPABASE_URL` | `frontend/.env.local` | Same Supabase URL |
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | Backend URL (e.g. `http://localhost:8000`) |

---

## Supported Frameworks

| Framework | Language | Status |
|---|---|---|
| **pytest** | Python | ✅ Full parser |
| **Jest** | JavaScript/TypeScript | ✅ Supported |
| **Vitest** | JavaScript/TypeScript | ✅ Supported |
| **Go test** | Go | 🔄 Q3 2026 |
| **RSpec** | Ruby | 🔄 Q3 2026 |
| **JUnit** | Java | 🔄 Q4 2026 |

---

## Scripts

Utility scripts live in [`/scripts`](scripts/README.md):

```bash
python scripts/simulate_run.py      # Full dry-run healing cycle
python scripts/check_run.py         # Check status of a run by ID
python scripts/test_webhook.py      # Fire a test webhook payload
python scripts/verify_production.py # Production health checks
```

---

## Roadmap

| Quarter | Item |
|---|---|
| **Q2 2026** | Docker resource caps (512MB RAM / 2 CPU per job) |
| **Q2 2026** | ✅ GitHub Actions Marketplace — [DevashishSoan/devcure-auto-heal@v1.0.0](https://github.com/DevashishSoan/devcure-auto-heal) |
| **Q2 2026** | Confidence scoring on all patches |
| **Q3 2026** | Failure knowledge base + fix templates |
| **Q3 2026** | Predictive failure detection on PR diffs |
| **Q3 2026** | Jest / RSpec specialist parsers |
| **Q4 2026** | SOC 2 Type II certification |
| **Q4 2026** | On-premises deployment (Helm chart) |
| **Q4 2026** | SSO (SAML 2.0 / OIDC) |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) — DevCure, 2026.
