import httpx
import subprocess
from typing import Optional
from core.config import settings

class GitHubService:
    """
    Handles Pull Request creation and branch management.
    """
    def __init__(self, token: Optional[str] = settings.GITHUB_TOKEN):
        self.token = token
        self.api_base = "https://api.github.com"

    def push_changes(self, sandbox_path: str, repo_full_name: str, branch_name: str) -> bool:
        """
        Pushes changes from the sandbox to a new branch on GitHub.
        """
        if not self.token:
            print("Error: GITHUB_TOKEN not set.")
            return False

        try:
            # Inject token for pushing
            repo_url = f"https://x-access-token:{self.token}@github.com/{repo_full_name}.git"
            
            # 1. Setup git config (if not set)
            subprocess.run(["git", "config", "user.email", "ai@devcure.cli"], cwd=sandbox_path, check=True)
            subprocess.run(["git", "config", "user.name", "DevCure AI"], cwd=sandbox_path, check=True)
            
            # 2. Create and switch to new branch
            subprocess.run(["git", "checkout", "-b", branch_name], cwd=sandbox_path, check=True)
            
            # 3. Add and commit
            subprocess.run(["git", "add", "."], cwd=sandbox_path, check=True)
            subprocess.run(["git", "commit", "-m", "Auto-fix by DevCure AI Agent"], cwd=sandbox_path, check=True)
            
            # 4. Push to remote
            subprocess.run(["git", "push", repo_url, branch_name], cwd=sandbox_path, check=True)
            
            return True
        except Exception as e:
            print(f"Failed to push changes to GitHub: {e}")
            return False

    async def create_pull_request(
        self, 
        repo_full_name: str, 
        title: str, 
        body: str, 
        head: str, 
        base: str = "main"
    ) -> Optional[str]:
        """
        Opens a Pull Request via GitHub REST API.
        Returns the PR URL if successful.
        """
        if not self.token:
            return None

        url = f"{self.api_base}/repos/{repo_full_name}/pulls"
        headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }
        data = {
            "title": title,
            "body": body,
            "head": head,
            "base": base
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=data)
            if response.status_code == 201:
                return response.json().get("html_url")
            else:
                print(f"Failed to create PR: {response.status_code} - {response.text}")
                return None

github_service = GitHubService()
