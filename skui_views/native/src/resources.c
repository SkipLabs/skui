#include <stdint.h>
#include <string.h>


extern unsigned char resources_src_small_bin[];
extern unsigned int resources_src_small_bin_len;


extern unsigned char resources_src_big_bin[];
extern unsigned int resources_src_big_bin_len;

char *SKIP_createByteArray(int32_t);

char *createBuffer(unsigned char *source, int len) {
  uint64_t size = len;
  char *buffer = SKIP_createByteArray(size);
  memcpy(buffer, source, size);
  return buffer;
}

char *SKIP_skui_views_resources_src_big_bin() {
  return createBuffer(resources_src_big_bin, resources_src_big_bin_len);
}

char *SKIP_skui_views_resources_src_small_bin() {
  return createBuffer(resources_src_small_bin, resources_src_small_bin_len);
}