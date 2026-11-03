import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


GATE = Path(__file__).resolve().parents[1] / "security_gate.py"
spec = importlib.util.spec_from_file_location("security_gate", GATE)
assert spec is not None and spec.loader is not None
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class SecurityGateTests(unittest.TestCase):
    def test_zap_below_high_passes(self):
        gate.validate_zap({"@generated": "test", "@version": "test", "site": [
            {"alerts": [{"riskcode": "2"}]},
        ]})

    def test_zap_high_fails(self):
        with self.assertRaises(ValueError):
            gate.validate_zap({"@generated": "test", "@version": "test", "site": [
                {"alerts": [{"riskcode": "3"}]},
            ]})

    def test_zap_malformed_fails(self):
        for report in ({}, {"site": []}, {"@generated": "test", "@version": "test", "site": [
            {"alerts": [{"riskcode": "critical"}]},
        ]}):
            with self.assertRaises(ValueError):
                gate.validate_zap(report)

    def test_sbom_resolved_packages_pass(self):
        gate.validate_sbom({"bomFormat": "CycloneDX", "specVersion": "1.6",
                            "components": [{"name": "React", "version": "19.1.1"}]}, ["react"])

    def test_sbom_empty_missing_version_or_package_fails(self):
        for components in ([], [{"name": "react"}], [{"name": "other", "version": "1.0"}]):
            with self.assertRaises(ValueError):
                gate.validate_sbom({"bomFormat": "CycloneDX", "specVersion": "1.6",
                                    "components": components}, ["react"])

    def test_cli_missing_invalid_and_scanner_failure_return_one(self):
        with tempfile.TemporaryDirectory() as directory:
            report = Path(directory) / "report.json"
            for content in (None, "invalid", json.dumps({
                "@generated": "test", "@version": "test", "site": [],
            })):
                if content is not None:
                    report.write_text(content, encoding="utf-8")
                result = subprocess.run(
                    [sys.executable, str(GATE), "zap", str(report), "--scanner-exit", "3"],
                    capture_output=True, text=True, check=False,
                )
                self.assertEqual(result.returncode, 1)


if __name__ == "__main__":
    unittest.main()
