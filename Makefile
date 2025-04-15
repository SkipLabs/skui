ENG_DOCUMENTS_DIR=skui_eng/docs

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

ENG_PANDOC_FILES=$(addprefix $(ENG_DOCUMENTS_DIR)/,$(ENG_DOCUMENTS))

.PHONY: init
init:
	@if [ "$(SKIP)" = "" ]; then\
        $(error SKIP must be defined.);\
  fi
	ln -s $(realpath $(SKIP)) skip

.PHONY: playwright
playwright:
	npx playwright install-deps && npx playwright install

.PHONY: setup
setup:
	npm i && npm run build

.PHONY: skip
skip:
	npm i && npm run build -w @skiplang/std -w @skip-wasm/std

.PHONY: common
common: skip
	npm run build -w @skui/base -w @skui/common

.PHONY: fwk
fwk: common
	npm run build -w @skui/fwk

.PHONY: views
views: fwk
	npm run build -w @skui/views

.PHONY: start-views
start-views: views
	npm run start -w views

.PHONY: test-views
test-views: views run-views-tests

.PHONY: engine-examples
engine-examples: fwk
	npm run build -w @skui/engine -w  @skui/engine-examples

.PHONY: start-engine-examples
start-engine-examples: engine-examples
	npm run start -w engine-examples

.PHONY: common-tests
common-tests: common
	npm run build -w @skui/common-tests

.PHONY: font-tests
font-tests: common
	npm run build -w @skui/font-tests

.PHONY: mtsdf-tests
mtsdf-tests: common
	npm run build -w @skui/mtsdf-tests

.PHONY: opengl-tests
opengl-tests: common
	npm run build -w @skui/opengl-tests

.PHONY: test-native
test-native:
	skargo test --manifest-path=skui_common/Skargo.toml
	skargo test --manifest-path=skui_font/Skargo.toml
	skargo test --manifest-path=skui_mtsdf/Skargo.toml
	skargo test --manifest-path=skui_opengl/Skargo.toml

.PHONY: run-wasm-common-tests
run-wasm-common-tests:
	cd skui_common/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

.PHONY: run-wasm-font-tests
run-wasm-font-tests:
	cd skui_font/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

.PHONY: run-wasm-mtsdf-tests
run-wasm-mtsdf-tests:
	cd skui_mtsdf/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

.PHONY: run-wasm-opengl-tests
run-wasm-opengl-tests:
	cd skui_opengl/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

.PHONY: run-views-tests
run-views-tests:
	cd skui_views/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

.PHONY: test-wasm-common
test-wasm-common: common-tests run-wasm-common-tests

.PHONY: test-wasm-font
test-wasm-font: font-tests run-wasm-font-tests

.PHONY: test-wasm-mtsdf
test-wasm-mtsdf: mtsdf-tests run-wasm-mtsdf-tests

.PHONY: test-wasm-opengl
test-wasm-opengl: opengl-tests run-wasm-opengl-tests

.PHONY: test-wasm
test-wasm: setup run-wasm-common-tests run-wasm-font-tests run-wasm-mtsdf-tests run-wasm-opengl-tests

.PHONY: enginedoc
enginedoc:
	mkdir -p pdfs
	pandoc $(ENG_PANDOC_FILES) --include-in-header setup.tex --toc -o pdfs/engine.pdf --lua-filter=span.lua -V geometry:margin=0.5in

.PHONY: enginetex
enginetex:
	mkdir -p pdfs
	pandoc $(ENG_PANDOC_FILES) --include-in-header setup.tex --toc -o pdfs/engine.tex --lua-filter=span.lua -V geometry:margin=0.5in

.PHONY: clean
clean:
	find . -path ./skip -not -prune -or -name 'Skargo.toml' -print0 | sed 's|Skargo.toml|target|g' | xargs -0 rm -rf
	npm run clean

.PHONY: fmt-sk
fmt-sk:
	find . -path ./skip -not -prune -or -name \*.sk | parallel $(CHECK_JOBS) skfmt -i {}

.PHONY: fmt-c
fmt-c:
	find . -path ./node_modules -not -prune -or -path ./skip -not -prune -or -regex '.*\.\(c\|cc\|cpp\|h\|hh\|hpp\)' | parallel clang-format -i {}

.PHONY: fmt-js
fmt-js:
	npx prettier --log-level warn --write .

.PHONY: fmt
fmt: fmt-sk fmt-c fmt-js

.PHONY: check-fmt
check-fmt: fmt
	if ! git diff --quiet --exit-code; then echo "make fmt changed some files:"; git status --porcelain; exit 1; fi

.PHONY: linter
linter:	
	npm i
	npm run build -w @skiplang/std -w  @skip-wasm/std -w @skui/base -w @skui/common
	npm run lint -w @skui/base -w @skui/common -w @skui/common-tests  -w @skui/common-tests -w @skui/font-tests -w @skui/mtsdf-tests -w @skui/opengl -w @skui/opengl-tests -w @skui/fwk -w @skui/js -w @skui/views -w @skui/engine
