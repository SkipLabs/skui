#include <GL/glx.h>
#include <X11/Xlib.h>
#include <exception>

class CreateContextException : public std::exception
{
public:
    CreateContextException()
    {
    }

   ~CreateContextException()
   {
   }

   virtual const char* what() const throw () 
   {
        return "Unable to create Display context";
   }
};

XVisualInfo* initializeDisplay(Display * disp, void*& info) {
  // We prefer the more recent glXChooseFBConfig but fall back to glXChooseVisual. They have
  // slight differences in how attributes are specified.
  static int constexpr kChooseFBConfigAtt[] = {
      GLX_RENDER_TYPE, GLX_RGBA_BIT,
      GLX_DOUBLEBUFFER, True,
      GLX_STENCIL_SIZE, 8,
      None};
  // For some reason glXChooseVisual takes a non-const pointer to the attributes.
  GLint chooseVisualAtt[] = {GLX_RGBA, GLX_DEPTH_SIZE, 24, GLX_DOUBLEBUFFER, None};
  XVisualInfo* visualInfo = glXChooseVisual(disp, DefaultScreen(disp), chooseVisualAtt);
  GLXFBConfig * gLXFBConfig = nullptr;
  if (nullptr == visualInfo)
  {
    int n;
    auto screen = DefaultScreen(disp);
    gLXFBConfig = glXChooseFBConfig(disp, screen, kChooseFBConfigAtt, &n);
    if (n > 0)
    {
      visualInfo = glXGetVisualFromFBConfig(disp, *gLXFBConfig);
    }
    else
    {
      visualInfo = glXChooseVisual(disp, DefaultScreen(disp), chooseVisualAtt);
      gLXFBConfig = nullptr;
    }
  }
  if (nullptr == visualInfo) {
    throw CreateContextException();
  }
  info = gLXFBConfig;
  return visualInfo;
} 

void GL_check();
void GL_checkTextureToDelete();

void* createContext(Window fWindow, Display * disp, XVisualInfo* visualInfo) {
  GLXContext context  = glXCreateContext(disp, visualInfo, NULL, GL_TRUE);
  glXMakeCurrent(disp, fWindow, context);
  GL_check();
  return context;
}


void closeContext(Display * disp, void* extContext, void* extVisualInfo) {
  glXMakeCurrent(disp, None, NULL);
  glXDestroyContext(disp, static_cast<GLXContext>(extContext));
  if (extVisualInfo)
  {
    //XFree(extVisualInfo);
  }
}

void onIdle() {
  GL_checkTextureToDelete();
}

//glXSwapBuffers(display, win);