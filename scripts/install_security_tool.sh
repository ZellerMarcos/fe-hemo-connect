#!/usr/bin/env bash
set -euo pipefail
tool="${1:?Expected bearer or trivy}"
destination="${2:?Expected binary destination}"
temporary="$(mktemp -d)"
trap 'rm -rf "$temporary"' EXIT
case "$tool" in
  bearer)
    url="https://github.com/Bearer/bearer/releases/download/v2.1.3/bearer_2.1.3_linux_amd64.tar.gz"
    sha="974d4ad7bb71bc578675684d444e345e8fbad91c85557aac035406ef5cc04c68"
    ;;
  trivy)
    url="https://github.com/aquasecurity/trivy/releases/download/v0.76.1/trivy_0.76.1_Linux-64bit.tar.gz"
    sha="c7cbe3137fb8a48a17574bede3dd6beb16742d1e9772929940fc90082c39d9c0"
    ;;
  *) echo "Unsupported security tool: $tool" >&2; exit 1 ;;
esac
curl --fail --location --retry 3 --retry-all-errors "$url" --output "$temporary/tool.tar.gz"
printf '%s  %s\n' "$sha" "$temporary/tool.tar.gz" | sha256sum --check --strict
tar -xzf "$temporary/tool.tar.gz" -C "$temporary" "$tool"
mkdir -p "$destination"
install -m 0755 "$temporary/$tool" "$destination/$tool"
if [[ "$tool" == bearer ]]; then
  rules_revision="82c335f781a61a6d8b052394f84fd1d93edec467"
  curl --fail --location --retry 3 --retry-all-errors \
    "https://codeload.github.com/Bearer/bearer-rules/tar.gz/$rules_revision" \
    --output "$temporary/rules.tar.gz"
  printf '%s  %s\n' "a78013eaf6a8ef9cf1b42b7b61e4e624497311d66742161476013fde92998415" \
    "$temporary/rules.tar.gz" | sha256sum --check --strict
  tar -xzf "$temporary/rules.tar.gz" -C "$temporary"
  mkdir -p "$destination/bearer-rules"
  cp -R "$temporary/bearer-rules-$rules_revision/rules" "$destination/bearer-rules/"
  cp "$temporary/bearer-rules-$rules_revision/LICENSE.txt" "$destination/bearer-rules/"
fi
