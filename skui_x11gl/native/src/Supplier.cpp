
#include "Supplier.h"
#include "WManager.h"
#include "X11/cursorfont.h"
#include <X11/Xcursor/Xcursor.h>
#include <algorithm>
#include <atomic>
#include <cassert>
#include <chrono>
#include <cstring>
#include <iomanip>
#include <iostream>
#include <map>
#include <math.h>
#include <memory>
#include <sstream>
#include <unistd.h>

const long kEventMask = ExposureMask | StructureNotifyMask | KeyPressMask |
                        KeyReleaseMask | PointerMotionMask | ButtonPressMask |
                        ButtonReleaseMask | EnterWindowMask | LeaveWindowMask;

#ifndef IDLE_TIME
#define IDLE_TIME 2000
#endif

namespace skui {
void WindowSupplier::applyCursor(uint32_t wId, uint32_t cursor) {
  auto it = this->windows.find(wId);
  if (it != this->windows.end()) {
    it->second->applyCursor(this->cursors[cursor]);
  }
}

void WindowSupplier::sendClientMessage(uint32_t wId, Atom type, uint32_t param1,
                                       uint32_t param2) {
  auto it = this->windows.find(wId);
  if (it != this->windows.end()) {
    it->second->sendClientMessage(type, param1, param2);
  }
}

Display *WindowSupplier::init(WindowManager &vManager, WindowInfo *info) {
  XInitThreads();
  auto display = XOpenDisplay(nullptr);
  this->cursors[0] = XCreateFontCursor(display, XC_arrow); // NoneCursor // TODO
  this->cursors[2] = XCreateFontCursor(display, XC_hand2); // HandCursor
  this->cursors[3] = XCreateFontCursor(display, XC_hand2); // OpenHandCursor
  this->cursors[4] = XCreateFontCursor(display, XC_hand2); // ClosedHandCursor
  this->cursors[5] =
      XCreateFontCursor(display, XC_crosshair); // CrosshairCursor
  this->cursors[6] =
      XCreateFontCursor(display, XC_arrow); // DisappearCursor // TODO
  this->cursors[7] = XcursorLibraryLoadCursor(display, "move"); // MoveCursor
  this->cursors[8] =
      XCreateFontCursor(display, XC_top_side); // NorthResizeCursor
  this->cursors[9] =
      XCreateFontCursor(display, XC_top_right_corner); // NorthEastResizeCursor
  this->cursors[10] =
      XCreateFontCursor(display, XC_right_side); // EastResizeCursor
  this->cursors[11] = XCreateFontCursor(
      display, XC_bottom_right_corner); // SouthEastResizeCursor
  this->cursors[12] =
      XCreateFontCursor(display, XC_bottom_side); // SouthResizeCursor
  this->cursors[13] = XCreateFontCursor(
      display, XC_bottom_left_corner); // SouthWestResizeCursor
  this->cursors[14] =
      XCreateFontCursor(display, XC_left_side); // WestResizeCursor
  this->cursors[15] =
      XCreateFontCursor(display, XC_top_left_corner); // NorthWestResizeCursor
  this->cursors[16] = XCreateFontCursor(
      display, XC_sb_h_double_arrow); // HorizontalResizeCursor
  this->cursors[17] =
      XCreateFontCursor(display, XC_sb_v_double_arrow); // VerticalResizeCursor
  this->cursors[18] = XCreateFontCursor(display, XC_xterm);  // TextCursor
  this->cursors[19] = XCreateFontCursor(display, XC_watch);  // WaitCursor
  this->cursors[20] = XCreateFontCursor(display, XC_circle); // ForbiddenCursor
  this->cursors[21] = XCreateFontCursor(display, XC_plus);   // PlusCursor
  this->cursors[22] =
      XCreateFontCursor(display, XC_question_arrow); // QuestionCursor
  this->cursors[23] =
      XcursorLibraryLoadCursor(display, "dnd-copy"); // DnDCopyCursor
  this->cursors[24] =
      XcursorLibraryLoadCursor(display, "dnd-link"); // DnDLinkCursor
  this->cursors[25] =
      XcursorLibraryLoadCursor(display, "dnd-move"); // DnDMoveCursor
  this->cursors[26] =
      XcursorLibraryLoadCursor(display, "dnd-none"); // DnDNoneCursor
  this->cursors[27] =
      XcursorLibraryLoadCursor(display, "dnd-ask"); // DnDAskCursor
  auto config = vManager.configuration();
  if (display == nullptr) {
    throw WindowException("Unable to create Display");
  }
  auto count = XScreenCount(display);

  if ((int)config.screen >= count) {
    config.screen = 0;
  }
  auto screen = XScreenOfDisplay(display, config.screen);
  u_int64_t width = XWidthOfScreen(screen);
  u_int64_t height = XHeightOfScreen(screen);
  auto wId = config.wId;
  // Attempt to create a window that supports GL
  XVisualInfo *fVisualInfo = vManager.initializeDisplay(display, config.screen);
  Colormap colorMap =
      XCreateColormap(display, RootWindow(display, fVisualInfo->screen),
                      fVisualInfo->visual, AllocNone);
  XSetWindowAttributes swa;
  swa.colormap = colorMap;
  swa.event_mask = kEventMask;
  WindowInfo wInfo;
  if (info != nullptr) {
    wInfo = *info;
  } else {
    wInfo = {0, 0, std::min(width, (u_int64_t)1920),
             std::max(height - 100, (u_int64_t)600)};
  }
  auto fWindow =
      XCreateWindow(display, RootWindow(display, fVisualInfo->screen), wInfo.x,
                    wInfo.y, wInfo.width, wInfo.height,
                    0, // border width
                    fVisualInfo->depth, InputOutput, fVisualInfo->visual,
                    CWEventMask | CWColormap, &swa);
  if (!fWindow) {
    throw WindowException("Unable to create window");
  }
  Atom fWmDeleteMessage = vManager.createContext(fWindow);
  XSetWMProtocols(display, fWindow, &fWmDeleteMessage, 1);
  XMapWindow(display, fWindow);
  auto im = XOpenIM(display, NULL, NULL, NULL);
  if (im == NULL) {
    throw WindowException("Unable to open window");
  }
  XIMStyles *styles;
  auto failed_arg = XGetIMValues(im, XNQueryInputStyle, &styles, NULL);
  if (failed_arg != NULL) {
    throw WindowException("Unable to gather styles");
  }
  auto ic = XCreateIC(im, XNInputStyle, XIMPreeditNothing | XIMStatusNothing,
                      XNClientWindow, fWindow, NULL);
  if (ic == NULL) {
    throw WindowException("Unable to create client");
  }
  XSetICFocus(ic);
  this->windows[wId] = &vManager;
  vManager.initiliazed(ic, sendExposeMessage);
  return display;
}

bool WindowSupplier::handleWindowEvents(Display *display) {
  int count = 0;
  KeySym keysym = 0;
  char buf[20];
  Status status = 0;
  bool is_retriggered;
  MouseLocation location;
  bool closed = false;
  uint64_t current = -1;
  WindowManager *wManager = nullptr;
  //($state, $icon_window) = X11::Protocol::WM::get_wm_state ($X, $window)
  // Handle all pending XEvents (if any) and flush the input
  // Only handle a finite number of events before finishing resize and paint..
  count = XEventsQueued(display, QueuedAfterFlush);
  if (count > 0) {
    // collapse any Expose and Resize events.
    while (count--) {
      XEvent event;
      XNextEvent(display, &event);
      if (wManager == nullptr || !wManager->is(event.xany.window)) {
        wManager = nullptr;
        current = -1;
        for (auto it = this->windows.begin(); it != this->windows.end(); ++it) {
          if (it->second->is(event.xany.window)) {
            current = it->first;
            wManager = it->second;
          }
        }
      }
      if (current < 0 || wManager == nullptr) {
        continue;
      }
      std::string keyValue;
      switch (event.type) {
      case Expose:
        wManager->performFrame();
        break;
      case ConfigureNotify:
        wManager->resize(event.xconfigurerequest.width,
                         event.xconfigurerequest.height);
        break;
      case MapNotify:
        wManager->checkGC();
        break;
      case ClientMessage:
        closed = wManager->manageCustomEvent(event.xclient);
        break;
      case ButtonPress:
      case ButtonRelease:
        if (location.changed) {
          wManager->manageMouseLocation(location.x, location.y,
                                        location.screenX, location.screenY);
          location.reset();
        }
        {
          bool pressed = event.type == ButtonPress;
          wManager->manageMouseButton(event.xbutton.button, pressed);
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
        if (location.changed) {
          wManager->manageMouseLocation(location.x, location.y,
                                        location.screenX, location.screenY);
          location.reset();
        }
        count = Xutf8LookupString(wManager->xic, (XKeyPressedEvent *)&event,
                                  buf, 20, &keysym, &status);
        if (count != 0) {
          buf[count] = '\0';
          keyValue = std::string(buf, count);
        }
        wManager->manageKeyPressed(event.xkey.keycode, keysym, keyValue);
        keyValue.clear();
        break;
      case KeyRelease:
        is_retriggered = false;
        if (count == 0) {
          count = XEventsQueued(display, QueuedAfterReading);
        }
        if (count > 0) {
          XEvent nextEvent;
          XPeekEvent(display, &nextEvent);

          if (nextEvent.type == KeyPress &&
              nextEvent.xkey.time == event.xkey.time &&
              nextEvent.xkey.keycode == event.xkey.keycode) {
            // delete retriggered KeyPress event
            XNextEvent(display, &event);
            is_retriggered = true;
            count--;
          }
        }
        if (!is_retriggered) {
          wManager->manageKeyReleased(event.xkey.keycode);
        }
        break;
      case SelectionClear:
        break;
      case SelectionRequest:
        wManager->updateClipboard(
            (XSelectionRequestEvent *)&event.xselectionrequest);
        break;
      case SelectionNotify:
        wManager->checkClipboard((XSelectionEvent *)&event.xselection);
        break;
      default:
        if (location.changed) {
          wManager->manageMouseLocation(location.x, location.y,
                                        location.screenX, location.screenY);
          location.reset();
        }
        // these events should be handled in the main event loop
        assert(event.type != Expose && event.type != ConfigureNotify);
        break;
      }
    }
    if (wManager != nullptr) {
      if (location.changed) {
        wManager->manageMouseLocation(location.x, location.y, location.screenX,
                                      location.screenY);
        location.reset();
      }
      wManager->onIdle();
    }
  } else {
    // Idle main window
    // We are only really "idle" when the timer went off with zero events.
    if (wManager != nullptr) {
      wManager->onIdle();
    }
  }
  return closed;
}

void WindowSupplier::sendCloseMessage(uint32_t wId) {
  auto it = this->windows.find(wId);
  if (it != this->windows.end()) {
    it->second->sendCloseRequest();
  }
}

void sendExposeMessage(Display *disp, Window fWindow) {
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
  if (XSendEvent(disp, fWindow, False, ExposureMask, &event) != 0) {
    XFlush(disp);
  } else {
    std::cerr << "The conversion to wire protocol format failed" << std::endl;
  }
}

void sendXClientMessage(Display *disp, Window window, Atom type,
                        uint32_t param1, uint32_t param2) {
  if (disp != nullptr) {
    XEvent event;
    event.type = ClientMessage;
    event.xclient.send_event = True;
    event.xclient.display = disp;
    event.xclient.window = window;
    event.xclient.message_type = type;
    event.xclient.format = 32;
    event.xclient.data.l[0] = type;
    event.xclient.data.l[1] = param1;
    event.xclient.data.l[2] = param2;
    if (XSendEvent(disp, window, False, NoEventMask, &event) != 0) {
      XFlush(disp);
    } else {
      std::cerr << "The conversion to wire protocol format failed" << std::endl;
    }
  } else {
    std::cerr << "Try to send message while display is closed" << std::endl;
  }
}
} // namespace skui
