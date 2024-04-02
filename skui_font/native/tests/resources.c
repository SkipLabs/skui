#include <stdint.h>

extern unsigned char resources_tests_luximr_bin[];
extern unsigned int resources_tests_luximr_bin_len;

extern unsigned char resources_tests_luxirr_bin[];
extern unsigned int resources_tests_luxirr_bin_len;

extern unsigned char resources_tests_luxisr_bin[];
extern unsigned int resources_tests_luxisr_bin_len;

extern unsigned char resources_tests_xab_bin[];
extern unsigned int resources_tests_xab_bin_len;

extern unsigned char resources_tests_xdsff_bin[];
extern unsigned int resources_tests_xdsff_bin_len;

extern unsigned char resources_tests_xdvso_bin[];
extern unsigned int resources_tests_xdvso_bin_len;

extern unsigned char resources_tests_xtnr_bin[];
extern unsigned int resources_tests_xtnr_bin_len;

char *SKIP_createByteArray(int32_t);

char *createBuffer(const char *source, int len)
{
  uint64_t size = len;
  char *buffer = SKIP_createByteArray(size);
  memcpy(buffer, source, size);
  return buffer;
}

char *SKIP_resources_tests_luxirr_bin()
{
  return createBuffer(resources_tests_luxirr_bin, resources_tests_luxirr_bin_len);
}

char *SKIP_resources_tests_luximr_bin()
{
  return createBuffer(resources_tests_luximr_bin, resources_tests_luximr_bin_len);
}

char *SKIP_resources_tests_luxisr_bin()
{
  return createBuffer(resources_tests_luxisr_bin, resources_tests_luxisr_bin_len);
}

char *SKIP_resources_tests_xab_bin()
{
  return createBuffer(resources_tests_xab_bin, resources_tests_xab_bin_len);
}

char *SKIP_resources_tests_xdsff_bin()
{
  return createBuffer(resources_tests_xdsff_bin, resources_tests_xdsff_bin_len);
}

char *SKIP_resources_tests_xdvso_bin()
{
  return createBuffer(resources_tests_xdvso_bin, resources_tests_xdvso_bin_len);
}

char *SKIP_resources_tests_xtnr_bin()
{
  return createBuffer(resources_tests_xtnr_bin, resources_tests_xtnr_bin_len);
}