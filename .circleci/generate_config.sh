#!/bin/bash

# TODO: This is flaky as it relies on coarse directory-level diffs.

SKIPHEAD="$(git -C skip rev-parse HEAD)"

BASE="$(git merge-base main HEAD)"

shopt -s globstar
declare -A SK_CHANGED
do_check=false
check_all=$([ "$SKIPHEAD" != "b724f31972f49ede18c764c6d4085c1cb2fd8ed1" ] && echo "true" || echo "false");

for skargo_toml in **/Skargo.toml; do
  dir=$(dirname "$skargo_toml")

  has_diff=$(git diff --quiet "$BASE" HEAD -- "$dir"; echo $?)

  if [ "$has_diff" -ne 0 ] || [ "$check_all" = "true" ]; then
    SK_CHANGED["$dir"]=true
  else
    SK_CHANGED["$dir"]=false
  fi

  if [ "${SK_CHANGED["$dir"]}" = "true" ]; then
    do_check=true
  fi
done

if ! $do_check; then
  circleci-agent step halt
  exit 0
fi

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

cat .circleci/base.yml

echo "workflows:"

if ${do_check}
then
    cat <<EOF
  checks:
    jobs:
      - lint
      - check-fmt
EOF
fi

if ${SK_CHANGED[skui_common]}
then
    cat <<EOF
  common:
    jobs:
      - skui_common
      - skui_common-wasm
EOF
fi

if ${SK_CHANGED[skui_font]}
then
    cat <<EOF
  font:
    jobs:
      - skui_font
      - skui_font-wasm
EOF
fi

if ${SK_CHANGED[skui_mtsdf]}
then
    cat <<EOF
  mtsdf:
    jobs:
      - skui_mtsdf
      - skui_mtsdf-wasm
EOF
fi

if ${SK_CHANGED[skui_opengl]}
then
    cat <<EOF
  glsl:
    jobs:
      - skui_opengl
      - skui_opengl-wasm
EOF
fi

if ${SK_CHANGED[skui_eng]}
then
    cat <<EOF
  engine:
    jobs:
      - skui_eng
EOF
fi
