"""
GitHub API Client for DevCure PR Automation.

Handles creating fix branches, pushing patched files, and opening Pull Requests
using the GitHub REST API via httpx.
"""

import httpx
import base64
from typing import Optional
from core.config import settings


GITHUB_API = "https://api.github.com"
HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


def _auth_headers() -> dict:
    token = getattr(settings, "GITHUB_TOKEN", None)
    if not token:
        raise ValueError("GITHUB_TOKEN is not configured.")
    return {**HEADERS, "Authorization": f"Bearer {token}"}


async def get_default_branch_sha(client: httpx.AsyncClient, repo: str, base_branch: str) -> str:
    """Gets the latest commit SHA of the base branch."""
    url = f"{GITHUB_API}/repos/{repo}/git/ref/heads/{base_branch}"
    resp = await client.get(url, headers=_auth_headers())
    resp.raise_for_status()
    return resp.json()["object"]["sha"]


async def create_fix_branch(client: httpx.AsyncClient, repo: str, base_branch: str, run_id: str) -> str:
    """Creates the devcure/fix-<run_id> branch from the base branch HEAD."""
    fix_branch = f"devcure/fix-{run_id}"
    base_sha = await get_default_branch_sha(client, repo, base_branch)

    url = f"{GITHUB_API}/repos/{repo}/git/refs"
    resp = await client.post(url, headers=_auth_headers(), json={
        "ref": f"refs/heads/{fix_branch}",
        "sha": base_sha,
    })

    # 422 = branch already exists, treat as success
    if resp.status_code not in (201, 422):
        resp.raise_for_status()

    return fix_branch


async def get_file_sha(client: httpx.AsyncClient, repo: str, branch: str, file_path: str) -> Optional[str]:
    """Gets the blob SHA of a file (needed to update it via the API)."""
    url = f"{GITHUB_API}/repos/{repo}/contents/{file_path}"
    resp = await client.get(url, headers=_auth_headers(), params={"ref": branch})
    if resp.status_code == 404:
        return None
    resp.raise_for_status()
    return resp.json().get("sha")


async def push_file(
    client: httpx.AsyncClient,
    repo: str,
    branch: str,
    file_path: str,
    content: str,
    commit_message: str,
) -> None:
    """Creates or updates a file on the fix branch."""
    url = f"{GITHUB_API}/repos/{repo}/contents/{file_path}"
    encoded = base64.b64encode(content.encode()).decode()

    payload = {
        "message": commit_message,
        "content": encoded,
        "branch": branch,
    }

    # If file exists, we need its SHA to update it
    existing_sha = await get_file_sha(client, repo, branch, file_path)
    if existing_sha:
        payload["sha"] = existing_sha

    resp = await client.put(url, headers=_auth_headers(), json=payload)
    resp.raise_for_status()


async def get_existing_pr(client: httpx.AsyncClient, repo: str, head: str) -> Optional[dict]:
    """Checks if an open PR exists for the given head branch."""
    url = f"{GITHUB_API}/repos/{repo}/pulls"
    # Format for head is 'org:branch' or 'user:branch'
    params = {"head": head, "state": "open"}
    resp = await client.get(url, headers=_auth_headers(), params=params)
    resp.raise_for_status()
    pulls = resp.json()
    return pulls[0] if pulls else None


async def create_pull_request(
    client: httpx.AsyncClient,
    repo: str,
    fix_branch: str,
    base_branch: str,
    title: str,
    body: str,
) -> str:
    """Opens a Pull Request or updates an existing one, returning its HTML URL."""
    # Check if PR already exists for this branch
    org = repo.split("/")[0]
    existing_pr = await get_existing_pr(client, repo, f"{org}:{fix_branch}")
    
    if existing_pr:
        # Update existing PR body
        url = f"{GITHUB_API}/repos/{repo}/pulls/{existing_pr['number']}"
        resp = await client.patch(url, headers=_auth_headers(), json={"body": body})
        resp.raise_for_status()
        return resp.json()["html_url"]

    # Create new PR
    url = f"{GITHUB_API}/repos/{repo}/pulls"
    resp = await client.post(url, headers=_auth_headers(), json={
        "title": title,
        "body": body,
        "head": fix_branch,
        "base": base_branch,
    })
    resp.raise_for_status()
    return resp.json()["html_url"]


async def open_fix_pr(
    repo: str,
    base_branch: str,
    run_id: str,
    fixed_file_path: str,
    fixed_content: str,
    diagnosis: str,
    repair_diff: str,
) -> str:
    """
    Full PR automation flow:
    1. Create fix branch
    2. Push the patched file to it
    3. Open a Pull Request with a rich description
    Returns the PR URL.
    """
    pr_title = f"🤖 DevCure: Autonomous fix for {fixed_file_path}"

    pr_body = f"""## Autonomous Repair Report

This Pull Request was created automatically by **[DevCure](https://devcure-jx5m.onrender.com)** after detecting and resolving test failures.

---

### 🔍 Root Cause Diagnosis

{diagnosis}

---

### 🔧 Applied Patch

```diff
{repair_diff}
```

---

### ✅ Verification

All target tests passed after the fix was applied. No regressions were detected.

---

*Run ID: `{run_id}` | Review and merge if the fix looks correct.*
"""

    async with httpx.AsyncClient(timeout=30.0) as client:
        fix_branch = await create_fix_branch(client, repo, base_branch, run_id)
        await push_file(
            client,
            repo,
            fix_branch,
            fixed_file_path,
            fixed_content,
            commit_message=f"fix: Autonomous repair of {fixed_file_path} (run {run_id})",
        )
        pr_url = await create_pull_request(
            client,
            repo,
            fix_branch,
            base_branch,
            pr_title,
            pr_body,
        )

    return pr_url
