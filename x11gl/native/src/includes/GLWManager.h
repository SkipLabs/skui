#ifndef __SKUI_WINDOW_GL_H__
#define __SKUI_WINDOW_GL_H__

#include "AnimationFrame.h"
#include "EManager.h"
#include "Timer.h"
#include "WManager.h"
#include <GL/glx.h>
#include <exception>
#include <map>

namespace skui {

class VersionException : public std::exception {
public:
  VersionException(const std::string &msg) : m_msg(msg) {}
  ~VersionException() {}

  virtual const char *what() const throw() { return m_msg.c_str(); }

  const std::string m_msg;
};

class GLWindowManager : public WindowManager {
public:
  XVisualInfo *initializeDisplay(Display *disp, uint32_t screen);
  Atom createContext(Window window);
  void onIdle();
  void initialized(
      XIC xic,
      std::function<void(Display *disp, Window fWindow, uint64_t frames)>
          expose);
  void checkClipboard(XSelectionEvent *s);
  void updateClipboard(XSelectionRequestEvent *s);
  void requestClipboard(const std::string &mimeType,
                        const std::string &content);
  void resize(uint32_t width, uint32_t height);
  void performFrame(uint32_t count);
  void manageMouseLocation(uint32_t x, uint32_t y, uint32_t sx, uint32_t sy);
  void manageMouseButton(uint32_t b, bool pressed);
  void manageKeyPressed(uint32_t code, uint32_t sym, const std::string &value);
  void manageKeyReleased(uint32_t code);
  bool manageCustomEvent(XClientMessageEvent xclient);
  void sendCloseRequest();
  void print(std::ostream &buffer);

  GLWindowManager(void *enviroment, uint64_t wId, uint64_t screen,
                  uint64_t framePerSecond, EventManager *eventManager,
                  std::function<void(uint64_t, uint64_t)> onContextChange)
      : config{wId, screen, framePerSecond}, gLXFBConfig(nullptr),
        eventManager(eventManager), onContextChange(std::move(onContextChange)),
        userEnviroment(enviroment), userContext(nullptr) {
    display = nullptr;
  };

  WindowConfig configuration() { return config; }

  std::map<Atom, std::function<void(uint32_t, uint32_t)>> customMessages;

private:
  void requestClose();
  void close();
  float computeDpi();
  float getDpiFromResource();

  WindowConfig config;
  GLXFBConfig *gLXFBConfig;
  GLXContext context;
  XVisualInfo *visualInfo;
  std::string utf8;
  AnimationFrame animationFrame;
  Timer resourceTimer;
  EventManager *eventManager;
  std::function<void(u_int64_t, u_int64_t)> onContextChange;
  void *userEnviroment;
  void *userContext;
};

class CreateContextException : public std::exception {
public:
  CreateContextException() {}
  ~CreateContextException() {}

  virtual const char *what() const throw() {
    return "Unable to create Display context";
  }
};

} // namespace skui

void GL_checkTextureToDelete();

#endif