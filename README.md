# DevCure - Autonomous QA Platform

DevCure is a self-evolving AI platform that automatically detects, diagnoses, and repairs test failures within isolated sandbox environments.

## Architecture

- **Backend**: FastAPI (Python 3.12+) using LangGraph for agent orchestration.
- **Frontend**: Next.js 14 (App Router) with TailwindCSS and Lucide React.
- **Sandbox**: Isolated execution environments (Docker-ready, currently using local mock).

## Getting Started

### Backend Setup

1. Navigate to `/backend`
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to `/frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Configuration

See `.env.example` in both folders for required environment variables.
