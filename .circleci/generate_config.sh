#!/usr/bin/env bash

set -euo pipefail

# Require Bash 4+
if [[ ${BASH_VERSINFO[0]} -lt 4 ]]; then
  echo "Bash 4 or newer is required. Your version: $BASH_VERSION"
  exit 1
fi

# Enable recursive globbing and ignore unmatched globs
shopt -s globstar nullglob

SKIPHEAD="$(git -C skip rev-parse HEAD)"
BASE="$(git merge-base main HEAD)"

declare -A SK_CHANGED
do_check=false
check_all=$([ "$SKIPHEAD" != "513a8556a47a9211d73c57177038bf8b9f4bb5a7" ] && echo "true" || echo "false")

for skargo_toml in **/Skargo.toml; do
  dir=$(dirname "$skargo_toml")

  if git diff --name-only "$BASE" HEAD | grep -q "^$dir/"; then
    SK_CHANGED["$dir"]=true
  elif [ "$check_all" = "true" ]; then
    SK_CHANGED["$dir"]=true
  else
    SK_CHANGED["$dir"]=false
  fi

  if [ "${SK_CHANGED[$dir]}" = "true" ]; then
    do_check=true
  fi
done

# Exit early if nothing changed
if ! $do_check; then
  circleci-agent step halt
  exit 0
fi

# Dependency propagation
if [[ "${SK_CHANGED[base]:-false}" == "true" ]]; then
  SK_CHANGED[common]=true
fi

if [[ "${SK_CHANGED[common]:-false}" == "true" ]]; then
  SK_CHANGED[font]=true
  SK_CHANGED["opengl/gsls"]=true
fi

if [[ "${SK_CHANGED[font]:-false}" == "true" ]]; then
  SK_CHANGED[mtsdf]=true
fi

if [[ "${SK_CHANGED[mtsdf]:-false}" == "true" ]]; then
  SK_CHANGED[framework]=true
  SK_CHANGED[opengl]=true
fi

if [[ "${SK_CHANGED[opengl]:-false}" == "true" ]]; then
  SK_CHANGED[x11gl]=true
  SK_CHANGED[engine]=true
fi

if [[ "${SK_CHANGED[framework]:-false}" == "true" ]]; then
  SK_CHANGED[engine]=true
fi

if [[ "${SK_CHANGED[x11gl]:-false}" == "true" ]]; then
  SK_CHANGED[views]=true
fi

# Output the CircleCI workflow YAML
cat .circleci/base.yml

echo "workflows:"

if $do_check; then
  cat <<EOF
  checks:
    jobs:
      - lint
      - check-fmt
EOF
fi

if [[ "${SK_CHANGED[common]:-false}" == "true" ]]; then
  cat <<EOF
  common:
    jobs:
      - skui_common
      - skui_common-wasm
EOF
fi

if [[ "${SK_CHANGED[font]:-false}" == "true" ]]; then
  cat <<EOF
  font:
    jobs:
      - skui_font
      - skui_font-wasm
EOF
fi

if [[ "${SK_CHANGED[mtsdf]:-false}" == "true" ]]; then
  cat <<EOF
  mtsdf:
    jobs:
      - skui_mtsdf
      - skui_mtsdf-wasm
EOF
fi

if [[ "${SK_CHANGED["opengl/gsls"]:-false}" == "true" ]]; then
  cat <<EOF
  glsl:
    jobs:
      - skui_glsl
      - skui_glsl-wasm
EOF
fi

if [[ "${SK_CHANGED[engine]:-false}" == "true" ]]; then
  cat <<EOF
  engine:
    jobs:
      - skui_eng
EOF
fi
