# Default profile for Skargo builds (can be overridden by setting SKARGO_PROFILE)
SKARGO_PROFILE?=dev

# Find all Skargo.toml files except in the ./skip directory and excluding paths containing 'wasm'
SKARGO_TARGETS := $(shell find . -path ./skip -prune -o -name 'Skargo.toml' ! -path '*wasm*' -print)

# Directory containing engine documentation
ENG_DOCUMENTS_DIR=engine/docs

# List of engine documentation files
ENG_DOCUMENTS=\
	index.md \
	quick_start.md \
	layout.md \
	color.md \
	size.md \
	center.md \
	flex.md \
	wrap.md \
	stack.md \
	scroll.md \
	split.md \
	aspectratio.md \
	label.md \
	image.md \
	button.md \
	checkbox.md \
	radio.md \
	input.md \
	slider.md \
	indicator.md \
	slider.md \
	tabs.md \
	tree.md \
	ddelement.md \
	decorated.md \
	constrained.md

# Full paths to the documentation files
ENG_PANDOC_FILES=$(addprefix $(ENG_DOCUMENTS_DIR)/,$(ENG_DOCUMENTS))

# Target to initialize the project by linking the skip directory
.PHONY: init
init:
	@if [ "$(SKIP)" = "" ]; then\
        $(error SKIP must be defined.);\
  fi
	ln -s $(realpath $(SKIP)) skip

# Install Playwright dependencies
.PHONY: playwright
playwright:
	npx playwright install-deps && npx playwright install

# Setup the project by installing dependencies and building
.PHONY: setup
setup:
	npm i && npm run build

# Build the Skip language components
.PHONY: skip
skip:
	npm i && npm run build -w @skiplang/std -w @skip-wasm/std

# Build common components
.PHONY: common
common: skip
	npm run build -w @skui/base -w @skui/common

# Build framework components
.PHONY: fwk
fwk: common
	npm run build -w @skui/fwk

# Build view components
.PHONY: views
views: fwk
	npm run build -w @skui/views

# Start the views application
.PHONY: start-views
start-views: views
	npm run start -w views

# Test the views application
.PHONY: test-views
test-views: views run-views-tests

# Build engine examples
.PHONY: engine-examples
engine-examples: fwk
	npm run build -w @skui/engine -w  @skui/engine-examples

# Start engine examples
.PHONY: start-engine-examples
start-engine-examples: engine-examples
	npm run start -w engine-examples

# Build and test common components
.PHONY: common-tests
common-tests: common
	npm run build -w @skui/common-tests

# Build and test font components
.PHONY: font-tests
font-tests: common
	npm run build -w @skui/font-tests

# Build and test MTSDF components
.PHONY: mtsdf-tests
mtsdf-tests: common
	npm run build -w @skui/mtsdf-tests

# Build and test OpenGL components
.PHONY: opengl-tests
opengl-tests: common
	npm run build -w @skui/opengl-tests

# Run native tests for various components
.PHONY: test-native
test-native:
	skargo test --manifest-path=common/Skargo.toml
	skargo test --manifest-path=font/Skargo.toml
	skargo test --manifest-path=mtsdf/Skargo.toml
	skargo test --manifest-path=opengl/Skargo.toml

# Run WASM tests for common components
.PHONY: run-wasm-common-tests
run-wasm-common-tests:
	cd common/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

# Run WASM tests for font components
.PHONY: run-wasm-font-tests
run-wasm-font-tests:
	cd font/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

# Run WASM tests for MTSDF components
.PHONY: run-wasm-mtsdf-tests
run-wasm-mtsdf-tests:
	cd mtsdf/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

# Run WASM tests for OpenGL components
.PHONY: run-wasm-opengl-tests
run-wasm-opengl-tests:
	cd opengl/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

# Run tests for views
.PHONY: run-views-tests
run-views-tests:
	cd views/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

# Combined targets for WASM tests
.PHONY: test-wasm-common
test-wasm-common: common-tests run-wasm-common-tests

.PHONY: test-wasm-font
test-wasm-font: font-tests run-wasm-font-tests

.PHONY: test-wasm-mtsdf
test-wasm-mtsdf: mtsdf-tests run-wasm-mtsdf-tests

.PHONY: test-wasm-opengl
test-wasm-opengl: opengl-tests run-wasm-opengl-tests

# Run all WASM tests
.PHONY: test-wasm
test-wasm: setup run-wasm-common-tests run-wasm-font-tests run-wasm-mtsdf-tests run-wasm-opengl-tests

# Generate engine documentation as a PDF
.PHONY: enginedoc
enginedoc:
	mkdir -p pdfs
	pandoc $(ENG_PANDOC_FILES) --include-in-header setup.tex --toc -o pdfs/engine.pdf --lua-filter=span.lua -V geometry:margin=0.5in

# Generate engine documentation as a TeX file
.PHONY: enginetex
enginetex:
	mkdir -p pdfs
	pandoc $(ENG_PANDOC_FILES) --include-in-header setup.tex --toc -o pdfs/engine.tex --lua-filter=span.lua -V geometry:margin=0.5in

# Clean build artifacts
.PHONY: clean
clean:
	echo $(SKARGO_TARGETS) | sed 's|Skargo.toml|target|g' | xargs -0 rm -rf
	npm run clean

# Format Skip files
.PHONY: fmt-sk
fmt-sk:
	find . -path ./skip -not -prune -or -name \*.sk | parallel $(CHECK_JOBS) skfmt -i {}

# Format C/C++ files
.PHONY: fmt-c
fmt-c:
	find . -path ./node_modules -not -prune -or -path ./skip -not -prune -or -regex '.*\.\(c\|cc\|cpp\|h\|hh\|hpp\)' | parallel clang-format -i {}

# Format JavaScript files
.PHONY: fmt-js
fmt-js:
	npx prettier --log-level warn --write .

# Combined formatting target
.PHONY: fmt
fmt: fmt-sk fmt-c fmt-js

# Check if formatting changes files
.PHONY: check-fmt
check-fmt: fmt
	if ! git diff --quiet --exit-code; then echo "make fmt changed some files:"; git status --porcelain; exit 1; fi

# Linter target to install dependencies, build, and lint various components
.PHONY: linter
linter:	
	npm i
	npm run build -w @skiplang/std -w  @skip-wasm/std -w @skui/base -w @skui/common
	npm run lint -w @skui/base -w @skui/common -w @skui/common-tests  -w @skui/common-tests -w @skui/font-tests -w @skui/mtsdf-tests -w @skui/opengl -w @skui/opengl-tests -w @skui/fwk -w @skui/js -w @skui/views -w @skui/engine

# Build a specific component using Skargo
build-%: ./%/Skargo.toml
	skargo build --profile $(SKARGO_PROFILE) --manifest-path=./$*/Skargo.toml

# Check a specific component using Skargo
check-%: ./%/Skargo.toml
	skargo check --profile $(SKARGO_PROFILE) --manifest-path=./$*/Skargo.toml

# Clean a specific component using Skargo
clean-%: ./%/Skargo.toml
	skargo check --profile $(SKARGO_PROFILE) --manifest-path=./$*/Skargo.toml

# Build WASM components
.PHONY: build-wasm
build-wasm:
	npm run build

# Build native components for all targets
.PHONY: build-native
build-native:
	@for target in $(SKARGO_TARGETS); do \
		echo "Building $$target..."; \
		skargo build --profile $(SKARGO_PROFILE) --manifest-path="$$target"; \
	done