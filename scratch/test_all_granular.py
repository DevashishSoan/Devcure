import os
import subprocess
import sys

def main():
    test_dir = os.path.join("backend", "tests")
    tests = [f for f in os.listdir(test_dir) if f.startswith("test_") and f.endswith(".py")]
    
    env = os.environ.copy()
    env["PYTHONPATH"] = "backend"
    
    python_exe = os.path.join("backend", ".venv", "Scripts", "python.exe")
    if not os.path.exists(python_exe):
        python_exe = sys.executable
        
    print(f"Using python: {python_exe}")
    
    results = []
    for test_file in tests:
        full_path = os.path.join(test_dir, test_file)
        print(f"Running {test_file}...")
        result = subprocess.run([python_exe, full_path], capture_output=True, text=True, env=env)
        
        status = "PASS" if result.returncode == 0 else "FAIL"
        results.append((test_file, status, result.stdout, result.stderr))
        
    print("\n" + "="*40)
    print("DETAILED TEST RESULTS")
    print("="*40)
    for name, status, stdout, stderr in results:
        print(f"{name:30}: {status}")
        if status == "FAIL":
            print(f"--- STDOUT ---\n{stdout}")
            print(f"--- STDERR ---\n{stderr}")
            print("-" * 40)
    print("="*40)

if __name__ == "__main__":
    main()
