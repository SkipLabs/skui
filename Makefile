
.PHONY: conf
conf:
	@if [ "$(SKFS)" = "" ]; then\
        $(error SKFS must be defined.);\
  fi
	@echo '{' > .tsconfig.json
	@echo '  "compilerOptions": {' >> .tsconfig.json
	@echo '    "target": "ES2021",' >> .tsconfig.json
	@echo '    "outDir": "js",' >> .tsconfig.json
	@echo '    "baseUrl": ".",' >> .tsconfig.json
	@echo '    "strictNullChecks":true,' >> .tsconfig.json
	@echo '    "paths": {' >> .tsconfig.json
	@echo '      "#std/*": ["$(SKFS)/prelude/ts/src/*"],' >> .tsconfig.json
	@echo '      "#skui_base/*": ["skui_base/ts/src/*"],' >> .tsconfig.json
	@echo '      "#skui_opengl/*": ["skui_opengl/ts/src/*"],' >> .tsconfig.json
	@echo '      "#skui_views/*": ["skui_views/ts/src/*"]' >> .tsconfig.json,
	@echo '      "#skui_eng/*": ["skui_eng/ts/src/*"]' >> .tsconfig.json,
	@echo '    }' >> .tsconfig.json
	@echo '  }' >> .tsconfig.json
	@echo '}' >> .tsconfig.json

.PHONY: fmt
fmt:
	cd skui_base; skargo fmt
	cd skui_eng; skargo fmt
	cd skui_engex; skargo fmt
	cd skui_font; skargo fmt
	cd skui_fwk; skargo fmt
	cd skui_mtsdf; skargo fmt
	cd skui_opengl; skargo fmt
	cd skui_views; skargo fmt
	cd skui_x11gl; skargo fmt
	npx prettier . --write