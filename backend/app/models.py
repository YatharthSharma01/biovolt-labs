from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Provenance = Literal["measured", "documented", "image-derived"]
StudyStatus = Literal["planned", "running", "completed", "archived"]


class ExperimentBase(BaseModel):
    experiment_code: str = Field(min_length=2, max_length=40)
    title: str = Field(min_length=3, max_length=180)
    status: StudyStatus = "planned"
    provenance: Provenance = "measured"
    started_on: date | None = None
    organism: str | None = Field(default=None, max_length=160)
    inoculum_source: str | None = Field(default=None, max_length=240)
    substrate: str | None = Field(default=None, max_length=160)
    substrate_concentration_mg_l: float | None = Field(default=None, ge=0)
    temperature_c: float | None = Field(default=None, ge=0, le=80)
    ph: float | None = Field(default=None, ge=0, le=14)
    conductivity_ms_cm: float | None = Field(default=None, ge=0)
    salinity_g_l: float | None = Field(default=None, ge=0)
    external_resistance_ohm: float | None = Field(default=None, ge=0)
    anode_material: str | None = Field(default=None, max_length=160)
    cathode_material: str | None = Field(default=None, max_length=160)
    anode_area_cm2: float | None = Field(default=None, gt=0)
    cathode_area_cm2: float | None = Field(default=None, gt=0)
    reactor_volume_ml: float | None = Field(default=None, gt=0)
    membrane_or_bridge: str | None = Field(default=None, max_length=200)
    hrt_hours: float | None = Field(default=None, gt=0)
    cod_in_mg_l: float | None = Field(default=None, ge=0)
    cod_out_mg_l: float | None = Field(default=None, ge=0)
    voltage_v: float | None = Field(default=None, ge=0)
    current_ma: float | None = Field(default=None, ge=0)
    power_density_mw_m2: float | None = Field(default=None, ge=0)
    replicate_count: int | None = Field(default=None, ge=1)
    notes: str | None = Field(default=None, max_length=4000)


class ExperimentCreate(ExperimentBase):
    pass


class ExperimentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=3, max_length=180)
    status: StudyStatus | None = None
    provenance: Provenance | None = None
    started_on: date | None = None
    organism: str | None = Field(default=None, max_length=160)
    inoculum_source: str | None = Field(default=None, max_length=240)
    substrate: str | None = Field(default=None, max_length=160)
    substrate_concentration_mg_l: float | None = Field(default=None, ge=0)
    temperature_c: float | None = Field(default=None, ge=0, le=80)
    ph: float | None = Field(default=None, ge=0, le=14)
    conductivity_ms_cm: float | None = Field(default=None, ge=0)
    salinity_g_l: float | None = Field(default=None, ge=0)
    external_resistance_ohm: float | None = Field(default=None, ge=0)
    anode_material: str | None = Field(default=None, max_length=160)
    cathode_material: str | None = Field(default=None, max_length=160)
    anode_area_cm2: float | None = Field(default=None, gt=0)
    cathode_area_cm2: float | None = Field(default=None, gt=0)
    reactor_volume_ml: float | None = Field(default=None, gt=0)
    membrane_or_bridge: str | None = Field(default=None, max_length=200)
    hrt_hours: float | None = Field(default=None, gt=0)
    cod_in_mg_l: float | None = Field(default=None, ge=0)
    cod_out_mg_l: float | None = Field(default=None, ge=0)
    voltage_v: float | None = Field(default=None, ge=0)
    current_ma: float | None = Field(default=None, ge=0)
    power_density_mw_m2: float | None = Field(default=None, ge=0)
    replicate_count: int | None = Field(default=None, ge=1)
    notes: str | None = Field(default=None, max_length=4000)


class ExperimentRead(ExperimentBase):
    id: str
    cod_removal_percent: float | None
    created_at: datetime
    updated_at: datetime


class LiteratureBenchmarkRead(BaseModel):
    id: int
    paper_record: str
    metric: str
    value: float
    unit: str
    condition: str
    endpoint_hours: float | None
    initial_cod_mg_l: str | None
    citation: str
    doi: str
    interpretation: str

