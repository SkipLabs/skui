#ifndef __SKUI_IO_H__
#define __SKUI_IO_H__

#include <cstdint>
#include <string>

namespace skui {

uint32_t registerString(std::string text);
uint32_t registerBytes(char *bytes, size_t size);

} // namespace skui

#endif
