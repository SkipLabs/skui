
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

BUILDDIR 		?= .build

.PHONY: clean
clean:
	rm -Rf $(BUILDDIR)

.PHONY: native
native: $(BUILDDIR)/$(SKNAME)64.ll

$(BUILDDIR)/$(SKNAME)64.ll:
	[ -d $(BUILDDIR) ] || mkdir -p $(BUILDDIR)
	$(SKC) $(SKFLAGS) --export-function-as main=skip_main --embedded64 .:$(SKNAME) --output $(BUILDDIR)/$(SKNAME)64.ll


$(BUILDDIR)/$(SKNAME)32.ll:
	[ -d $(BUILDDIR) ] || mkdir -p $(BUILDDIR)
	$(SKC) $(SKFLAGS) --export-function-as main=skip_main --embedded32 .:$(SKNAME) --output $(BUILDDIR)/$(SKNAME)32.ll

.PHONY: check
check:
	clear
	sk check

.PHONY: test
test:
	make -f SkipToLLVM.mk native SKNAME=test