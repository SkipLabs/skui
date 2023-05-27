#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <iostream>
#include <cassert>
#include <cstring>
#include <functional>
#include <unistd.h>
#include <atomic>
#include <chrono>
#include <algorithm>
#include <sstream>
#include <iomanip>
#include <math.h>
#include <map>
#include <memory>
#include "AnimationFrame.h"
#include "Manager.h"

struct XlibWindowInfo final
{
    Display*     fDisplay;
    Window      fWindow;
    int          fWidth;
    int          fHeight;
    XVisualInfo* fVisualInfo;
    void* fExtContext;
};



struct MouseLocation
{
  bool changed;
  uint64_t x;
  uint64_t y;
  uint64_t screenX;
  uint64_t screenY;

  MouseLocation() : changed(false),
                    x(0), y(0), screenX(0), screenY(0)
  {
  }

  void reset()
  {
    changed = false;
    x = 0;
    y = 0;
    screenX = 0;
    screenY = 0;
  }
};

template <typename T>
static constexpr bool ToBool(const T &x) { return 0 != x; }
template <typename T, size_t N>
char (&ArrayCountHelper(T (&array)[N]))[N];
#define ARRAY_COUNT(array) (sizeof(ArrayCountHelper(array)))
#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))

#ifndef TRACE
#define TRACE false
#endif 


class WindowException : public std::exception
{
public:
    WindowException(const std::string msg) : m_msg(msg)
    {
    }

   ~WindowException()
   {
   }

   virtual const char* what() const throw () 
   {
        return m_msg.c_str();
   }

   const std::string m_msg;
};


struct XWindow final
{
  Window fWindow;
  uint64_t fDisplay;
  GC fGC;
  XIC ic;
  Atom fWmDeleteMessage;
  Atom fPerformAnimationFrame;
  Atom fCloseMessage;
  XVisualInfo* fVisualInfo;
  void* fExtVisualInfo;
  void* fExtContext;
  
  XWindow() : fDisplay(-1), fVisualInfo(nullptr), fExtContext(nullptr), fExtVisualInfo(nullptr)
  {
  }
};

uint64_t displayCount = 0;
std::map<uint64_t, Display *> gDisplays;
std::map<uint64_t, XWindow> gWindows;
std::map<uint64_t, SKUiAnimationFrame> gAnimationFrames;
uint32_t exposeCount = 0;
uint32_t exposeMark = 0;

Display *display(uint64_t wId)
{
  uint64_t fDisplay = gWindows[wId].fDisplay;
  auto it = gDisplays.find(fDisplay);
  if (it == gDisplays.end())
  {
    return nullptr;
  }
  return it->second;
}

const long kEventMask = ExposureMask | StructureNotifyMask |
                        KeyPressMask | KeyReleaseMask |
                        PointerMotionMask | ButtonPressMask | ButtonReleaseMask |
                        EnterWindowMask | LeaveWindowMask;

void bytesToString(std::stringstream & ss, size_t byteCount)
{
  std::string suf[]  = { "B", "KB", "MB" }; //Longs run out around EB
  if (byteCount == 0) {
    ss << 0 << suf[0];
  } else {
    auto index = 0;
    double len = byteCount;
    while (len >= 1024 && index < 3) {
        index++;
        len = len/1024.0;
    }
    ss << std::setprecision(3) << len << suf[index];
  }
}

uint64_t createDisplay()
{
  XInitThreads();
  auto current = displayCount;
  auto display = XOpenDisplay(nullptr);
  if (display == nullptr)
  {
    std::cerr << std::string("Unable to create Display") << std::endl;
    exit(2);
  }
  auto count = XScreenCount(display);
  int width = 0, height = 0;
  for (int i = 0; i < count; i++)
  {
    auto screen = XScreenOfDisplay(display, i);
    auto w = XWidthOfScreen(screen);
    auto h = XHeightOfScreen(screen);
    width = w > width ? w : width;
    height = h > height ? h : height;
  };
  gDisplays[current] = display;
  displayCount++;
  return current;
}

Display *getDisplay(uint64_t dId)
{
  return gDisplays[dId];
}

void closeDisplay(uint64_t dId)
{
  auto it = gDisplays.find(dId);
  if (it == gDisplays.end())
  {
    return;
  }
  XCloseDisplay(gDisplays[dId]);
  gDisplays.erase(dId);
}

