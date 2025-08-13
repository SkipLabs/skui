#include "GLWManager.h"
#include "Supplier.h"
#include <iostream>

skui::WindowSupplier supplier;

#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))

extern "C" {
uint32_t SKIP_String_byteSize(char *str);
void *SKIP_SkuiX11gl_performFrame(void *enviroment, uint32_t ctxId,
                                  void *userContext, uint32_t width,
                                  uint32_t height, uint32_t ratio,
                                  uint32_t frames);
}

namespace skui {

class SKIPEventManager : public EventManager {
public:
  SKIPEventManager() {}
  void resize(uint32_t, uint32_t, uint32_t, uint32_t) {}
  void performFrame(void *enviroment, uint32_t ctxId, void *userContext,
                    uint32_t width, uint32_t height, uint32_t ratio,
                    uint32_t frames, std::function<void(void *)> onDone) {
    (void)enviroment;
    (void)userContext;
    void *nContext = SKIP_SkuiX11gl_performFrame(enviroment, ctxId, userContext,
                                                 width, height, ratio, frames);
    onDone(nContext);
  }

  void requestClose(uint32_t wId) { supplier.sendCloseMessage(wId); }

  void manageMouseLocation(uint32_t, uint32_t, uint32_t, uint32_t, uint32_t) {}
  void manageMouseButton(uint32_t, uint32_t, bool) {}
  void manageKeyPressed(uint32_t, uint32_t, uint32_t, const std::string &) {}
  void manageKeyReleased(uint32_t, uint32_t) {}
  void paste(uint32_t, const std::string &, const std::string &) {};
};

} // namespace skui

Atom kSkuiAnimationFrame;

extern "C" {
void SKIP_SkuiX11gl_run(void *environment, uint64_t wId, uint64_t x, uint64_t y,
                        uint64_t width, uint64_t height, char *skTitle,
                        uint64_t screen, uint64_t framePerSecond) {
  TXT(skTitle, strTitle);
  skui::SKIPEventManager eManager;
  skui::WindowInfo info{x, y, width, height};
  skui::GLWindowManager manager(environment, wId, screen, framePerSecond,
                                &eManager, [](uint64_t, uint64_t) {});
  XIC xic;
  Display *display = supplier.init(xic, manager, &info);
  kSkuiAnimationFrame = XInternAtom(display, "SKUI_ANIMATION_FRAME", False);
  manager.setTitle(strTitle);
  manager.customMessages.insert(
      std::pair<Atom, std::function<void(uint32_t, uint32_t)>>(
          kSkuiAnimationFrame, [&manager](uint32_t param1, uint32_t) {
            manager.performFrame(param1);
          }));
  manager.initialized(xic, [wId](uint64_t frames) {
    supplier.sendClientMessage(wId, kSkuiAnimationFrame, (uint32_t)frames, 0);
  });
  while (1) {
    if (supplier.handleWindowEvents(display)) {
      break;
    }
  }
  manager.print(std::cout);
  std::cout << std::endl;
}
}
