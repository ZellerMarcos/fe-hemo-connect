import argparse
import json
import sys
from pathlib import Path


def validate_zap(report: object) -> None:
    if not isinstance(report, dict) or not isinstance(report.get("site"), list):
        raise ValueError("ZAP report is missing the site array.")
    if not report.get("@generated") or not report.get("@version"):
        raise ValueError("ZAP report has no generation/version metadata.")
    for site in report["site"]:
        if not isinstance(site, dict) or not isinstance(site.get("alerts"), list):
            raise ValueError("ZAP site has no alerts array.")
        for alert in site["alerts"]:
            if not isinstance(alert, dict) or str(alert.get("riskcode")) not in {"0", "1", "2", "3"}:
                raise ValueError("ZAP alert has an invalid risk.")
            if str(alert["riskcode"]) == "3":
                raise ValueError("ZAP High alert blocks this check.")


def validate_sbom(report: object, expected: list[str]) -> None:
    if not isinstance(report, dict) or report.get("bomFormat") != "CycloneDX":
        raise ValueError("Expected a CycloneDX SBOM.")
    if report.get("specVersion") not in {"1.4", "1.5", "1.6", "1.7"}:
        raise ValueError("Unsupported CycloneDX version.")
    components = report.get("components")
    if not isinstance(components, list) or not components:
        raise ValueError("SBOM must contain components.")
    names = set()
    for component in components:
        if not isinstance(component, dict) or not component.get("name"):
            raise ValueError("Every SBOM component must have a name.")
        if component.get("type") == "application":
            continue
        if not component.get("version"):
            raise ValueError("Every dependency must have a resolved version.")
        names.add(component["name"].lower())
    missing = set(name.lower() for name in expected) - names
    if missing:
        raise ValueError(f"SBOM is missing expected packages: {', '.join(sorted(missing))}.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("kind", choices=["zap", "sbom"])
    parser.add_argument("report", type=Path)
    parser.add_argument("--scanner-exit", type=int, default=0)
    parser.add_argument("--expect", nargs="*", default=[])
    args = parser.parse_args()
    try:
        report = json.loads(args.report.read_text(encoding="utf-8"))
        if args.kind == "zap":
            validate_zap(report)
        else:
            validate_sbom(report, args.expect)
        if args.scanner_exit != 0:
            raise ValueError(f"Scanner failed with exit code {args.scanner_exit}.")
    except (OSError, ValueError, TypeError) as error:
        print(f"Security gate FAILED: {error}", file=sys.stderr)
        return 1
    print(f"Security gate passed: {args.kind}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