bool createWindow(uint64_t wId, uint64_t dId)
{
  auto dit = gDisplays.find(dId);
  if (dit == gDisplays.end())
  {
    return false;
  }
  auto wit = gWindows.find(wId);
  if (wit != gWindows.end())
  {
    return false;
  }
  gWindows[wId].fDisplay = dId;
  return true;
}

XVisualInfo* initializeDisplay(Display * disp, void* & info);
void* createContext(Window fWindow, Display * disp, XVisualInfo* visualInfo);
void closeContext(Display * disp, void* extContext, void* extVisualInfo);
void checkVersion();
void windowInitialized(uint32_t wId);

void initWindow(
  uint64_t wId,
  uint64_t initialX,
  uint64_t initialY,
  uint64_t initialWidth,
  uint64_t initialHeight,
  u_int32_t framePreSecond
)
{
  auto disp = display(wId);
  // Attempt to create a window that supports GL
  assert(nullptr == gWindows[wId].fVisualInfo);
  void* info = nullptr;
  gWindows[wId].fVisualInfo = initializeDisplay(disp, info);
  Colormap colorMap = XCreateColormap(disp,
                                    RootWindow(disp, gWindows[wId].fVisualInfo->screen),
                                    gWindows[wId].fVisualInfo->visual,
                                    AllocNone);
  XSetWindowAttributes swa;
  swa.colormap = colorMap;
  swa.event_mask = kEventMask;
  gWindows[wId].fWindow = XCreateWindow(disp,
                                      RootWindow(disp, gWindows[wId].fVisualInfo->screen),
                                      initialX, initialY,
                                      initialWidth, initialHeight,
                                      0, // border width
                                      gWindows[wId].fVisualInfo->depth,
                                      InputOutput,
                                      gWindows[wId].fVisualInfo->visual,
                                      CWEventMask | CWColormap,
                                      &swa);
  if (!gWindows[wId].fWindow) {
    throw WindowException("Unable to create window");
  }
  gWindows[wId].fExtContext = createContext(gWindows[wId].fWindow, disp, gWindows[wId].fVisualInfo);
  // set up to catch window delete message
  gWindows[wId].fWmDeleteMessage = XInternAtom(disp, "WM_DELETE_WINDOW", False);
  gWindows[wId].fPerformAnimationFrame = XInternAtom(disp, "PERFORM_ANIMATION_FRAME", False);
  gWindows[wId].fCloseMessage = XInternAtom(disp, "CLOSE_WINDOW", False);
  XSetWMProtocols(disp, gWindows[wId].fWindow, &gWindows[wId].fWmDeleteMessage, 1);
  windowInitialized(wId);
  gAnimationFrames[wId].start(
    [disp, wId]() {
      sendExposeMessage(disp, gWindows[wId].fWindow);
    },
    framePreSecond
  );
}

void attachWindow(uint64_t wId)
{
  auto it = gWindows.find(wId);
  if (it == gWindows.end())
  {
    throw WindowException("Unable to find the window to attach");
  }
  auto disp = display(wId);

  XlibWindowInfo winInfo;
  winInfo.fDisplay = disp;
  winInfo.fWindow = gWindows[wId].fWindow;
  winInfo.fExtContext= gWindows[wId].fExtContext;
  winInfo.fVisualInfo = gWindows[wId].fVisualInfo;

  XWindowAttributes attrs;
  if (XGetWindowAttributes(disp, gWindows[wId].fWindow, &attrs))
  {
    winInfo.fWidth = attrs.width;
    winInfo.fHeight = attrs.height;
  }
  else
  {
    winInfo.fWidth = winInfo.fHeight = 0;
  }
  XMapWindow(disp, gWindows[wId].fWindow);
  auto im = XOpenIM(disp, NULL, NULL, NULL);
  if (im == NULL)
  {
    throw WindowException("Unable to open window");
  }
  XIMStyles *styles;
  auto failed_arg = XGetIMValues(im, XNQueryInputStyle, &styles, NULL);
  if (failed_arg != NULL)
  {
    throw WindowException("Unable to gather styles");
  }
  auto ic = XCreateIC(im, XNInputStyle, XIMPreeditNothing | XIMStatusNothing, XNClientWindow, gWindows[wId].fWindow, NULL);
  if (ic == NULL)
  {
    throw WindowException("Unable to create client");
  }
  XSetICFocus(ic);
  gWindows[wId].ic = ic;
}

