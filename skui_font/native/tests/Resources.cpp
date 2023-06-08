#include <cstdint>
#include <iostream>

extern "C"
{

  extern uint8_t tests_luximr_start[] asm("_binary_resources_tests_luximr_bin_start");
  extern uint8_t tests_luximr_end[]   asm("_binary_resources_tests_luximr_bin_end");


  extern uint8_t tests_luxirr_start[] asm("_binary_resources_tests_luxirr_bin_start");
  extern uint8_t tests_luxirr_end[]   asm("_binary_resources_tests_luxirr_bin_end");

  extern uint8_t tests_luxisr_start[] asm("_binary_resources_tests_luxisr_bin_start");
  extern uint8_t tests_luxisr_end[]   asm("_binary_resources_tests_luxisr_bin_end");

  extern uint8_t tests_xab_start[]    asm("_binary_resources_tests_xab_bin_start");
  extern uint8_t tests_xab_end[]      asm("_binary_resources_tests_xab_bin_end");

  extern uint8_t tests_xdsff_start[]    asm("_binary_resources_tests_xdsff_bin_start");
  extern uint8_t tests_xdsff_end[]      asm("_binary_resources_tests_xdsff_bin_end");

  extern uint8_t tests_xdvso_start[]    asm("_binary_resources_tests_xdvso_bin_start");
  extern uint8_t tests_xdvso_end[]      asm("_binary_resources_tests_xdvso_bin_end");

  extern uint8_t tests_xtnr_start[]    asm("_binary_resources_tests_xtnr_bin_start");
  extern uint8_t tests_xtnr_end[]      asm("_binary_resources_tests_xtnr_bin_end");

  char *SKIP_createByteArray(int32_t);
  void SKIP_setByte(char *, int32_t, uint8_t);
  char *SKIP_chillByteArray(char *);
}

char* createBuffer(uint8_t* start, uint8_t* end) {
  uint64_t size = end - start;
  char* buffer = SKIP_createByteArray(size);
  uint32_t idx = 0;
  for (uint8_t *byte = start; byte < end; ++byte) {
      SKIP_setByte(buffer, idx, *byte);
      idx++;
  }
  return SKIP_chillByteArray(buffer);
}

extern "C"
{
  char* SKIP_skui_font_tests_luxirr_bin() {
    return createBuffer(tests_luxirr_start, tests_luxirr_end);
  }

  char* SKIP_skui_font_tests_luximr_bin() {
    return createBuffer(tests_luximr_start, tests_luximr_end);
  }

  char* SKIP_skui_font_tests_luxisr_bin() {
    return createBuffer(tests_luxisr_start, tests_luxisr_end);
  }

  char* SKIP_skui_font_tests_xab_bin() {
    return createBuffer(tests_xab_start, tests_xab_end);
  }

  char* SKIP_skui_font_tests_xdsff_bin() {
    return createBuffer(tests_xdsff_start, tests_xdsff_end);
  }

  char* SKIP_skui_font_tests_xdvso_bin() {
    return createBuffer(tests_xdvso_start, tests_xdvso_end);
  }

  char* SKIP_skui_font_tests_xtnr_bin() {
    return createBuffer(tests_xtnr_start, tests_xtnr_end);
  }
}