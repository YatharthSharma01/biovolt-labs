import os
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient


class RegistryApiTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        os.environ["BIOVOLT_DB_PATH"] = str(Path(self.temp.name) / "test.db")
        from backend.app.main import app

        self.client_context = TestClient(app)
        self.client = self.client_context.__enter__()

    def tearDown(self):
        self.client_context.__exit__(None, None, None)
        self.temp.cleanup()
        os.environ.pop("BIOVOLT_DB_PATH", None)

    def test_experiment_crud_and_computed_cod_removal(self):
        payload = {
            "experiment_code": "MFC-TEST-001",
            "title": "Bench validation run",
            "status": "completed",
            "provenance": "measured",
            "organism": "Halophilic mixed isolate",
            "cod_in_mg_l": 500,
            "cod_out_mg_l": 125,
            "voltage_v": 0.61,
            "replicate_count": 3,
        }
        created = self.client.post("/api/experiments", json=payload)
        self.assertEqual(created.status_code, 201)
        record = created.json()
        self.assertEqual(record["cod_removal_percent"], 75.0)

        listed = self.client.get("/api/experiments")
        self.assertEqual(len(listed.json()), 1)

        updated = self.client.put(
            f"/api/experiments/{record['id']}", json={"cod_out_mg_l": 100}
        )
        self.assertEqual(updated.json()["cod_removal_percent"], 80.0)

        exported = self.client.get("/api/experiments.csv")
        self.assertEqual(exported.status_code, 200)
        self.assertIn("MFC-TEST-001", exported.text)

        deleted = self.client.delete(f"/api/experiments/{record['id']}")
        self.assertEqual(deleted.status_code, 204)

    def test_cod_literature_is_seeded_separately(self):
        response = self.client.get(
            "/api/literature-benchmarks",
            params={"metric": "cod_removal_percent", "paper_record": "BV-LIT-012"},
        )
        self.assertEqual(response.status_code, 200)
        values = {item["condition"]: item["value"] for item in response.json()}
        self.assertEqual(values["Air-cathode MFC at 1000 Ω after 24 h"], 50)
        self.assertEqual(values["Short-circuited air-cathode MFC after 24 h"], 72)
        self.assertEqual(values["Compact microbial electrochemical snorkel after 24 h"], 69)


if __name__ == "__main__":
    unittest.main()