void detachWindow(uint64_t wId)
{
}

void closeWindow(uint64_t wId)
{
  auto disp = display(wId);
  if (disp)
  {
    closeContext(disp, gWindows[wId].fExtContext, gWindows[wId].fExtVisualInfo);
    gWindows[wId].fExtContext = nullptr;
    gWindows[wId].fExtVisualInfo = nullptr;
    XUnmapWindow(disp, wId);
    XFlush(disp);
    detachWindow(wId);
    if (gWindows[wId].fGC)
    {
      //XFreeGC(disp, gWindows[wId].fGC);
      gWindows[wId].fGC = nullptr;
    }
    XDestroyWindow(disp, gWindows[wId].fWindow);
    gWindows[wId].fWindow = 0;
    if (gWindows[wId].fVisualInfo)
    {
      //XFree(gWindows[wId].fVisualInfo);
      gWindows[wId].fVisualInfo = nullptr;
    }
    gWindows[wId].fDisplay = -1;
    gWindows.erase(wId);
  }
}

void setWindowTitle(uint64_t wId, const char *title)
{
  XTextProperty textproperty;
  XStringListToTextProperty(const_cast<char **>(&title), 1, &textproperty);
  XSetWMName(display(wId), gWindows[wId].fWindow, &textproperty);
}

bool handleWindowEvents(uint64_t fDisplay, uint64_t fWindow, SKUiWindowManager & manager)
{
  auto display = gDisplays[fDisplay];
  float ellapsed;
  int count = 0;
  KeySym keysym = 0;
  KeyCode srccode = 0;
  char buf[20];
  Status status = 0;
  double start;
  bool is_retriggered;
  char *keyValue, *nObstack;
  MouseLocation location;
  XWindowAttributes gwa;
  Window win, owner;
  XSelectionRequestEvent *sev;
  bool closed = false;

  //($state, $icon_window) = X11::Protocol::WM::get_wm_state ($X, $window)
  // Handle all pending XEvents (if any) and flush the input
  // Only handle a finite number of events before finishing resize and paint..
  count = XEventsQueued(display, QueuedAfterReading);
  if (count > 0)
  {
    // collapse any Expose and Resize events.
    while (count--)
    {
      XEvent event;
      XNextEvent(display, &event);
      uint64_t current = -1;
      for (auto it = gWindows.begin(); it != gWindows.end(); ++it)
      {
        if (it->second.fWindow == event.xany.window)
        {
          current = it->first;
        }
      }
      if (current != fWindow)
      {
        continue;
      }
      std::string keyValue;
      switch (event.type)
      {
      case Expose:
        win = gWindows[current].fWindow;
        XGetWindowAttributes(display, win, &gwa);
        manager.performFrame(display, win, gwa.width, gwa.height, [current]() {
          gAnimationFrames[current].framePerformed();
        });
        break;
      case ConfigureNotify:
        manager.resize(event.xconfigurerequest.width, event.xconfigurerequest.height);
        break;
      case MapNotify:
        if (!gWindows[current].fGC)
        {
          gWindows[current].fGC = XCreateGC(display, gWindows[current].fWindow, 0, nullptr);
        }
        break;
      case ClientMessage:
        if ((Atom)event.xclient.data.l[0] == gWindows[current].fWmDeleteMessage &&
            gWindows.size() == 1)
        {
          manager.close();
        }
        else if (event.xclient.message_type == gWindows[current].fCloseMessage)
        {
          closed = true;
        }
        break;
      case ButtonPress:
      case ButtonRelease:
        if (location.changed)
        {
          manager.manageMouseLocation(
              location.x, location.y,
              location.screenX, location.screenY);
          location.reset();
        }
        {
          bool pressed = event.type == ButtonPress;
          manager.manageMouseButton(event.xbutton.button, pressed);
        }
        break;
      case MotionNotify:
        location.changed = true;
        location.x = event.xmotion.x;
        location.y = event.xmotion.y;
        location.screenX = event.xmotion.x_root;
        location.screenY = event.xmotion.y_root;
        break;
      case EnterNotify:
      case LeaveNotify:
        location.changed = true;
        location.x = event.xcrossing.x;
        location.y = event.xcrossing.y;
        location.screenX = event.xcrossing.x_root;
        location.screenY = event.xcrossing.y_root;
        break;
      case KeyPress:
        if (location.changed)
        {
          manager.manageMouseLocation(
              location.x, location.y,
              location.screenX, location.screenY);
          location.reset();
        }
        count = Xutf8LookupString(gWindows[current].ic, (XKeyPressedEvent *)&event, buf, 20, &keysym, &status);
        if (count != 0)
        {
          buf[count] = '\0';
          keyValue = std::string(buf, count);
        }
        manager.manageKeyPressed(event.xkey.keycode, keysym, keyValue);
        keyValue.clear();
        break;
      case KeyRelease:
        is_retriggered = false;
        if (count == 0)
        {
          count = XEventsQueued(display, QueuedAfterReading);
        }
        if (count > 0)
        {
          XEvent nextEvent;
          XPeekEvent(display, &nextEvent);

          if (nextEvent.type == KeyPress && nextEvent.xkey.time == event.xkey.time &&
              nextEvent.xkey.keycode == event.xkey.keycode)
          {
            // delete retriggered KeyPress event
            XNextEvent(display, &event);
            is_retriggered = true;
            count--;
          }
        }
        if (!is_retriggered)
        {
          manager.manageKeyReleased(event.xkey.keycode);
        }
        break;
      case SelectionClear:
        break;
      case SelectionRequest:
        manager.updateClipboard((XSelectionRequestEvent *)&event.xselectionrequest);
        break;
      case SelectionNotify:
        manager.checkClipboard((XSelectionEvent *)&event.xselection, win);
        break;
      default:
        if (location.changed)
        {
          manager.manageMouseLocation(
              location.x, location.y,
              location.screenX, location.screenY);
          location.reset();
        };
        // these events should be handled in the main event loop
        assert(event.type != Expose && event.type != ConfigureNotify);
        break;
      }
    }
    if (location.changed)
    {
      manager.manageMouseLocation(
          location.x, location.y,
          location.screenX, location.screenY);
      location.reset();
    }
    manager.onIdle();
  }
  else
  {
    // Idle main window
    // We are only really "idle" when the timer went off with zero events.
    manager.onIdle();
    usleep(2000);
  }
  if (closed)
  {
    //mainTimer.stop();
  }
  return closed;
}

