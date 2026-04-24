"""
Demo endpoint — returns a pre-recorded healing cycle fixture.
No authentication required. Used by the landing page "Try Demo" feature.
"""

import time
from fastapi import APIRouter

router = APIRouter()

DEMO_TRACE = [
    {
        "event": "queued",
        "timestamp": 0.0,
        "log": "Repair job queued. Allocating sandbox environment...",
    },
    {
        "event": "baseline_captured",
        "timestamp": 3.2,
        "log": "Detected pytest. Found 1 baseline failure. Indexed 24 codebase files.\n\nFAILED tests/test_api.py::test_get_user_profile - AssertionError: assert 404 == 200",
    },
    {
        "event": "diagnosed",
        "timestamp": 7.8,
        "log": (
            "TARGET_FILE: app/routes/users.py\n\n"
            "DIAGNOSIS: The /api/users/{id}/profile endpoint was recently refactored. "
            "The route decorator changed from @router.get('/users/{id}/profile') to "
            "@router.get('/users/{user_id}/profile') but the test fixture still calls "
            "the old path. The fix is to update the route parameter name to match the "
            "function signature, restoring backward compatibility."
        ),
    },
    {
        "event": "repair_applied",
        "timestamp": 14.1,
        "log": (
            "[Confidence: 94%]\n"
            "--- a/app/routes/users.py\n"
            "+++ b/app/routes/users.py\n"
            "@@ -18,7 +18,7 @@\n"
            "-@router.get('/users/{id}/profile')\n"
            "+@router.get('/users/{user_id}/profile')\n"
            " async def get_user_profile(user_id: str, db: Session = Depends(get_db)):\n"
            "     user = db.query(User).filter(User.id == user_id).first()\n"
            "     if not user:\n"
            "         raise HTTPException(status_code=404)\n"
        ),
    },
    {
        "event": "completed",
        "timestamp": 21.6,
        "log": "Verification SUCCESS: All target tests passed! No regressions introduced.\n\n✓ tests/test_api.py::test_get_user_profile PASSED\n✓ tests/test_api.py::test_list_users PASSED\n✓ tests/test_api.py::test_create_user PASSED",
    },
]

DEMO_RUN = {
    "id": "demo-run-001",
    "repo": "your-org/api-service",
    "branch": "main",
    "run_type": "DEMO",
    "status": "completed",
    "framework_detected": "pytest",
    "mttr_seconds": 21.6,
    "confidence_score": 94,
    "pr_url": "https://github.com/your-org/api-service/pull/42",
    "baseline_failures": ["tests/test_api.py::test_get_user_profile"],
    "repair_diff": (
        "--- a/app/routes/users.py\n"
        "+++ b/app/routes/users.py\n"
        "@@ -18,7 +18,7 @@\n"
        "-@router.get('/users/{id}/profile')\n"
        "+@router.get('/users/{user_id}/profile')\n"
        " async def get_user_profile(user_id: str, db: Session = Depends(get_db)):\n"
        "     user = db.query(User).filter(User.id == user_id).first()\n"
    ),
    "diagnosis": (
        "The /api/users/{id}/profile endpoint was refactored. The route parameter "
        "name changed from {id} to {user_id} but the test fixture still calls the old path. "
        "Fixing the route decorator restores backward compatibility."
    ),
    "trajectory": DEMO_TRACE,
}


@router.get("/demo/healing-cycle")
async def get_demo_healing_cycle():
    """
    Returns a pre-recorded healing cycle for the landing page demo.
    Simulates the full DevCure agent workflow: queue → baseline → diagnose → repair → verify.
    No authentication required.
    """
    return {
        "run": DEMO_RUN,
        "trace": DEMO_TRACE,
        "meta": {
            "description": "Pre-recorded demo healing cycle. Real runs connect to your GitHub repository.",
            "total_steps": len(DEMO_TRACE),
            "total_duration_seconds": 21.6,
            "frameworks_supported": ["pytest", "jest", "vitest"],
        },
    }


@router.get("/demo/stats")
async def get_demo_stats():
    """Returns illustrative platform statistics for the landing page."""
    return {
        "tests_healed_total": 50_000,
        "avg_mttr_seconds": 47,
        "heal_success_rate": 0.91,
        "hours_saved_total": 37_500,
        "frameworks": ["pytest", "jest", "vitest"],
    }
