# Scripts

Utility scripts for development and operations. Do not commit output from these to the repo.

## `simulate_run.py`

Runs a full end-to-end healing cycle simulation with mocked AI and GitHub responses. Safe to run locally without real credentials.

```bash
python scripts/simulate_run.py
```

## `check_run.py`

Check the status of a run by its UUID.

```bash
python scripts/check_run.py --run-id <uuid>
```

## `test_webhook.py`

Fire a test GitHub push webhook payload at the local backend to verify the webhook handler.

```bash
python scripts/test_webhook.py --url http://localhost:8000
```

## `verify_production.py`

Run a suite of health checks against the production deployment.

```bash
python scripts/verify_production.py --url https://your-backend.onrender.com
```

## `run_all_tests.py`

Run all backend test suites.

```bash
python scripts/run_all_tests.py
```
