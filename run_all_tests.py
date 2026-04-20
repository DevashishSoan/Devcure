import subprocess
import sys
import os

def run_test(name, path):
    print(f"\n=== RUNNING {name} ===")
    env = os.environ.copy()
    env["PYTHONPATH"] = "backend"
    try:
        # Use the virtual environment python
        python_exe = os.path.join("backend", ".venv", "Scripts", "python.exe")
        if not os.path.exists(python_exe):
            python_exe = sys.executable
            
        result = subprocess.run(
            [python_exe, path],
            capture_output=True,
            text=True,
            env=env
        )
        print(result.stdout)
        if result.stderr:
            print("ERRORS:")
            print(result.stderr)
        
        if result.returncode == 0:
            print(f"RESULT: {name} PASSED")
            return True
        else:
            print(f"RESULT: {name} FAILED (Exit Code: {result.returncode})")
            return False
    except Exception as e:
        print(f"RESULT: {name} ERROR: {e}")
        return False

def main():
    tests = [
        ("Webhook Security", "backend/tests/test_webhook_security.py"),
        ("Sandbox Security", "backend/tests/test_sandbox_security.py"),
        ("AI Repair Loop", "backend/tests/simulate_run.py"),
        ("Framework Detection", "backend/tests/test_framework_detection.py"),
        ("Database & RLS", "backend/tests/test_database_rls.py"),
    ]
    
    summary = []
    for name, path in tests:
        success = run_test(name, path)
        summary.append((name, success))
        
    print("\n" + "="*30)
    print("FINAL TEST SUMMARY")
    print("="*30)
    for name, success in summary:
        status = "PASSED" if success else "FAILED"
        print(f"{name:25} : {status}")
    print("="*30)

if __name__ == "__main__":
    main()
