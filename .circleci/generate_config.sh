#!/bin/bash

# TODO: This is flaky as it relies on coarse directory-level diffs.

SKIPHEAD="$(git -C skip rev-parse HEAD)"

BASE="$(git merge-base main HEAD)"

shopt -s globstar
declare -A SK_CHANGED
do_check=false
check_all=$([ "$SKIPHEAD" != "fbdfd2e2fac25e93923fa3e378e8ca5570e87430" ] && echo "true" || echo "false");

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

if ${SK_CHANGED[base]}; then
  SK_CHANGED[common]=true
fi

if ${SK_CHANGED[common]}; then
  SK_CHANGED[font]=true
  SK_CHANGED["opengl/gsls"]=true
fi

if ${SK_CHANGED[font]}; then
  SK_CHANGED[mtsdf]=true
fi

if ${SK_CHANGED[mtsdf]}; then
  SK_CHANGED[framework]=true
  SK_CHANGED[opengl]=true
fi

if ${SK_CHANGED[opengl]}; then
  SK_CHANGED[x11gl]=true
  SK_CHANGED[engine]=true
fi

if ${SK_CHANGED[framework]}; then
  SK_CHANGED[engine]=true
fi

if ${SK_CHANGED[x11gl]}; then
  SK_CHANGED[views]=true
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

if ${SK_CHANGED[common]}
then
    cat <<EOF
  common:
    jobs:
      - skui_common
      - skui_common-wasm
EOF
fi

if ${SK_CHANGED[font]}
then
    cat <<EOF
  font:
    jobs:
      - skui_font
      - skui_font-wasm
EOF
fi

if ${SK_CHANGED[mtsdf]}
then
    cat <<EOF
  mtsdf:
    jobs:
      - skui_mtsdf
      - skui_mtsdf-wasm
EOF
fi

if ${SK_CHANGED["opengl/gsls"]}
then
    cat <<EOF
  glsl:
    jobs:
      - skui_glsl
      - skui_glsl-wasm
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
