"""
Test script: sends a signed GitHub push payload to the live webhook endpoint
and prints the response code + body to diagnose 500 errors.
"""
import hmac
import hashlib
import httpx
import json

import os

WEBHOOK_URL = "https://devcure-jx5m.onrender.com/api/v1/webhooks/github"
SECRET = os.getenv("GITHUB_WEBHOOK_SECRET")
if not SECRET:
    raise ValueError("GITHUB_WEBHOOK_SECRET not set in environment")

# Minimal push payload that mirrors what GitHub sends
payload = {
    "ref": "refs/heads/test/autonomous-repair",
    "before": "0000000000000000000000000000000000000000",
    "after": "4d9752b1234567890abcdef1234567890abcdef",
    "repository": {
        "id": 1210093360,
        "name": "Devcure",
        "full_name": "DevashishSoan/Devcure",
        "private": False,
    },
    "commits": [
        {"id": "4d9752b", "message": "test: Final end-to-end trigger"}
    ],
    "head_commit": {"id": "4d9752b", "message": "test: Final end-to-end trigger"},
    "pusher": {"name": "DevashishSoan"},
}

body = json.dumps(payload).encode()
sig = "sha256=" + hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()

print(f"Sending signed push to {WEBHOOK_URL}...")
print(f"Signature: {sig[:30]}...")

resp = httpx.post(
    WEBHOOK_URL,
    content=body,
    headers={
        "Content-Type": "application/json",
        "X-GitHub-Event": "push",
        "X-Hub-Signature-256": sig,
        "User-Agent": "GitHub-Hookshot/test",
    },
    timeout=30,
)

print(f"\nStatus: {resp.status_code}")
print(f"Body: {resp.text}")