void sendExposeMessage(Display *disp, Window fWindow)
{
  XWindowAttributes gwa;
  XGetWindowAttributes(disp, fWindow, &gwa);
  XEvent event;
  event.type = Expose;
  event.xexpose.send_event = True;
  event.xexpose.display = disp;
  event.xexpose.window = fWindow;
  event.xexpose.x = 0;
  event.xexpose.y = 0;
  event.xexpose.width = gwa.width;
  event.xexpose.height = gwa.height;
  event.xexpose.count = 0;
  if (XSendEvent(disp, fWindow, False, ExposureMask, &event) != 0)
  {
    XFlush(disp);
  }
  else
  {
    std::cerr << "The conversion to wire protocol format failed" << std::endl;
  };
}

void sendClientMessage(uint32_t wId, Atom type, uint32_t param1, uint32_t param2)
{
  auto disp = display(wId);
  if (disp != nullptr) {
    XEvent event;
    event.type = ClientMessage;
    event.xclient.send_event = True;
    event.xclient.display = disp;
    event.xclient.window = gWindows[wId].fWindow;
    event.xclient.message_type = type;
    event.xclient.format = 32;
    event.xclient.data.l[0] = type;
    event.xclient.data.l[1] = param1;
    event.xclient.data.l[2] = param2;
    if (XSendEvent(disp, gWindows[wId].fWindow, False, NoEventMask, &event) != 0)
    {
      XFlush(disp);
    }
    else
    {
      std::cerr << "The conversion to wire protocol format failed" << std::endl;
    };
  } else {
    std::cerr << "Try to send message while display is closed" << std::endl;
  };
}

void sendCloseMessage(uint32_t wId)
{
  sendClientMessage(wId, gWindows[wId].fCloseMessage, 0, 0);
}

void sendPerformAnimationFrame(uint32_t wId)
{
  sendClientMessage(wId, gWindows[wId].fPerformAnimationFrame, 0, 0);
}
