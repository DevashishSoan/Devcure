# devcure/auto-heal — GitHub Action

Automatically diagnose and repair failing CI tests using DevCure's autonomous AI agent.

## Usage

Add to any workflow `.yml` file to trigger DevCure when tests fail:

```yaml
name: CI with Auto-Heal

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run tests
        id: run-tests
        run: pytest -v
        continue-on-error: true
      
      - name: Auto-heal with DevCure
        if: steps.run-tests.outcome == 'failure'
        uses: devcure/auto-heal@v1
        with:
          api-url: ${{ secrets.DEVCURE_API_URL }}
          api-key: ${{ secrets.DEVCURE_API_KEY }}
          confidence-threshold: "70"   # below 70% → opens PR for review
          comment-on-pr: "true"
```

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `api-url` | ✅ | — | Your DevCure backend URL |
| `api-key` | ✅ | — | DevCure API key from dashboard |
| `repo` | No | `github.repository` | Repo to heal |
| `branch` | No | `github.ref_name` | Branch to heal |
| `confidence-threshold` | No | `70` | Min confidence % to auto-apply. Below this → PR for human review |
| `framework` | No | auto-detect | Override: `pytest`, `jest`, `vitest` |
| `comment-on-pr` | No | `true` | Post reasoning trace as PR comment |

## Outputs

| Output | Description |
|---|---|
| `run-id` | DevCure run UUID |
| `status` | `completed` \| `escalated` \| `failed` |
| `pr-url` | GitHub PR URL if a fix was proposed |
| `confidence` | Patch confidence score (0-100) |

## How It Works

1. Tests fail in your CI pipeline.
2. This action POSTs the failure context to your DevCure backend.
3. DevCure's LangGraph agent runs: baseline → diagnose → repair → verify.
4. If healed: a PR is opened with the diff and reasoning trace.
5. If confidence is below threshold: PR opens for human review.
6. Action exits `0` on success, `1` if DevCure cannot heal.

## Publishing to the Marketplace

1. Create a **public** GitHub repo named `devcure/auto-heal`.
2. Copy this folder's contents to the root of that repo.
3. Go to the repo's Releases page → click "Draft a new release".
4. Check "Publish this Action to the GitHub Marketplace".
5. Tag as `v1` and publish.

## Secrets Setup

In your repo's Settings → Secrets → Actions:
- `DEVCURE_API_URL`: `https://your-backend.onrender.com`
- `DEVCURE_API_KEY`: Your API key from the DevCure dashboard
