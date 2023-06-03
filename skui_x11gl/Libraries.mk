SKARGO_INCLUDEDIRS64 ?= ../skui_opengl/native/includes ../skui_base/native/includes  native/includes
CC				= clang
CPP				= clang++
BCLINK		= llvm-link
VERSION	 	?= $(shell lsb_release -sc)
LIBDIR		?= lib
BUILDDIR	?= target/$(VERSION)
BINARCH		?= i386:x86-64
ELFARCH		?= elf64-x86-64
OBCOPY		?= objcopy


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

ifneq ("$(wildcard native)","")

ifndef SKARGO_INCLUDEDIRS64
ifneq ("$(wildcard native/includes)","")
SKARGO_INCLUDEDIRS64 := native/includes
endif #("$(wildcard native/includes)","")
endif #SKARGO_INCLUDEDIRS64

ifndef RESOURCES64
ifneq ("$(wildcard native/resources)","")
RESOURCES64 := $(shell find -L native/resources -name "*.bin")
endif #("$(wildcard native/resources)","")
endif #RESOURCES64
IFILES64  		:= $(foreach dir,$(SKARGO_INCLUDEDIRS64),$(shell find -L $(dir) -name "*.h"))
SOURCES64			:= $(shell find -L native -name "*.cpp")
FILES64				:= $(addprefix $(BUILDDIR)/,$(SOURCES64:.cpp=$(SKSUFFIX).o))
RULE64				:= $(LIBDIR)/lib$(SKNAME)_64$(SKSUFFIX).a
INC64     		:= $(foreach dir,$(SKARGO_INCLUDEDIRS64),"-I$(dir)")
ORESOURCES64	:= $(addprefix $(BUILDDIR)/,$(RESOURCES64:.bin=.bin.o))
endif #("$(wildcard native)","")

ifneq ("$(wildcard wasm)","")
SOURCES32	:= $(shell find -L wasm -name "*.c")
FILES32		:= $(addprefix $(BUILDDIR)/,$(SOURCES32:.c=.bc))
RULE32		:= $(LIBDIR)/lib$(SKNAME)_32.bc
endif #("$(wildcard native)","")

default: build

$(BUILDDIR)/native/resources/%.bin.o: native/resources/%.bin
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	${OBCOPY} -B $(BINARCH) -I binary -O $(ELFARCH) $< $@

$(BUILDDIR)/native/%$(SKSUFFIX).o: native/%.cpp $(IFILES64)
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	$(CPP) $(CPPFLAG) -std=c++17 $(INC64) -o $@ -c $<

$(BUILDDIR)/lib$(SKNAME)_64$(SKSUFFIX).a: $(FILES64) $(ORESOURCES64)
	ar rcs $(BUILDDIR)/lib$(SKNAME)_64$(SKSUFFIX).a $(FILES64) $(ORESOURCES64)

$(LIBDIR)/lib$(SKNAME)_64$(SKSUFFIX).a: $(BUILDDIR)/lib$(SKNAME)_64$(SKSUFFIX).a
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $(BUILDDIR)/lib$(SKNAME)_64$(SKSUFFIX).a $(LIBDIR)/lib$(SKNAME)_64$(SKSUFFIX).a

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