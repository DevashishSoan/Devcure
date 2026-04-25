import asyncio
import argparse
import os
import sys

# Add backend to path so we can import core
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from core.repair_logic import repair_code_snippet

async def main():
    parser = argparse.ArgumentParser(description="DevCure Standalone Auto-Repair Utility")
    parser.add_argument("file", help="Path to the file to repair")
    parser.add_argument("--error", required=True, help="Error message or path to error log file")
    parser.add_argument("--provider", default="gemini", help="AI provider (gemini, minimax, gemma)")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file):
        print(f"Error: File {args.file} not found.")
        return

    # Read code
    with open(args.file, "r") as f:
        code = f.read()
        
    # Read error
    if os.path.exists(args.error):
        with open(args.error, "r") as f:
            error_log = f.read()
    else:
        error_log = args.error

    print(f"--- Diagnosing {args.file} ---")
    
    result = await repair_code_snippet(
        code=code,
        error_log=error_log,
        file_name=args.file,
        ai_provider=args.provider
    )
    
    print("\n[DIAGNOSIS]")
    print(result["diagnosis"])
    
    print(f"\n[CONFIDENCE: {result['confidence_score']}%]")
    
    print("\n[PATCH]")
    if result["patch"]:
        print(result["patch"])
    else:
        print("No patch generated.")
        
    if not result["safety_passed"]:
        print(f"\n[SAFETY WARNING]: {result['safety_reason']}")

if __name__ == "__main__":
    asyncio.run(main())
