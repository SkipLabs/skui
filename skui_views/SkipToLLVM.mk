
SKC=skip_to_llvm

CC=clang
CPP=clang++

OLEVEL			?= -O3
SKFLAGS			?=
CFLAG				?= $(OLEVEL)
CPPFLAG			?= $(OLEVEL)

CC64FLAGS		?= $(CFLAG) -DSKIP64
CC32FLAGS   ?= -DSKIP32 --target=wasm32 -emit-llvm $(OLEVEL)

PREFIX			?= /usr/local
EXEC_PREFIX	?= $(PREFIX)
BINDIR			?= $(EXEC_PREFIX)/bin
LIBDIR 			?= $(EXEC_PREFIX)/lib
SKNAME 			?= $(shell basename $(CURDIR))
SKREP 			?= $(shell dirname $(CURDIR))

BUILDDIR 		?= .build

SKDEBUGLIBRAIRIES ?= $(SKREP)/skui_base/lib/libskui_base_64_debug.a $(SKREP)/skui_common/lib/libskui_common_64_debug.a \
	$(SKREP)/skui_x11gl/lib/libskui_x11gl_64_debug.a $(SKREP)/skui_opengl/lib/libskui_opengl_64_debug.a \
	$(CURDIR)/lib/libskui_views_64_debug.a 

SKLIBRAIRIES ?= $(SKREP)/skui_base/lib/libskui_base_64_release.a $(SKREP)/skui_common/lib/libskui_common_64_release.a \
	$(SKREP)/skui_x11gl/lib/libskui_x11gl_64_release.a $(SKREP)/skui_opengl/lib/libskui_opengl_64_release.a \
	$(CURDIR)/lib/libskui_views_64_release.a 

.PHONY: clean
clean:
	rm -Rf $(BUILDDIR)

.PHONY: native
native: $(BUILDDIR)/$(SKNAME)64.ll

$(BUILDDIR)/$(SKNAME)64.ll:
	[ -d $(BUILDDIR) ] || mkdir -p $(BUILDDIR)
	$(SKC) $(SKFLAGS) --export-function-as SkuiViews.main=skip_main --embedded64 .:$(SKNAME) --output $(BUILDDIR)/$(SKNAME)64.ll

$(BUILDDIR)/preamble_$(SKNAME)64.ll: $(LIBDIR)/skip_preamble64.ll $(BUILDDIR)/$(SKNAME)64.ll
	cat $(LIBDIR)/skip_preamble64.ll $(BUILDDIR)/$(SKNAME)64.ll > $(BUILDDIR)/preamble_$(SKNAME)64.ll

$(BUILDDIR)/$(SKNAME)32.ll:
	[ -d $(BUILDDIR) ] || mkdir -p $(BUILDDIR)
	$(SKC) $(SKFLAGS) --export-function-as SkuiViews.main=skip_main --embedded32 .:$(SKNAME) --output $(BUILDDIR)/$(SKNAME)32.ll

.PHONY: $(CURDIR)/lib/libskui_views_64_debug.a
$(CURDIR)/lib/libskui_views_64_debug.a:
	make -f Libraries.mk DEBUG=TRUE

.PHONY: $(SKREP)/skui_common/lib/libskui_common_64_debug.a
$(SKREP)/skui_common/lib/libskui_common_64_debug.a:
	make -f Libraries.mk DEBUG=TRUE -C $(SKREP)/skui_common

.PHONY: $(SKREP)/skui_base/lib/libskui_base_64_debug.a
$(SKREP)/skui_base/lib/libskui_base_64_debug.a:
	make -f Libraries.mk DEBUG=TRUE -C $(SKREP)/skui_base

.PHONY: $(SKREP)/skui_opengl/lib/libskui_opengl_64_debug.a
$(SKREP)/skui_opengl/lib/libskui_opengl_64_debug.a:
	make -f Libraries.mk DEBUG=TRUE -C $(SKREP)/skui_opengl

.PHONY: $(SKREP)/skui_x11gl/lib/libskui_x11gl_64_debug.a
$(SKREP)/skui_x11gl/lib/libskui_x11gl_64_debug.a:
	make -f Libraries.mk DEBUG=TRUE -C $(SKREP)/skui_x11gl

$(BUILDDIR)/$(SKNAME)_debug: $(SKDEBUGLIBRAIRIES) $(BUILDDIR)/preamble_$(SKNAME)64.ll
	$(CPP) -no-pie -O0 -g -mllvm -inline-threshold=0 \
	$(BUILDDIR)/preamble_$(SKNAME)64.ll $(LIBDIR)/skip_preamble64.ll $(LIBDIR)/libskip_runtime64.a $(LIBDIR)/libbacktrace.a \
	$(SKDEBUGLIBRAIRIES) -lrt -lpthread -lGL -lGLEW -lGLU -lX11 -lcrypto -lglut -lpcre -lssl -lstdc++fs \
	-o $(BUILDDIR)/$(SKNAME)_debug

.PHONY: $(CURDIR)/lib/libskui_views_64_release.a
$(CURDIR)/lib/libskui_views_64_release.a:
	make -f Libraries.mk

.PHONY: $(SKREP)/skui_common/lib/libskui_common_64_release.a
$(SKREP)/skui_common/lib/libskui_common_64_release.a:
	make -f Libraries.mk -C $(SKREP)/skui_common

.PHONY: $(SKREP)/skui_base/lib/libskui_base_64_release.a
$(SKREP)/skui_base/lib/libskui_base_64_release.a:
	make -f Libraries.mk -C $(SKREP)/skui_base

.PHONY: $(SKREP)/skui_opengl/lib/libskui_opengl_64_release.a
$(SKREP)/skui_opengl/lib/libskui_opengl_64_release.a:
	make -f Libraries.mk -C $(SKREP)/skui_opengl

.PHONY: $(SKREP)/skui_x11gl/lib/libskui_x11gl_64_release.a
$(SKREP)/skui_x11gl/lib/libskui_x11gl_64_release.a:
	make -f Libraries.mk -C $(SKREP)/skui_x11gl

$(BUILDDIR)/$(SKNAME): $(SKLIBRAIRIES) $(BUILDDIR)/preamble_$(SKNAME)64.ll
	$(CPP) -no-pie -O3 -mllvm -inline-threshold=0 \
	$(BUILDDIR)/preamble_$(SKNAME)64.ll $(LIBDIR)/libskip_runtime64.a $(LIBDIR)/libbacktrace.a \
	$(SKLIBRAIRIES) -lrt -lpthread -lGL -lGLEW -lGLU -lX11 -lcrypto -lglut -lpcre -lssl -lstdc++fs \
	-o $(BUILDDIR)/$(SKNAME)

.PHONY: check
check:
	clear
	sk check

.PHONY: test
test:
	make -f SkipToLLVM.mk native SKNAME=test