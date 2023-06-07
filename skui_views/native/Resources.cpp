#include <cstdint>
#include <iostream>

extern "C"
{

  extern uint8_t small_start[]      asm("_binary_resources_small_bin_start");
  extern uint8_t small_end[]  asm("_binary_resources_small_bin_end");


  extern uint8_t big_start[]      asm("_binary_resources_big_bin_start");
  extern uint8_t big_end[]  asm("_binary_resources_big_bin_end");

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
  char* SKIP_skui_views_big_bin() {
    return createBuffer(big_start, big_end);
  }

  char* SKIP_skui_views_small_bin() {
    return createBuffer(small_start, small_end);
  }
}