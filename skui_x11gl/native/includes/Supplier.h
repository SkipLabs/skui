#ifndef __SKUI_WINDOW_SUPPLIER_H__
#define __SKUI_WINDOW_SUPPLIER_H__

#include "EManager.h"
#include "WManager.h"
#include <exception>
#include <string>
#include <map>

namespace skui
{

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

class WindowException : public std::exception
{
public:
  WindowException(const std::string msg) : m_msg(msg) {}
  ~WindowException() {}

  virtual const char *what() const throw()
  {
    return m_msg.c_str();
  }

  const std::string m_msg;
};

class WindowSupplier
{
public:
  bool handleWindowEvents(Display * display);
  Display* init(WindowManager& vManager);
  void sendCloseMessage(uint32_t wId);

private:
  std::map<uint64_t, WindowManager*> windows;
};

void sendClientMessage(Display *disp, Window window, Atom type, uint32_t param1, uint32_t param2);
void sendExposeMessage(Display *disp, Window fWindow);

}


#endif