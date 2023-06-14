#include <stdlib.h>
#include <cstdint>
#include <string>

#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))

extern "C" {

  uint32_t SKIP_String_byteSize(char *str);

  bool SKIP_setenv(char* name, char* value, bool replace) {
    TXT(name, strName);
    TXT(value, strValue);
    return setenv(strName.c_str(), strValue.c_str(), replace);
  }
}