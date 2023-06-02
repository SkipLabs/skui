#include "Supplier.h"
#include "GLWManager.h"
#include <iostream>

skui::WindowSupplier supplier;

#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))

extern "C"
{
  uint32_t SKIP_String_byteSize(char *str);
  void*  SKIP_SkuiX11gl_performFrame(void* enviroment, uint32_t ctxId, void* userContext, uint32_t width, uint32_t height);
}

namespace skui
{

class SKIPEventManager: public EventManager
{
public:
  SKIPEventManager() {}
  void resize(uint32_t wId, uint32_t width, uint32_t height) {}
  void performFrame(
    void* enviroment, uint32_t ctxId, void* userContext,
    uint32_t width, uint32_t height,
    std::function<void(void*)> onDone)
  {
    void* nContext = SKIP_SkuiX11gl_performFrame(enviroment, ctxId, userContext, width, height);
    onDone(nContext);
  }
  
  void requestClose(uint32_t wId)  {
    supplier.sendCloseMessage(wId);
  }

  void manageMouseLocation(uint32_t wId, uint32_t x, uint32_t y, uint32_t sx, uint32_t sy) {}
  void manageMouseButton(uint32_t wId, uint32_t b, bool pressed)  {}
  void manageKeyPressed(uint32_t wId, uint32_t code, uint32_t sym, const std::string &value) {}
  void manageKeyReleased(uint32_t wId, uint32_t code)  {}
  void paste(uint32_t wId, const std::string &type, const std::string &content) {};
};

}

extern "C"
{
  void SKIP_SkuiX11gl_run(
    void* environment,
    uint64_t wId, 
    uint64_t x, uint64_t y, uint64_t width, uint64_t height,
    char * skTitle, uint64_t screen, uint64_t framePerSecond)
  {
    TXT(skTitle, strTitle);
    skui::SKIPEventManager eManager;
    skui::WindowInfo info{x, y, width, height};
    skui::GLWindowManager manager(environment, wId, screen, framePerSecond, &eManager, [](uint64_t wid, uint64_t cId){});
    Display * display = supplier.init(manager, &info);
    manager.setTitle(strTitle);
    while (1)
    {
      if (supplier.handleWindowEvents(display))
      {
        break;
      }
    }
    manager.print(std::cout);
    std::cout << std::endl;
  }
}
