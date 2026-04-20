import os
import sys
import json
import shutil
from pathlib import Path

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from agents.test_gen import detect_test_framework

def test_detect_pytest_requirements():
    path = "./test_detect_pytest"
    os.makedirs(path, exist_ok=True)
    with open(os.path.join(path, "requirements.txt"), "w") as f:
        f.write("pytest==8.0.0")
    
    assert detect_test_framework(path) == "pytest"
    shutil.rmtree(path)
    print("PASSED: Pytest (requirements.txt) detection")

def test_detect_jest():
    path = "./test_detect_jest"
    os.makedirs(path, exist_ok=True)
    pkg = {
        "devDependencies": {
            "jest": "^29.0.0"
        }
    }
    with open(os.path.join(path, "package.json"), "w") as f:
        json.dump(pkg, f)
    
    assert detect_test_framework(path) == "jest"
    shutil.rmtree(path)
    print("PASSED: Jest detection")

def test_detect_vitest():
    path = "./test_detect_vitest"
    os.makedirs(path, exist_ok=True)
    pkg = {
        "devDependencies": {
            "vitest": "^1.0.0"
        }
    }
    with open(os.path.join(path, "package.json"), "w") as f:
        json.dump(pkg, f)
    
    assert detect_test_framework(path) == "vitest"
    shutil.rmtree(path)
    print("PASSED: Vitest detection")

def test_detect_unknown():
    path = "./test_detect_unknown"
    os.makedirs(path, exist_ok=True)
    
    assert detect_test_framework(path) == "unknown"
    shutil.rmtree(path)
    print("PASSED: Unknown repo detection")

def test_bug_check_path_type():
    """Verify detect_test_framework works with absolute paths and Path objects."""
    path = os.path.abspath("./test_detect_bug")
    os.makedirs(path, exist_ok=True)
    with open(os.path.join(path, "requirements.txt"), "w") as f:
        f.write("pytest")
        
    # Test with string absolute path
    assert detect_test_framework(path) == "pytest"
    
    shutil.rmtree(path)
    print("PASSED: Bug check (path type)")

if __name__ == "__main__":
    test_detect_pytest_requirements()
    test_detect_jest()
    test_detect_vitest()
    test_detect_unknown()
    test_bug_check_path_type()
    print("ALL FRAMEWORK DETECTION TESTS PASSED")
