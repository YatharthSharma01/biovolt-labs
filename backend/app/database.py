from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from collections.abc import Iterator
from typing import Any


DEFAULT_DB_PATH = Path(__file__).resolve().parents[1] / "data" / "biovolt.db"


def database_path() -> Path:
    return Path(os.environ.get("BIOVOLT_DB_PATH", DEFAULT_DB_PATH))


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


EXPERIMENT_COLUMNS = (
    "experiment_code", "title", "status", "provenance", "started_on", "organism",
    "inoculum_source", "substrate", "substrate_concentration_mg_l", "temperature_c",
    "ph", "conductivity_ms_cm", "salinity_g_l", "external_resistance_ohm",
    "anode_material", "cathode_material", "anode_area_cm2", "cathode_area_cm2",
    "reactor_volume_ml", "membrane_or_bridge", "hrt_hours", "cod_in_mg_l",
    "cod_out_mg_l", "voltage_v", "current_ma", "power_density_mw_m2",
    "replicate_count", "notes",
)


def init_db() -> None:
    with connect() as db:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS experiments (
                id TEXT PRIMARY KEY,
                experiment_code TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                status TEXT NOT NULL,
                provenance TEXT NOT NULL,
                started_on TEXT,
                organism TEXT,
                inoculum_source TEXT,
                substrate TEXT,
                substrate_concentration_mg_l REAL,
                temperature_c REAL,
                ph REAL,
                conductivity_ms_cm REAL,
                salinity_g_l REAL,
                external_resistance_ohm REAL,
                anode_material TEXT,
                cathode_material TEXT,
                anode_area_cm2 REAL,
                cathode_area_cm2 REAL,
                reactor_volume_ml REAL,
                membrane_or_bridge TEXT,
                hrt_hours REAL,
                cod_in_mg_l REAL,
                cod_out_mg_l REAL,
                voltage_v REAL,
                current_ma REAL,
                power_density_mw_m2 REAL,
                replicate_count INTEGER,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS literature_benchmarks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                paper_record TEXT NOT NULL,
                metric TEXT NOT NULL,
                value REAL NOT NULL,
                unit TEXT NOT NULL,
                condition TEXT NOT NULL,
                endpoint_hours REAL,
                initial_cod_mg_l TEXT,
                citation TEXT NOT NULL,
                doi TEXT NOT NULL,
                interpretation TEXT NOT NULL,
                UNIQUE(paper_record, metric, condition)
            )
            """
        )
        db.execute("CREATE INDEX IF NOT EXISTS experiments_status_idx ON experiments(status)")
        db.execute("CREATE INDEX IF NOT EXISTS benchmarks_metric_idx ON literature_benchmarks(metric)")
        seed_literature_benchmarks(db)


def seed_literature_benchmarks(db: sqlite3.Connection) -> None:
    citation = "Erable, B., Etcheverry, L. & Bergel, A. (2011). Biofouling, 27(3), 319–326."
    doi = "10.1080/08927014.2011.564615"
    rows = [
        ("cod_removal_percent", 15, "%", "Anaerobic control after 24 h", 24, "290–330", "Background removal without a microbial electrode."),
        ("cod_removal_percent", 50, "%", "Air-cathode MFC at 1000 Ω after 24 h", 24, "290–330", "Maximum-power operating condition."),
        ("cod_removal_percent", 72, "%", "Short-circuited air-cathode MFC after 24 h", 24, "290–330", "Maximum-treatment condition; no harvestable electrical power."),
        ("cod_removal_percent", 69, "%", "Compact microbial electrochemical snorkel after 24 h", 24, "290–330", "Treatment-focused MES condition."),
        ("cod_removal_rate", 80, "mg COD/L/day", "Polarized microbial electrode", None, None, "Compared with an electrode-free control in the same study."),
        ("cod_removal_rate", 16, "mg COD/L/day", "Electrode-free control", None, None, "Non-electrochemical background degradation."),
        ("coulombic_efficiency_low", 61, "%", "Microbial electrolysis batches", None, None, "Lower end of the reported batch range."),
        ("coulombic_efficiency_high", 74, "%", "Microbial electrolysis batches", None, None, "Upper end of the reported batch range."),
    ]
    db.executemany(
        """
        INSERT OR IGNORE INTO literature_benchmarks
        (paper_record, metric, value, unit, condition, endpoint_hours, initial_cod_mg_l, citation, doi, interpretation)
        VALUES ('BV-LIT-012', ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [row[:6] + (citation, doi, row[6]) for row in rows],
    )


def row_dict(row: sqlite3.Row) -> dict[str, Any]:
    return dict(row)
