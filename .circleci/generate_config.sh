#!/bin/bash

# TODO: This is flaky as it relies on coarse directory-level diffs.

BASE="$(git merge-base main HEAD)"

shopt -s globstar
declare -A SK_CHANGED
for skargo_toml in **/Skargo.toml; do
  dir=$(dirname "$skargo_toml")
  git diff --quiet HEAD "$BASE" -- "$dir" :^"$dir/ts" \
    && SK_CHANGED["$dir"]=false || SK_CHANGED["$dir"]=true
done

if ${SK_CHANGED[skui_base]}; then
  SK_CHANGED[skui_common]=true
fi

if ${SK_CHANGED[skui_common]}; then
  SK_CHANGED[skui_font]=true
fi

if ${SK_CHANGED[skui_font]}; then
  SK_CHANGED[skui_mtsdf]=true
fi

if ${SK_CHANGED[skui_mtsdf]}; then
  SK_CHANGED[skui_fwk]=true
  SK_CHANGED[skui_opengl]=true
fi

if ${SK_CHANGED[skui_opengl]}; then
  SK_CHANGED[skui_x11gl]=true
  SK_CHANGED[skui_eng]=true
fi

if ${SK_CHANGED[skui_fwk]}; then
  SK_CHANGED[skui_eng]=true
fi

if ${SK_CHANGED[skui_x11gl]}; then
  SK_CHANGED[skui_views]=true
fi

check_ts=true

cat .circleci/base.yml

echo "workflows:"

if $check_ts
then
    cat <<EOF
  linter:
    jobs:
      - lint
EOF
fi

if ${TS_CHANGED[skui_common]}
then
    cat <<EOF
  common:
    jobs:
      - skui_common
      - skui_common-wasm
EOF
fi

if ${TS_CHANGED[skui_font]}
then
    cat <<EOF
  font:
    jobs:
      - skui_font
      - skui_font-wasm
EOF
fi

if ${TS_CHANGED[skui_mtsdf]}
then
    cat <<EOF
  mtsdf:
    jobs:
      - skui_mtsdf
      - skui_mtsdf-wasm
EOF
fi

if ${TS_CHANGED[skui_opengl]}
then
    cat <<EOF
  glsl:
    jobs:
      - skui_opengl
      - skui_opengl-wasm
EOF
fi

if ${TS_CHANGED[skui_eng]}
then
    cat <<EOF
  engine:
    jobs:
      - skui_eng
EOF
fi
