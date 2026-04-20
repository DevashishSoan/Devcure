import re
from typing import List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class ValidationResult:
    passed: bool
    reason: str
    files_modified: List[str]

def extract_filenames_from_diff(diff_str: str) -> List[str]:
    """Extracts filenames from a unified diff string."""
    filenames = []
    # Use re.MULTILINE and handle potential variations like +++ a/ or +++ b/
    matches = re.findall(r'^\+\+\+ [ab]/(.*)$', diff_str, re.MULTILINE)
    for m in matches:
        filenames.append(m.strip())
    return list(set(filenames))

def detect_new_imports(diff_str: str) -> List[str]:
    """Detects if any new imports are added in the diff."""
    new_imports = []
    # In a unified diff, added lines start with '+'
    # We look for '+' followed by 'import ' or 'from ... import'
    for line in diff_str.split('\n'):
        if line.startswith('+') and not line.startswith('+++'):
            clean_line = line[1:].strip()
            if re.match(r'^(import\s+|from\s+.*import\s+)', clean_line):
                new_imports.append(clean_line)
    return new_imports

def validate_patch_safety(diff_str: str) -> ValidationResult:
    """
    Enforces the 'Surgical Repair' safety rules:
    1. Maximum 1 file modified.
    2. No new dependencies/imports.
    3. Proper unified diff format.
    """
    # 1. Scope Check
    files_modified = extract_filenames_from_diff(diff_str)
    if len(files_modified) == 0:
        return ValidationResult(False, "ESCALATE: No file markers (+++ b/) found in diff.", [])
    if len(files_modified) > 1:
        return ValidationResult(False, f"ESCALATE: Patch modifies {len(files_modified)} files. Max 1 allowed ({', '.join(files_modified)}).", files_modified)

    # 2. Import Check
    new_imports = detect_new_imports(diff_str)
    if new_imports:
        return ValidationResult(False, f"ESCALATE: Patch adds new imports: {', '.join(new_imports)}", files_modified)

    # 3. Authorization Check
    FORBIDDEN_PATTERNS = ["backend/", ".env", ".supabase/", "Dockerfile", "docker-compose", "package-lock.json", "requirements.txt"]
    for filename in files_modified:
        if any(pattern in filename for pattern in FORBIDDEN_PATTERNS):
            return ValidationResult(False, f"ESCALATE: Patch attempts to modify unauthorized file: {filename}", files_modified)

    return ValidationResult(True, "Safe for application", files_modified)

def parse_agent_response(response: str) -> str:
    """
    Strips markdown fences and prose from Gemini's response 
    to extract the raw unified diff.
    """
    # Look for content between ```diff and ``` or just ```
    matches = re.search(r'```(?:diff)?(.*?)```', response, re.DOTALL)
    if matches:
        return matches.group(1).strip()
    
    # If no fences, just return the whole thing and hope it's clean
    return response.strip()
