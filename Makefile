
.PHONY: conf
conf:
	@if [ "$(SKDB)" = "" ]; then\
        $(error SKDB must be defined.);\
  fi
	@echo '{' > .tsconfig.json
	@echo '  "compilerOptions": {' >> .tsconfig.json
	@echo '    "target": "ES2021",' >> .tsconfig.json
	@echo '    "outDir": "js",' >> .tsconfig.json
	@echo '    "baseUrl": ".",' >> .tsconfig.json
	@echo '    "strict": true,' >> .tsconfig.json
	@echo '    "strictNullChecks": true,' >> .tsconfig.json
	@echo '    "module": "Node16",' >> .tsconfig.json
	@echo '    "moduleResolution": "Node16",' >> .tsconfig.json
	@echo '    "verbatimModuleSyntax": true,' >> .tsconfig.json
	@echo '    "paths": {' >> .tsconfig.json
	@echo '      "#std/*.js": ["$(SKDB)/prelude/ts/src/*.ts"],' >> .tsconfig.json
	@echo '      "#skui_base/*.js": ["skui_base/ts/src/*.ts"],' >> .tsconfig.json
	@echo '      "#skui_opengl/*.js": ["skui_opengl/ts/src/*.ts"],' >> .tsconfig.json
	@echo '      "#skui_views/*.js": ["skui_views/ts/src/*.ts"]' >> .tsconfig.json,
	@echo '      "#skui_eng/*.js": ["skui_eng/ts/src/*.ts"]' >> .tsconfig.json,
	@echo '    }' >> .tsconfig.json
	@echo '  }' >> .tsconfig.json
	@echo '}' >> .tsconfig.json
	@echo '{"repositories": ["$(SKDB)"]}' >> .skargoconfig

.PHONY: fmt
fmt:
	cd skui_base; skargo fmt
	cd skui_common; skargo fmt
	cd skui_eng; skargo fmt
	cd skui_engex; skargo fmt
	cd skui_font; skargo fmt
	cd skui_fwk; skargo fmt
	cd skui_mtsdf; skargo fmt
	cd skui_opengl; skargo fmt
	cd skui_views; skargo fmt
	cd skui_x11gl; skargo fmt
	npx prettier . --write

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
