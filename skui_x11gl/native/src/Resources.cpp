#include <cstdint>
#include <iostream>
#include <string.h>

extern "C" {
extern unsigned char resources_textures_wood_rgba[];
extern unsigned int resources_textures_wood_rgba_len;

extern unsigned char resources_textures_steel_rgba[];
extern unsigned int resources_textures_steel_rgba_len;

char *SKIP_createByteArray(int32_t);

char *createBuffer(unsigned char *source, int len) {
  uint64_t size = len;
  char *buffer = SKIP_createByteArray(size);
  memcpy(buffer, source, size);
  return buffer;
}

char *SKIP_skui_x11_resources_textures_wood_rgba() {
  return createBuffer(resources_textures_wood_rgba,
                      resources_textures_wood_rgba_len);
}

char *SKIP_skui_x11_resources_textures_steel_rgba() {
  return createBuffer(resources_textures_wood_rgba,
                      resources_textures_steel_rgba_len);
}
}