#ifndef __SKUI_EVENT_MANAGER_H__
#define __SKUI_EVENT_MANAGER_H__

#include <X11/Xlib.h>
#include <functional>
#include <stdint.h>
#include <string>

namespace skui {

class EventManager {
public:
  virtual void resize(uint32_t wId, uint32_t width, uint32_t height,
                      uint32_t ratio) = 0;
  virtual void performFrame(void *enviroment, uint32_t ctxId, void *userContext,
                            uint32_t width, uint32_t height, uint32_t ratio,
                            std::function<void(void *)> onDone) = 0;
  virtual void requestClose(uint32_t wId) = 0;
  virtual void manageMouseLocation(uint32_t wId, uint32_t x, uint32_t y,
                                   uint32_t sx, uint32_t sy) = 0;
  virtual void manageMouseButton(uint32_t wId, uint32_t b, bool pressed) = 0;
  virtual void manageKeyPressed(uint32_t wId, uint32_t code, uint32_t sym,
                                const std::string &value) = 0;
  virtual void manageKeyReleased(uint32_t wId, uint32_t code) = 0;
  virtual void paste(uint32_t wId, const std::string &type,
                     const std::string &content) = 0;
};

} // namespace skui

#endif