
CC				= clang
CPP				= clang++
BCLINK		= llvm-link
VERSION	 	?= $(shell lsb_release -sc)
LIBDIR		?= lib
BUILDDIR	?= .build/$(VERSION)


ifdef DEBUG
SKNAME	?= $(shell basename $(CURDIR))_debug
OLEVEL	?= -O0
CFLAG		?= -g $(OLEVEL) -DDEBUG --target=wasm32 -emit-llvm
CPPFLAG ?= -g -Wno-everything $(OLEVEL) -DDEBUG
else
SKNAME	?= $(shell basename $(CURDIR))
OLEVEL	?= -O3
CFLAG		?= $(OLEVEL) --target=wasm32 -emit-llvm
CPPFLAG	?= $(OLEVEL)
endif

ifneq ("$(wildcard native)","")
ifndef SKARGO_INCLUDEDIRS64
ifneq ("$(wildcard native/includes)","")
SKARGO_INCLUDEDIRS64:= native/includes
endif
endif

IFILES64  := $(foreach dir,$(SKARGO_INCLUDEDIRS64),$(shell find -L $(dir) -name "*.h"))
SOURCES64	:= $(shell find -L native -name "*.cpp")
FILES64		:= $(addprefix $(BUILDDIR)/,$(SOURCES64:.cpp=.o))
RULE64		:= $(LIBDIR)/lib$(SKNAME)_64.a
INC64     := $(foreach dir,$(SKARGO_INCLUDEDIRS64),"-I$(dir)")
endif

ifneq ("$(wildcard wasm)","")
ifndef SKARGO_INCLUDEDIRS32
ifneq ("$(wildcard wasm/includes)","")
SKARGO_INCLUDEDIRS32:= wasm/includes
endif
endif

IFILES32  := $(foreach dir,$(SKARGO_INCLUDEDIRS32),$(shell find -L $(dir) -name "*.h"))
SOURCES32	:= $(shell find -L wasm -name "*.c")
FILES32		:= $(addprefix $(BUILDDIR)/,$(SOURCES32:.c=.bc))
RULE32		:= $(LIBDIR)/lib$(SKNAME)_32.bc
INC32     := $(foreach dir,$(SKARGO_INCLUDEDIRS32),"-I$(dir)")
endif

default: build

$(BUILDDIR)/native/%.o: native/%.cpp $(IFILES64)
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	$(CPP) $(CPPFLAG) -std=c++17 $(INC64) -o $@ -c $<


$(BUILDDIR)/lib$(SKNAME)_64.a: $(FILES64)
	ar rcs $(BUILDDIR)/lib$(SKNAME)_64.a $(FILES64)

$(LIBDIR)/lib$(SKNAME)_64.a: $(BUILDDIR)/lib$(SKNAME)_64.a
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $(BUILDDIR)/lib$(SKNAME)_64.a $(LIBDIR)/lib$(SKNAME)_64.a

$(BUILDDIR)/wasm/%.bc: wasm/%.c  $(IFILES32)
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	$(CC) $(CFLAG) $(INC32) -o $@ -c $<

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