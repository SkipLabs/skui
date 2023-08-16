
ifndef SKFS
$(error SKFS must be defined.)
endif


.PHONY: conf
conf:
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