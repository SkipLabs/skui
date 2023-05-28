#ifndef __SKUI_WINDOW_GL_H__
#define __SKUI_WINDOW_GL_H__

#include <Builder.h>
#include <exception>
#include <GL/glx.h>

class SKUiGLWindowBuilder : SKUiWindowBuilder
{
public:
  XVisualInfo *initializeDisplay(Display *disp);
  void createContext(Window fWindow, Display *disp, XVisualInfo *visualInfo);
  void closeContext(Display *disp);
  void initiliazed();

  SKUiGLWindowBuilder(
      u_int32_t wId,
      u_int32_t x, u_int32_t y,
      u_int32_t width, u_int32_t height,
      u_int32_t framePreSecond) : config{wId, x, y, width, height, framePreSecond}, gLXFBConfig(nullptr){};

  SKUiWindowConfig configuration() { return config; }

private:
  SKUiWindowConfig config;
  GLXFBConfig *gLXFBConfig;
  GLXContext context;
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

#endif