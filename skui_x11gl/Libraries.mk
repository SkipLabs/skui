SKARGO_INCLUDEDIRS64 ?= ../skui_opengl/native/src/includes ../skui_base/native/src/includes  native/src/includes
CC				= clang
CPP				= clang++
BCLINK		= llvm-link
VERSION	 	?= $(shell lsb_release -sc)
LIBDIR		?= lib
BINARCH		?= i386:x86-64
ELFARCH		?= elf64-x86-64
OBCOPY		?= objcopy
BUILDDIR	?= target
SRCDIR    ?= src

ifdef DEBUG
SKSUFFIX ?= _debug
SKNAME	 ?= $(shell basename $(CURDIR))
OLEVEL	 ?= -O0
CFLAG		 ?= -g $(OLEVEL) -DDEBUG --target=wasm32 -emit-llvm
CPPFLAG  ?= -g -Wno-everything $(OLEVEL) -DDEBUG
else
SKSUFFIX ?= _release
SKNAME	 ?= $(shell basename $(CURDIR))
OLEVEL	 ?= -O3
CFLAG		 ?= $(OLEVEL) --target=wasm32 -emit-llvm
CPPFLAG	 ?= $(OLEVEL)
endif #DEBUG

ifndef RESOURCES
ifneq ("$(wildcard resources/$(SRCDIR))","")
RESOURCES := $(shell find -L resources/$(SRCDIR) -name "*.bin")
endif #("$(wildcard resources)","")
endif #RESOURCES

ifneq ("$(wildcard native/$(SRCDIR))","")

ifndef SKARGO_INCLUDEDIRS64
ifneq ("$(wildcard native/$(SRCDIR)/includes)","")
SKARGO_INCLUDEDIRS64 := native/$(SRCDIR)/includes
endif #("$(wildcard native/$(SRCDIR)/includes)","")
endif #SKARGO_INCLUDEDIRS64

IFILES64  		:= $(foreach dir,$(SKARGO_INCLUDEDIRS64),$(shell find -L $(dir) -name "*.h"))
SOURCES64			:= $(shell find -L native/$(SRCDIR) -name "*.cpp")
FILES64				:= $(addprefix $(BUILDDIR)/,$(SOURCES64:.cpp=$(SKSUFFIX).o))
RULE64				:= $(LIBDIR)/$(SRCDIR)/lib$(SKNAME)_64$(SKSUFFIX).a
INC64     		:= $(foreach dir,$(SKARGO_INCLUDEDIRS64),"-I$(dir)")
endif #("$(wildcard native)","")


ifneq ("$(RESOURCES)","")
ORESOURCES64	:= $(addprefix $(BUILDDIR)/,$(RESOURCES:.bin=.bin.o))
RULE64				?= $(LIBDIR)/$(SRCDIR)/lib$(SKNAME)_64$(SKSUFFIX).a
endif #("$(RESOURCES)","")

ifneq ("$(wildcard wasm/$(SRCDIR))","")
SOURCES32			:= $(shell find -L wasm -name "*.c")
FILES32				:= $(addprefix $(BUILDDIR)/,$(SOURCES32:.c=.bc))
RULE32				:= $(LIBDIR)/$(SRCDIR)/lib$(SKNAME)_32.bc
endif #("$(wildcard native)","")

default: build

$(BUILDDIR)/resources/%.bin.o: resources/%.bin
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	${OBCOPY} -B $(BINARCH) -I binary -O $(ELFARCH) $< $@

$(BUILDDIR)/native/%$(SKSUFFIX).o: native/%.cpp $(IFILES64)
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	$(CPP) $(CPPFLAG) -std=c++17 $(INC64) -o $@ -c $<

$(BUILDDIR)/$(SRCDIR)/lib$(SKNAME)_64$(SKSUFFIX).a: $(FILES64) $(ORESOURCES64)
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	ar rcs $@ $(FILES64) $(ORESOURCES64)

$(LIBDIR)/$(SRCDIR)/lib$(SKNAME)_64$(SKSUFFIX).a: $(BUILDDIR)/$(SRCDIR)/lib$(SKNAME)_64$(SKSUFFIX).a
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $< $@ 

$(BUILDDIR)/wasm/%.bc: wasm/%.c
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	$(CC) $(CFLAG) -o $@ -c $<

$(BUILDDIR)/$(SRCDIR)/lib$(SKNAME)_32.bc: $(FILES32)
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	$(BCLINK) $(FILES32) -o $@

$(LIBDIR)/$(SRCDIR)/lib$(SKNAME)_32.bc: $(BUILDDIR)/$(SRCDIR)/lib$(SKNAME)_32.bc
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $< $@

.PHONY: build
build: $(RULE64) $(RULE32)

.PHONY: check
check:
	make -f SkipToLLVM.mk check

.PHONY: clean
clean:
	rm -Rf $(BUILDDIR)