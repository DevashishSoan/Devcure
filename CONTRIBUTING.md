# Contributing to DevCure

Thank you for your interest in DevCure. Contributions are welcome and appreciated.

## Getting Started

1. **Fork the repository** and clone it locally.
2. **Set up the backend:** `cd backend && python -m venv .venv && pip install -r requirements.txt`
3. **Set up the frontend:** `cd frontend && npm install`
4. **Copy environment files:** `cp backend/.env.example backend/.env` and fill in your keys.

## Making Changes

- Create a branch: `git checkout -b feat/your-feature-name`
- Keep commits atomic and descriptive.
- Follow the existing code style (Python: PEP8; TypeScript: Prettier defaults).

## Running Tests

```bash
# Backend
cd backend
python -m pytest tests/ -v

# Frontend (type check)
cd frontend
npm run build
```

## Submitting a Pull Request

1. Ensure tests pass locally.
2. Open a PR against `main` with a clear title and description.
3. Reference any related issues using `Closes #issue-number`.
4. A maintainer will review within 48 hours.

## Reporting Bugs

Open a GitHub Issue with:
- Steps to reproduce
- Expected vs. actual behaviour
- Backend logs (from `python main.py`) and browser console output

## Code of Conduct

Be respectful and constructive. We're building something real together.
