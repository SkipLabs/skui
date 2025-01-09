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
	ln -s $(realpath $(SKIP)) skstore

.PHONY: test-native
test-native:
	cd skui_common; skargo test
	cd skui_font; skargo test
	cd skui_mtsdf; skargo test

.PHONY: test-wasm
test-wasm:
	cd skui_common; sknpm test
	cd skui_font; sknpm test
	cd skui_mtsdf; sknpm test

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
	find . -path ./skstore -not -prune -or -name 'Skargo.toml' -print0 | sed 's|Skargo.toml|target|g' | xargs -0 rm -rf
	npm run clean

.PHONY: fmt-sk
fmt-sk:
	find . -path ./skstore -not -prune -or -name \*.sk | parallel skfmt -i :::

.PHONY: fmt-c
fmt-c:
	find . -path ./skstore -not -prune -or -regex '.*\.[ch]\(pp\)*' | parallel clang-format -i :::

.PHONY: fmt-js
fmt-js:
	npx prettier --log-level warn --write .

.PHONY: fmt
fmt: fmt-sk fmt-c fmt-js

.PHONY: check-fmt
check-fmt: fmt
	if ! git diff --quiet --exit-code; then echo "make fmt changed some files:"; git status --porcelain; exit 1; fi