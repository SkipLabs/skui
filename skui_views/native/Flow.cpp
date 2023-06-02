#include "Supplier.h"
#include "GLWManager.h"
#include "Timer.h"
#include <atomic>
#include <iostream>

skui::WindowSupplier supplier;

#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))

Atom kSkuiFwkUpdateMessage;
Atom kSkuiMessageSend;
std::atomic<uint32_t> nextMsgId{0};
std::map<uint32_t, std::string> messages;
std::map<uint32_t, skui::Timer> timers;

extern "C"
{
  uint32_t SKIP_String_byteSize(char *str);
  char *SKIP_new_Obstack();
  void SKIP_destroy_Obstack(char *saved);
  char *sk_string_create(const char *buffer, uint32_t size);
  void SKIP_SKUIX11_manageKeyPressed(uint64_t wId, uint64_t keyCode, uint64_t keySym, char *keyValue);
  void SKIP_SKUIX11_manageKeyReleased(uint64_t wId, uint64_t keyCode);
  void SKIP_SKUIX11_manageMouseButton(uint64_t wId, uint64_t button, bool pressed);
  void SKIP_SKUIX11_manageMouseLocation(uint64_t wId, uint64_t x, uint64_t y, uint64_t screenX, uint64_t screenY);
  bool SKIP_SKUIX11_manageRequestClose(uint64_t wId);
  void SKIP_SKUIX11_manageResize(uint64_t wId, uint64_t w, uint64_t h);
  void SKIP_SKUIX11_performPaste(uint64_t wId, char *type, char *content);
  void SKIP_SKUIX11_windowInitialized(uint32_t wId);
  void SKIP_SKUIGL_performFrame(uint32_t ctxId, uint32_t width, uint32_t height);
  void SKIP_SKUIGL_setWindowContext(uint32_t wId, uint32_t ctxId);
  void SKIP_SKUIMessage_manage(char* message);
  void SKIP_SkuiViews_update();
  

  void SKIP_FWK_applyCursor(uint32_t wId, uint32_t cursor) {
    supplier.applyCursor(wId, cursor);
  }

  void SKIP_FWK_update(uint32_t wId)
  {
    supplier.sendClientMessage(wId, kSkuiFwkUpdateMessage, 0, 0);
  }

  void SKIP_SKUIX11_sendMessage(uint64_t wId, char *message, bool async, uint32_t delay)
  {
    TXT(message, strMessage);
    auto msgId = nextMsgId++;
    messages[msgId] = strMessage;
    if (delay > 0)
    {
      timers[msgId] = skui::Timer();
      timers[msgId].setTimeout(
        [wId, msgId]()
        { supplier.sendClientMessage(wId, kSkuiMessageSend, msgId, 0); },
        delay
      );
    }
    else
    {
      supplier.sendClientMessage(wId, kSkuiMessageSend, msgId, 0);
    }
  }
}


void manageMessage(uint32_t param1, uint32_t param2) {
  auto it = messages.find(param1);
  if (it != messages.end()) {
    auto nObstack = SKIP_new_Obstack();
    auto message = it->second;
    SKIP_SKUIMessage_manage(sk_string_create(message.c_str(), message.size()));
    SKIP_destroy_Obstack(nObstack);
  }
  auto tit = timers.find(param1);
  if (tit != timers.end())
  {
    timers.erase(tit);
  }
}

void manageUpdate(uint32_t param1, uint32_t param2) {
  SKIP_SkuiViews_update();
}

namespace skui
{

  class SKIPEventManager: public EventManager
  {
  public:
    SKIPEventManager() {}
    void performFrame(
      void* enviroment, uint32_t ctxId, void* userContext,
      uint32_t width, uint32_t height,
      std::function<void(void*)> onDone)
    {
      SKIP_SKUIGL_performFrame(ctxId, width, height);
      onDone(nullptr);
    }

    void resize(uint32_t wId, uint32_t width, uint32_t height) {
      SKIP_SKUIX11_manageResize(wId, width, height);
    }
    
    void requestClose(uint32_t wId)  {
      if (SKIP_SKUIX11_manageRequestClose(wId)) {
        supplier.sendCloseMessage(wId);
      }
    }

    void manageMouseLocation(uint32_t wId, uint32_t x, uint32_t y, uint32_t sx, uint32_t sy) {
      SKIP_SKUIX11_manageMouseLocation(wId, x, y, sx, sy);
    }

    void manageMouseButton(uint32_t wId, uint32_t b, bool pressed)  {
      SKIP_SKUIX11_manageMouseButton(wId, b, pressed);
    }

    void manageKeyPressed(uint32_t wId, uint32_t code, uint32_t sym, const std::string &value) {
      auto nObstack = SKIP_new_Obstack();
      auto skValue = sk_string_create(value.c_str(), value.size());
      SKIP_SKUIX11_manageKeyPressed(wId, code, sym, skValue);
      SKIP_destroy_Obstack(nObstack);
    }
    
    void manageKeyReleased(uint32_t wId, uint32_t code)  {
      SKIP_SKUIX11_manageKeyReleased(wId, code);
    }
    
    void paste(uint32_t wId, const std::string &type, const std::string &content) {
      auto nObstack = SKIP_new_Obstack();
      SKIP_SKUIX11_performPaste(
          wId,
          sk_string_create(type.c_str(), type.size()),
          sk_string_create(content.c_str(), content.size()));
      SKIP_destroy_Obstack(nObstack);
    }
  };
}

extern "C"
{

  void SKIP_SKUIX11_launch(
    uint64_t wId,
    char * skTitle, uint64_t screen, uint64_t framePerSecond)
  {
    TXT(skTitle, strTitle);
    skui::SKIPEventManager eManager;
    skui::GLWindowManager manager(nullptr, wId, screen, framePerSecond, &eManager, [](uint64_t wid, uint64_t cId){
      SKIP_SKUIGL_setWindowContext(wid, cId);
    });
    Display * display = supplier.init(manager, nullptr);
    kSkuiFwkUpdateMessage = XInternAtom(display, "SKUI_FWK_UPDATE", False);
    kSkuiMessageSend = XInternAtom(display, "SKUI_MESSAGE_SEND", False);
    manager.customMessages.insert(std::pair<Atom,std::function<void(uint32_t, uint32_t)>>(kSkuiFwkUpdateMessage, manageUpdate));
    manager.customMessages.insert(std::pair<Atom,std::function<void(uint32_t, uint32_t)>>(kSkuiMessageSend, manageMessage));
    manager.setTitle(strTitle);
    SKIP_SKUIX11_windowInitialized(wId);
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