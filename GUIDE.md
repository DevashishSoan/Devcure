# DevCure User Guide

Welcome to **DevCure**, your autonomous AI bug-repair platform. This guide will help you get the system running and explain the end-to-end workflow for fixing bugs automatically.

---

## 🚀 Getting Started

### 1. Start the Backend
The backend handles the AI agents, sandbox environments, and GitHub webhooks.
```powershell
cd backend
python main.py
```
- **Port**: `8000`
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Start the Frontend
The dashboard allows you to monitor runs and manage your repositories.
```powershell
cd frontend
npm run dev
```
- **URL**: [http://localhost:3000](http://localhost:3000)

---

## ⚡ Trigger Your First Run

Follow these steps to see DevCure in action for the first time:

1.  **Connect a Repo**: Add a repository in the **Repositories** tab of the dashboard.
2.  **Break a Test**: In your local repo, create a file named `test_logic.py` (for Python) or `logic.test.js` (for JS) with a test that you know will fail.
    *   *Example (Python)*: `def test_fail(): assert 1 == 2`
3.  **Push to GitHub**: Commit and push the failing test to your main branch.
4.  **Watch the Magic**: 
    *   Check your **Backend Logs** to see the webhook intercepted.
    *   Open the **Dashboard** to see a new run appear in the "Runs" table.
    *   Wait ~60 seconds to see the AI diagnose the failure and push a fix!

---

## 🛠️ Configuring a Repository

To have DevCure fix bugs in your repo, you must register it:

1. **Dashboard**: Navigate to the "Repositories" tab.
2. **Connect**: Click "Connect GitHub" and enter your repo details (e.g., `username/repo`).
3. **Webhook**: Set up a Webhook in your GitHub repo:
    - **Payload URL**: `https://<your-public-url>/api/v1/webhooks/github` (Use `ngrok` for local testing)
    - **Content Type**: `application/json`
    - **Secret**: Must match `GITHUB_WEBHOOK_SECRET` in your `.env`.
    - **Events**: Just `push`.

---

## 💡 The Autonomous Workflow

Once a repository is connected, DevCure follows this loop:

### 1. Trigger
When you push code to GitHub, the webhook notifies the backend.

### 2. Baseline Capture
DevCure clones your repo into a secure sandbox and runs the existing tests. It identifies exactly which tests are failing (the "Baseline").

### 3. AI Diagnosis & Repair
- **Gemini Flash** analyzes the code and the test failures.
- It proposes a **surgical fix** (minimal code change) for the target file.
- **Safety Gate**: Our security layer verifies the fix adds no new imports and only modifies allowed files.

### 4. Verification
DevCure runs the test suite again. 
- **Success**: If the baseline failures are fixed and NO new failures are introduced (Regressions), the fix is accepted.
- **Escalate**: If the fix introduces regressions or fails too many times, a human developer is notified.

### 5. Pull Request
If the fix is successful, DevCure automatically pushes a new branch and opens a **Pull Request** on GitHub for your review.

---

## 📊 Monitoring Runs

You can monitor the AI's "thought process" in real-time:
- **Dashboard**: View the current status (Queued, Running, Completed, Escalated).
- **Trajectory Logs**: See every action the agent takes, including the diffs it generated and the test results it analyzed.

---

## 🧪 Simulation Mode (Safe Testing)

If you want to see the platform in action without committing real code, run the simulation script:
```powershell
python backend/tests/simulate_run.py
```
This mocks all GitHub and AI responses to show you exactly how the platform handles Success, Regression, and Safety Gate scenarios.
