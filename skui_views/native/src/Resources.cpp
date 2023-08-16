#include <cstdint>
#include <iostream>
#include <string.h>

extern "C"
{

  extern uint8_t small_start[]      asm("_binary_resources_src_small_bin_start");
  extern uint8_t small_end[]  asm("_binary_resources_src_small_bin_end");


  extern uint8_t big_start[]      asm("_binary_resources_src_big_bin_start");
  extern uint8_t big_end[]  asm("_binary_resources_src_big_bin_end");

  char *SKIP_createByteArray(int32_t);
}

char* createBuffer(uint8_t* start, uint8_t* end) {
  uint64_t size = end - start;
  char* buffer = SKIP_createByteArray(size);
  memcpy(buffer, (const char *)start, size);
  return buffer;
}

extern "C"
{
  char* SKIP_skui_views_resources_src_big_bin() {
    return createBuffer(big_start, big_end);
  }

  char* SKIP_skui_views_resources_src_small_bin() {
    return createBuffer(small_start, small_end);
  }
}