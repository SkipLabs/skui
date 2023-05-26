
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


BUILDDIR 			?= .build

.PHONY: clean
clean:
	rm -Rf $(BUILDDIR)

.PHONY: native
native: $(BUILDDIR)/$(SKNAME)

$(BUILDDIR)/$(SKNAME).ll:
	[ -d $(BUILDDIR) ] || mkdir -p $(BUILDDIR)
	$(SKC) $(SKFLAGS) --export-function-as Skuiargo.main=skip_main --embedded64 .:$(SKNAME) --output $(BUILDDIR)/$(SKNAME).ll

$(BUILDDIR)/preamble_and_$(SKNAME).ll: $(LIBDIR)/skip_preamble64.ll $(BUILDDIR)/$(SKNAME).ll
	cat $(LIBDIR)/skip_preamble64.ll $(BUILDDIR)/$(SKNAME).ll > $(BUILDDIR)/preamble_and_$(SKNAME).ll

$(BUILDDIR)/$(SKNAME): $(BUILDDIR)/preamble_and_$(SKNAME).ll $(LIBDIR)/libskip_runtime64.a
	$(CPP) $(OLEVEL) $(BUILDDIR)/preamble_and_$(SKNAME).ll $(LIBDIR)/libskip_runtime64.a -o $(BUILDDIR)/$(SKNAME) -Wl,--whole-archive -static -lrt -Wl,--whole-archive -lpthread -Wl,--no-whole-archive

.PHONY: check
check:
	clear
	sk check