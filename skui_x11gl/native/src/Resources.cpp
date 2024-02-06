#include <cstdint>
#include <iostream>
#include <string.h>

extern "C"
{

  extern uint8_t wood_start[]      asm("_binary_resources_textures_wood_rgba_start");
  extern uint8_t wood_end[]  asm("_binary_resources_textures_wood_rgba_end");


  extern uint8_t steel_start[]      asm("_binary_resources_textures_steel_rgba_start");
  extern uint8_t steel_end[]  asm("_binary_resources_textures_steel_rgba_end");

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
  char* SKIP_skui_x11_resources_textures_wood_rgba() {
    return createBuffer(wood_start, wood_end);
  }

  char* SKIP_skui_x11_resources_textures_steel_rgba() {
    return createBuffer(steel_start, steel_end);
  }
}