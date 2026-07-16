from __future__ import annotations

import csv
import io
import sqlite3
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware

from .database import EXPERIMENT_COLUMNS, connect, init_db, row_dict
from .models import ExperimentCreate, ExperimentRead, ExperimentUpdate, LiteratureBenchmarkRead


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def with_cod_removal(row: dict) -> dict:
    cod_in = row.get("cod_in_mg_l")
    cod_out = row.get("cod_out_mg_l")
    row["cod_removal_percent"] = (
        round((cod_in - cod_out) / cod_in * 100, 2)
        if cod_in is not None and cod_out is not None and cod_in > 0
        else None
    )
    return row


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="BioVolt AI Experiment Registry",
    version="0.1.0",
    description="Provenance-aware MFC experiment records and separate literature benchmarks.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:4173", "http://127.0.0.1:4173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "biovolt-registry"}


@app.get("/api/experiments", response_model=list[ExperimentRead])
def list_experiments(status_filter: str | None = Query(default=None, alias="status")):
    with connect() as db:
        if status_filter:
            rows = db.execute(
                "SELECT * FROM experiments WHERE status = ? ORDER BY created_at DESC", (status_filter,)
            ).fetchall()
        else:
            rows = db.execute("SELECT * FROM experiments ORDER BY created_at DESC").fetchall()
    return [with_cod_removal(row_dict(row)) for row in rows]


@app.post("/api/experiments", response_model=ExperimentRead, status_code=status.HTTP_201_CREATED)
def create_experiment(payload: ExperimentCreate):
    now = utc_now()
    experiment_id = str(uuid.uuid4())
    values = payload.model_dump(mode="json")
    placeholders = ", ".join("?" for _ in EXPERIMENT_COLUMNS)
    try:
        with connect() as db:
            db.execute(
                f"INSERT INTO experiments (id, {', '.join(EXPERIMENT_COLUMNS)}, created_at, updated_at) VALUES (?, {placeholders}, ?, ?)",
                (experiment_id, *(values[column] for column in EXPERIMENT_COLUMNS), now, now),
            )
            row = db.execute("SELECT * FROM experiments WHERE id = ?", (experiment_id,)).fetchone()
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=409, detail="Experiment code already exists") from exc
    return with_cod_removal(row_dict(row))


@app.get("/api/experiments/{experiment_id}", response_model=ExperimentRead)
def get_experiment(experiment_id: str):
    with connect() as db:
        row = db.execute("SELECT * FROM experiments WHERE id = ?", (experiment_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return with_cod_removal(row_dict(row))


@app.put("/api/experiments/{experiment_id}", response_model=ExperimentRead)
def update_experiment(experiment_id: str, payload: ExperimentUpdate):
    changes = payload.model_dump(mode="json", exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No changes supplied")
    changes["updated_at"] = utc_now()
    assignment = ", ".join(f"{column} = ?" for column in changes)
    with connect() as db:
        result = db.execute(
            f"UPDATE experiments SET {assignment} WHERE id = ?",
            (*changes.values(), experiment_id),
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Experiment not found")
        row = db.execute("SELECT * FROM experiments WHERE id = ?", (experiment_id,)).fetchone()
    return with_cod_removal(row_dict(row))


@app.delete("/api/experiments/{experiment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment(experiment_id: str):
    with connect() as db:
        result = db.execute("DELETE FROM experiments WHERE id = ?", (experiment_id,))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/experiments.csv")
def export_experiments_csv():
    with connect() as db:
        rows = [with_cod_removal(row_dict(row)) for row in db.execute("SELECT * FROM experiments ORDER BY created_at")]
    output = io.StringIO()
    fieldnames = ["id", *EXPERIMENT_COLUMNS, "cod_removal_percent", "created_at", "updated_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
    return Response(
        output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=biovolt-experiments.csv"},
    )


@app.get("/api/literature-benchmarks", response_model=list[LiteratureBenchmarkRead])
def list_literature_benchmarks(metric: str | None = None, paper_record: str | None = None):
    clauses: list[str] = []
    params: list[str] = []
    if metric:
        clauses.append("metric = ?")
        params.append(metric)
    if paper_record:
        clauses.append("paper_record = ?")
        params.append(paper_record)
    where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
    with connect() as db:
        rows = db.execute(
            f"SELECT * FROM literature_benchmarks{where} ORDER BY paper_record, id", params
        ).fetchall()
    return [row_dict(row) for row in rows]

