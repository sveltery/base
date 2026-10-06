#!/usr/bin/env bash
# Native pnpm packing plus reuse of the exact artifacts in combined consumer checks.
source "$(dirname "${BASH_SOURCE[0]}")/toolchain.sh"

sveltery_create_package_artifacts() {
  local directory="$1" package_name="$2"
  mkdir -p "$directory"
  directory="$(cd "$directory" && pwd)"
  pnpm --filter-prod "$package_name..." --fail-if-no-match list --depth -1 --json > "$directory/.workspace-packages.json"
  pnpm --recursive --filter-prod "$package_name..." --fail-if-no-match --sort --workspace-concurrency 1 pack --pack-destination "$directory"
  node "$sveltery_repo_root/scripts/package-artifacts.mjs" record "$directory/.workspace-packages.json" "$directory"
  rm "$directory/.workspace-packages.json"
  export SVELTERY_PACKAGE_ARTIFACTS="$directory/artifacts.json"
}

sveltery_pack_package() {
  local package_name="$1" directory="$2"
  if [[ -z "${SVELTERY_PACKAGE_ARTIFACTS:-}" ]]; then
    sveltery_create_package_artifacts "$directory/.workspace-artifacts" "$package_name"
  fi
  node "$sveltery_repo_root/scripts/package-artifacts.mjs" copy "$SVELTERY_PACKAGE_ARTIFACTS" "$package_name" "$directory"
}

sveltery_prepare_consumer() {
  node "$sveltery_repo_root/scripts/package-artifacts.mjs" consumer "$SVELTERY_PACKAGE_ARTIFACTS" "$1"
}
