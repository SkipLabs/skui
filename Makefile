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

.PHONY: common-tests
common-tests: common
	npm run build -w @skui/common-tests

.PHONY: font-tests
font-tests: common
	npm run build -w @skui/font-tests

.PHONY: mtsdf-tests
mtsdf-tests: common
	npm run build -w @skui/mtsdf-tests

.PHONY: test-native
test-native:
	skargo test --manifest-path=skui_common/Skargo.toml
	skargo test --manifest-path=skui_font/Skargo.toml
	skargo test --manifest-path=skui_mtsdf/Skargo.toml

.PHONY: run-wasm-common-tests
run-wasm-common-tests:
	cd skui_common/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

.PHONY: run-wasm-font-tests
run-wasm-font-tests:
	cd skui_font/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

.PHONY: run-wasm-mtsdf-tests
run-wasm-mtsdf-tests:
	cd skui_mtsdf/ts/playwright && npm run test --workspaces=false $(TEST_ARGS)

.PHONY: test-wasm-common
test-wasm-common: playwright common-tests run-wasm-common-tests

.PHONY: test-wasm-font
test-wasm-font: playwright font-tests run-wasm-font-tests

.PHONY: test-wasm-mtsdf
test-wasm-mtsdf: playwright mtsdf-tests run-wasm-mtsdf-tests

.PHONY: test-wasm
test-wasm: playwright setup run-wasm-common-tests run-wasm-font-tests run-wasm-mtsdf-tests

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
	find . -path ./skip -not -prune -or -name \*.sk | parallel skfmt -i :::

.PHONY: fmt-c
fmt-c:
	find . -path ./skip -not -prune -or -regex '.*\.[ch]\(pp\)*' | parallel clang-format -i :::

.PHONY: fmt-js
fmt-js:
	npx prettier --log-level warn --write .

.PHONY: fmt
fmt: fmt-sk fmt-c fmt-js

.PHONY: check-fmt
check-fmt: fmt
	if ! git diff --quiet --exit-code; then echo "make fmt changed some files:"; git status --porcelain; exit 1; fi