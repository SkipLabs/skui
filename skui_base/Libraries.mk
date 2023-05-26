
CC				= clang
CPP				= clang++
BCLINK		= llvm-link
VERSION	 	?= $(shell lsb_release -sc)
LIBDIR		?= lib
BUILDDIR	?= .build/$(VERSION)


ifdef DEBUG
SKNAME	 	?= $(shell basename $(CURDIR))_debug
OLEVEL	?= -O0
CFLAG		?= -g $(OLEVEL) -DDEBUG --target=wasm32 -emit-llvm
CPPFLAG ?= -g -Wno-everything $(OLEVEL) -DDEBUG
else
SKNAME	 	?= $(shell basename $(CURDIR))
OLEVEL	?= -O3
CFLAG		?= $(OLEVEL) --target=wasm32 -emit-llvm
CPPFLAG	?= $(OLEVEL)
endif

ifneq ("$(wildcard native)","")
SOURCES64	:= $(shell find -L native -name "*.cpp")
FILES64		:= $(addprefix $(BUILDDIR)/,$(SOURCES64:.cpp=.o))
RULE64		:= $(LIBDIR)/lib$(SKNAME)_64.a
endif

ifneq ("$(wildcard wasm)","")
SOURCES32	:= $(shell find -L wasm -name "*.c")
FILES32		:= $(addprefix $(BUILDDIR)/,$(SOURCES32:.c=.bc))
RULE32		:= $(LIBDIR)/lib$(SKNAME)_32.bc
endif

default: build

$(BUILDDIR)/native/%.o: native/%.cpp
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	$(CPP) $(CPPFLAG) -std=c++17 -o $@ -c $<


$(BUILDDIR)/lib$(SKNAME)_64.a: $(FILES64)
	ar rcs $(BUILDDIR)/lib$(SKNAME)_64.a $(FILES64)

$(LIBDIR)/lib$(SKNAME)_64.a: $(BUILDDIR)/lib$(SKNAME)_64.a
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $(BUILDDIR)/lib$(SKNAME)_64.a $(LIBDIR)/lib$(SKNAME)_64.a

$(BUILDDIR)/wasm/%.bc: wasm/%.c
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	$(CC) $(CFLAG) -o $@ -c $<

$(BUILDDIR)/lib$(SKNAME)_32.bc: $(FILES32)
	$(BCLINK) $(FILES32) -o $(BUILDDIR)/lib$(SKNAME)_32.bc

$(LIBDIR)/lib$(SKNAME)_32.bc: $(BUILDDIR)/lib$(SKNAME)_32.bc
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $(BUILDDIR)/lib$(SKNAME)_32.bc $(LIBDIR)/lib$(SKNAME)_32.bc


.PHONY: build
build: $(RULE64) $(RULE32)

.PHONY: check
check:
	make -f SkipToLLVM.mk check

.PHONY: clean
clean:
	rm -Rf $(BUILDDIR)