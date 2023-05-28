#ifndef __SKUI_WINDOW_GL_H__
#define __SKUI_WINDOW_GL_H__

#include "WManager.h"
#include <exception>
#include <GL/glx.h>
#include "AnimationFrame.h"
#include "EManager.h"

namespace skui
{

  class VersionException : public std::exception
  {
  public:
    VersionException(const std::string &msg) : m_msg(msg) {}
    ~VersionException() {}

    virtual const char *what() const throw()
    {
      return m_msg.c_str();
    }

    const std::string m_msg;
  };

  class GLWindowManager : public WindowManager
  {
  public:
    XVisualInfo *initializeDisplay(Display *disp, uint32_t screen);
    Atom createContext(Window window);
    void onIdle();
    void initiliazed(XIC xic, std::function<void(Display *disp, Window fWindow)> expose);
    void checkClipboard(XSelectionEvent *s);
    void updateClipboard(XSelectionRequestEvent *s);
    void requestClipboard(const std::string &mimeType, const std::string &content);
    void resize(uint32_t width, uint32_t height);
    void performFrame(uint32_t width, uint32_t height);
    void manageMouseLocation(uint32_t x, uint32_t y, uint32_t sx, uint32_t sy);
    void manageMouseButton(uint32_t b, bool pressed);
    void manageKeyPressed(uint32_t code, uint32_t sym, const std::string &value);
    void manageKeyReleased(uint32_t code);
    bool manageCustomEvent(XClientMessageEvent xclient);
    void sendCloseRequest();

    GLWindowManager(
        uint64_t wId,
        uint64_t x, uint64_t y,
        uint64_t width, uint64_t height,
        uint64_t screen, uint64_t framePerSecond,
        EventManager *eventManager)
        : config{wId, x, y, width, height, screen, framePerSecond}, gLXFBConfig(nullptr), eventManager(eventManager)
    {
      display = nullptr;
    };

    WindowConfig configuration() { return config; }

  private:
    void requestClose();
    void close();

    WindowConfig config;
    GLXFBConfig *gLXFBConfig;
    GLXContext context;
    XVisualInfo *visualInfo;
    std::string utf8;
    AnimationFrame animationFrame;
    EventManager *eventManager;
  };

  class CreateContextException : public std::exception
  {
  public:
    CreateContextException() {}
    ~CreateContextException() {}

    virtual const char *what() const throw()
    {
      return "Unable to create Display context";
    }
  };

}

void GL_checkTextureToDelete();

#endif