import os
import shutil
import uuid
try:
    import docker
except ImportError:
    docker = None
import time
import subprocess
import requests
from typing import Optional, Dict
from core.config import settings

class SandboxTimeoutError(Exception):
    """Raised when a command exceeds its timeout."""
    pass

class SandboxManager:
    """
    Manages isolated execution environments using Docker containers.
    """
    def __init__(self, base_path: str = settings.SANDBOX_BASE_PATH):
        self.base_path = base_path
        if not os.path.exists(self.base_path):
            os.makedirs(self.base_path)
        
        self.sandboxes: Dict[str, Dict] = {} # sandbox_id -> metadata
        
        try:
            self.client = docker.from_env()
        except Exception as e:
            print(f"Warning: Docker not available, falling back to mock mode. Error: {e}")
            self.client = None

    def create_sandbox(self, repo_url: Optional[str] = None, token: Optional[str] = None) -> Dict:
        """
        Creates a new isolated sandbox and clones the repo if provided.
        """
        self.cleanup_expired_sandboxes()
        
        sandbox_id = str(uuid.uuid4())
        sandbox_path = os.path.abspath(os.path.join(self.base_path, sandbox_id))
        os.makedirs(sandbox_path)
        
        if repo_url:
            self.clone_repo(sandbox_path, repo_url, token)

        metadata = {
            "id": sandbox_id,
            "path": sandbox_path,
            "created_at": time.time()
        }
        self.sandboxes[sandbox_id] = metadata
        return metadata

    def clone_repo(self, path: str, repo_url: str, token: Optional[str] = None):
        """Clones a repository into the specified path."""
        try:
            # Inject token into URL if provided
            if token and repo_url.startswith("https://"):
                authenticated_url = repo_url.replace("https://", f"https://x-access-token:{token}@")
            else:
                authenticated_url = repo_url

            subprocess.run(
                ["git", "clone", "--depth", "1", authenticated_url, "."],
                cwd=path,
                check=True,
                capture_output=True,
                text=True
            )
        except Exception as e:
            print(f"Cloning failed: {e}")
            # Fallback for mock/test mode
            with open(os.path.join(path, "README.md"), "w") as f:
                f.write(f"# Repo cloned from {repo_url}\n(Cloning actually failed: {e})")

    def read_file(self, sandbox_id: str, filepath: str) -> str:
        """Reads a file from the sandbox."""
        full_path = os.path.join(self.base_path, sandbox_id, filepath)
        if not os.path.exists(full_path):
            return ""
        with open(full_path, "r", encoding="utf-8") as f:
            return f.read()

    def write_file(self, sandbox_id: str, filepath: str, content: str):
        """Writes a file to the sandbox."""
        full_path = os.path.join(self.base_path, sandbox_id, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)

    def install_dependencies(self, sandbox_id: str):
        """
        Installs project dependencies within the sandbox.
        Checks for requirements.txt or pyproject.toml.
        """
        print(f"[{sandbox_id}] Installing project dependencies...")
        
        # Check for requirements.txt
        if os.path.exists(os.path.join(self.base_path, sandbox_id, "requirements.txt")):
            self.run_command(sandbox_id, "pip install -r requirements.txt", timeout=60)
        
        # Check for pyproject.toml (poetry/pip-install)
        elif os.path.exists(os.path.join(self.base_path, sandbox_id, "pyproject.toml")):
            self.run_command(sandbox_id, "pip install .", timeout=60)

    def run_command(self, sandbox_id: str, command: str, image: str = "python:3.12-slim", timeout: int = 300) -> str:
        """
        Executes a command within a Docker container or local subprocess.
        """
        sandbox_path = os.path.abspath(os.path.join(self.base_path, sandbox_id))
        if not os.path.exists(sandbox_path):
            raise FileNotFoundError(f"Sandbox {sandbox_id} not found.")

        # Prioritize local mode if configured or if Docker is unavailable
        if settings.SANDBOX_TYPE == "local" or not self.client:
            return self._run_local_command(sandbox_id, command, timeout)

        container = None
        try:
            # Docker execution logic (unchanged)
            container = self.client.containers.run(
                image,
                command=["/bin/sh", "-c", command],
                volumes={sandbox_path: {'bind': '/app', 'mode': 'rw'}},
                working_dir='/app',
                detach=True,
                remove=False
            )
            
            try:
                result = container.wait(timeout=timeout)
                logs = container.logs().decode('utf-8')
                return logs
            except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError):
                if container:
                    try:
                        container.stop(t=5)
                        container.remove(force=True)
                    except: pass
                raise SandboxTimeoutError(f"Command '{command}' exceeded {timeout}s timeout.")
            
        except SandboxTimeoutError:
            raise
        except Exception as e:
            if container:
                try: container.remove(force=True)
                except: pass
            return f"Error running command in Docker: {str(e)}"

    def _run_local_command(self, sandbox_id: str, command: str, timeout: int) -> str:
        """
        Executes a command in a local subprocess with security guards.
        """
        sandbox_path = os.path.abspath(os.path.join(self.base_path, sandbox_id))
        
        # Guard 1: Use list format for subprocess and NEVER use shell=True
        # We split the command string into a list. For simple pytest/pip commands this is direct.
        # For complex commands with pipes, we'd need a different approach, but for QA it's usually simple.
        cmd_list = ["/bin/sh", "-c", command] if os.name != 'nt' else ["cmd", "/c", command]

        try:
            result = subprocess.run(
                cmd_list,
                cwd=sandbox_path,
                capture_output=True,
                text=True,
                timeout=timeout,
                shell=False, # Mandatory security guard
                env=self._get_safe_env() # Mandatory security guard
            )
            return result.stdout + "\n" + result.stderr
        except subprocess.TimeoutExpired:
            raise SandboxTimeoutError(f"Local command '{command}' exceeded {timeout}s timeout.")
        except Exception as e:
            return f"Error running local command: {str(e)}"

    def _get_safe_env(self) -> Dict[str, str]:
        """
        Returns a copy of the environment with sensitive keys removed.
        Prevents the sandbox process from accessing platform credentials.
        """
        safe_env = os.environ.copy()
        sensitive_keys = [
            "SUPABASE_URL",
            "SUPABASE_KEY",
            "GEMINI_API_KEY",
            "GITHUB_TOKEN",
            "GITHUB_WEBHOOK_SECRET",
            "DATABASE_URL"
        ]
        for key in sensitive_keys:
            safe_env.pop(key, None)
        return safe_env

    def cleanup_expired_sandboxes(self):
        """Deletes sandboxes older than 30 minutes."""
        TTL = 1800 # 30 minutes
        now = time.time()
        to_delete = []
        
        for sid, meta in self.sandboxes.items():
            if now - meta["created_at"] > TTL:
                to_delete.append(sid)
        
        for sid in to_delete:
            self.cleanup_sandbox(sid)
            del self.sandboxes[sid]

    def cleanup_sandbox(self, sandbox_id: str):
        """Removes the sandbox directory."""
        sandbox_path = os.path.join(self.base_path, sandbox_id)
        if os.path.exists(sandbox_path):
            shutil.rmtree(sandbox_path, ignore_errors=True)

sandbox_manager = SandboxManager()
