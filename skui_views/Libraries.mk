
SKARGO_INCLUDEDIRS64 ?= ../skui_opengl/native/includes ../skui_x11gl/native/includes ../skui_base/native/includes

CC				= clang
CPP				= clang++
BCLINK		= llvm-link
VERSION	 	?= $(shell lsb_release -sc)
LIBDIR		?= lib
BUILDDIR	?= target/$(VERSION)
BINARCH		?= i386:x86-64
ELFARCH		?= elf64-x86-64
OBCOPY		?= objcopy
TSDIR			?= $(BUILDDIR)/ts


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
ifneq ("$(wildcard resources)","")
RESOURCES := $(shell find -L resources -name "*.bin")
endif #("$(wildcard resources)","")
endif #RESOURCES

ifneq ("$(wildcard native)","")

ifndef SKARGO_INCLUDEDIRS64
ifneq ("$(wildcard native/includes)","")
SKARGO_INCLUDEDIRS64 := native/includes
endif #("$(wildcard native/includes)","")
endif #SKARGO_INCLUDEDIRS64

IFILES64  		:= $(foreach dir,$(SKARGO_INCLUDEDIRS64),$(shell find -L $(dir) -name "*.h"))
SOURCES64			:= $(shell find -L native -name "*.cpp")
FILES64				:= $(addprefix $(BUILDDIR)/,$(SOURCES64:.cpp=$(SKSUFFIX).o))
RULE64				:= $(LIBDIR)/lib$(SKNAME)_64$(SKSUFFIX).a
INC64     		:= $(foreach dir,$(SKARGO_INCLUDEDIRS64),"-I$(dir)")
ORESOURCES64	:= $(addprefix $(BUILDDIR)/,$(RESOURCES:.bin=.bin.o))
endif #("$(wildcard native)","")

ifneq ("$(wildcard wasm)","")
SOURCES32			:= $(shell find -L wasm -name "*.c")
FILES32				:= $(addprefix $(BUILDDIR)/,$(SOURCES32:.c=.bc))
RULE32				:= $(LIBDIR)/lib$(SKNAME)_32.bc
endif #("$(wildcard native)","")
RESOURCES32  	:= $(foreach file,$(RESOURCES), $(TSDIR)/$(SKNAME)_$(shell basename $(file) .bin).ts)

default: build

$(BUILDDIR)/resources/%.bin.o: resources/%.bin
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
	$(BCLINK) $(FILES32) -o $@

$(LIBDIR)/lib$(SKNAME)_32.bc: $(BUILDDIR)/lib$(SKNAME)_32.bc
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	cp $@ $(LIBDIR)/lib$(SKNAME)_32.bc

$(TSDIR)/$(SKNAME)_%.ts: resources/%.bin
	[ -d $(dir $@) ] || mkdir -p $(dir $@)
	$(eval VARNAME := $(shell basename $@ .ts))
	@echo 'var $(VARNAME) = `' >> $@
	@base64 $< >> $@
	@echo '`;' >> $@
	@echo '' >> $@
	@echo 'interface ToWasm {' >> $@
	@echo ' SKIP_SKUIViewsRes_$(VARNAME): () => number;' >> $@
	@echo '}' >> $@
	@echo '' >> $@
	@echo 'interface Utils {' >> $@
	@echo '  exportString: (s: string) => number;' >> $@
	@echo '}' >> $@
	@echo '' >> $@
	@echo 'class LinksImpl implements ToWasm {' >> $@
	@echo '  SKIP_SKUIViewsRes_$(VARNAME): () => number;' >> $@
	@echo '' >> $@
	@echo '  complete = (utils: Utils, exports: object) => {' >> $@
	@echo '    this.SKIP_SKUIViewsRes_$(VARNAME) = () => {' >> $@
	@echo '      return utils.exportString($(VARNAME));' >> $@
	@echo '    }' >> $@
	@echo '    return null;' >> $@
	@echo '  }' >> $@
	@echo '}' >> $@
	@echo '' >> $@
	@echo 'class Manager {' >> $@
	@echo '  prepare = (wasm: object) => {' >> $@
	@echo '    let toWasm = wasm as ToWasm;' >> $@
	@echo '    let links = new LinksImpl();' >> $@
	@echo '    toWasm.SKIP_SKUIViewsRes_$(VARNAME) =  () => links.SKIP_SKUIViewsRes_$(VARNAME)();' >> $@
	@echo '    return links;' >> $@
	@echo '  }' >> $@
	@echo '}' >> $@
	@echo '' >> $@
	@echo 'export var init = () => new Manager();' >> $@
	@echo '' >> $@

.PHONY: build
build: $(RULE64) $(RULE32) $(RESOURCES32) 

.PHONY: check
check:
	make -f SkipToLLVM.mk check

.PHONY: clean
clean:
	rm -Rf $(BUILDDIR)