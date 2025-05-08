#ifndef __SKUI_WINDOW_MANAGER_H__
#define __SKUI_WINDOW_MANAGER_H__

#include <X11/Xutil.h>
#include <functional>
#include <limits.h>
#include <string>

namespace skui {

struct Messages final {
  Atom fWmDeleteMessage;
  Atom fCloseMessage;
  Atom fCheckResources;
};

struct WindowConfig final {
  u_int64_t wId;
  u_int64_t screen;
  u_int64_t framePerSecond;
};

void sendXClientMessage(Display *disp, Window window, Atom type,
                        uint32_t param1, uint32_t param2);

class WindowManager {
public:
  virtual WindowConfig configuration() = 0;
  virtual XVisualInfo *initializeDisplay(Display *disp, uint32_t screen) = 0;
  virtual Atom createContext(Window window) = 0;
  virtual void initialized(XIC xic,
                           std::function<void(uint64_t frames)> expose) = 0;
  virtual void onIdle() = 0;
  virtual void checkClipboard(XSelectionEvent *s) = 0;
  virtual void updateClipboard(XSelectionRequestEvent *s) = 0;
  virtual void requestClipboard(const std::string &mimeType,
                                const std::string &content) = 0;
  virtual void resize(uint32_t width, uint32_t height) = 0;
  virtual void performFrame(uint32_t count) = 0;
  virtual void manageMouseLocation(uint32_t x, uint32_t y, uint32_t sx,
                                   uint32_t sy) = 0;
  virtual void manageMouseButton(uint32_t b, bool pressed) = 0;
  virtual void manageKeyPressed(uint32_t code, uint32_t sym,
                                const std::string &value) = 0;
  virtual void manageKeyReleased(uint32_t code) = 0;
  virtual bool manageCustomEvent(XClientMessageEvent xclient) = 0;
  virtual void sendCloseRequest() = 0;

  inline bool is(Window window) { return this->window == window; }

  void setTitle(const std::string &strTitle) {
    const char *title = strTitle.c_str();
    XTextProperty textproperty;
    XStringListToTextProperty(const_cast<char **>(&title), 1, &textproperty);
    XSetWMName(this->display, this->window, &textproperty);
  }

  void checkGC() {
    if (!this->gc && this->display != nullptr) {
      this->gc = XCreateGC(this->display, this->window, 0, nullptr);
    }
  }

  void applyCursor(Cursor cursor) {
    if (this->display == nullptr)
      return;
    if (cursor == 0) {
      XUndefineCursor(this->display, this->window);
    } else {
      XDefineCursor(this->display, this->window, cursor);
    }
  }

  void sendClientMessage(Atom type, uint32_t param1, uint32_t param2) {
    sendXClientMessage(this->display, this->window, type, param1, param2);
  }

  XIC xic;

protected:
  Display *display;
  GC gc;
  Window window;
  Messages messages;

  bool gatherClipboad(std::string &value, Atom &format) {
    // Atom targets = XInternAtom(display, "TARGETS", False);
    // Atom clipboard = XInternAtom(display, "CLIPBOARD", False);
    Atom property = XInternAtom(display, "XSEL_DATA", False);
    char *result;
    unsigned long ressize, restail;
    int resbits;
    Atom incrid = XInternAtom(display, "INCR", False);
    XGetWindowProperty(display, window, property, 0, LONG_MAX / 4, False,
                       AnyPropertyType, &format, &resbits, &ressize, &restail,
                       (unsigned char **)&result);
    bool isIncr = format == incrid;
    if (isIncr)
      printf("Buffer is too large and INCR reading is not implemented yet.\n");
    value = std::string(result, ressize);
    XFree(result);
    return !isIncr;
  }

  void sendSelectionNotify(XSelectionRequestEvent *xselectionrequest,
                           bool none) {
    XSelectionEvent ssev;
    /* All of these should match the values of the request. */
    ssev.type = SelectionNotify;
    ssev.requestor = xselectionrequest->requestor;
    ssev.selection = xselectionrequest->selection;
    ssev.target = xselectionrequest->target;
    if (none) {
      ssev.property = None; /* signifies "nope" */
    } else {
      ssev.property = xselectionrequest->property;
    }
    ssev.time = xselectionrequest->time;
    XSendEvent(display, xselectionrequest->requestor, True, NoEventMask,
               (XEvent *)&ssev);
  }
};

} // namespace skui

#endif