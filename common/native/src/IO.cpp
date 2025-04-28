#include "IO.h"
#include <map>
#include <string.h>

namespace skui {

class Data {

public:
  bool binary;
  std::string text;
  char *bytes;
  size_t size;

  Data() : binary(false), text("") {}
  Data(std::string text) : binary(false), text(text) {}
  Data(char *bytes, size_t size) : binary(true), bytes(bytes), size(size) {}

  ~Data() {
    if (this->binary) {
      delete[] this->bytes;
    }
  }
};

std::map<uint32_t, Data> gData;
uint32_t dataId = 0;

uint32_t registerString(std::string text) {
  uint32_t id = ++dataId;
  gData[id] = Data(text);
  return id;
}

uint32_t registerBytes(char *bytes, size_t size) {
  uint32_t id = ++dataId;
  gData[id] = Data(bytes, size);
  return id;
}

} // namespace skui

extern "C" {
uint32_t SKIP_String_byteSize(char *str);
char *sk_string_create(const char *buffer, uint32_t size);
char *SKIP_createByteArray(int32_t);
char *SKIP_chillByteArray(char *);

bool SKIP_IO_isExternalBinary(uint32_t id) {
  auto it = skui::gData.find(id);
  if (it == skui::gData.end()) {
    return false;
  }
  return it->second.binary;
}

char *SKIP_IO_getExternalText(uint32_t id) {
  auto it = skui::gData.find(id);
  if (it == skui::gData.end()) {
    return nullptr;
  }
  auto txt = it->second.text;
  return sk_string_create(txt.c_str(), txt.size());
}

void SKIP_IO_deleteExternalData(uint32_t id) {
  auto it = skui::gData.find(id);
  if (it == skui::gData.end()) {
    return;
  }
  skui::gData.erase(id);
}

char *SKIP_IO_getExternalBytes(uint32_t id) {
  auto it = skui::gData.find(id);
  if (it == skui::gData.end()) {
    return nullptr;
  }
  auto bytes = it->second.bytes;
  auto size = it->second.size;
  auto skBytes = SKIP_createByteArray(size);
  memcpy(skBytes, (const char *)bytes, size);
  return skBytes;
}
}