# BioVolt AI Experiment Registry

This FastAPI service keeps researcher-entered MFC experiments in SQLite and stores literature benchmarks in a separate table. The separation prevents published values from being mistaken for measurements produced by the user's own reactor.

## Run locally

1. Create and activate a Python virtual environment.
2. Install `backend/requirements.txt`.
3. From the repository root, run `uvicorn backend.app.main:app --reload`.
4. Open `http://127.0.0.1:8000/docs` for the generated API interface.

Set `BIOVOLT_DB_PATH` to choose a different SQLite file. The default database is `backend/data/biovolt.db`.

