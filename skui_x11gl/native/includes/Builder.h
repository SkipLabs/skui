#ifndef __SKUI_WINDOW_BUILDER_H__
#define __SKUI_WINDOW_BUILDER_H__

#include <functional>
#include <X11/Xutil.h>

struct SKUiWindowConfig final
{
  u_int32_t wId;
  u_int32_t x;
  u_int32_t y;
  u_int32_t width;
  u_int32_t height;
  u_int32_t framePreSecond;
};

class SKUiWindowBuilder
{
public:
  virtual SKUiWindowConfig configuration() = 0;
  virtual XVisualInfo *initializeDisplay(Display *disp) = 0;
  virtual void createContext(Window fWindow, Display *disp, XVisualInfo *visualInfo) = 0;
  virtual void closeContext(Display *disp) = 0;
  virtual void initiliazed() = 0;
};

#endif