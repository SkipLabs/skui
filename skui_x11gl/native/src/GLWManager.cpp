
#include <GL/glew.h>
#include "GLWManager.h"
#include "GLUtils.h"
#include <fstream>
#include <X11/extensions/Xrandr.h>
#include <X11/Xresource.h>
#include <math.h>

std::string utf8datatype("text/plain; charset=utf-8");

namespace skui
{
  void sendClientMessage(Display *disp, Window window, Atom type, uint32_t param1, uint32_t param2);

  /**
   * @brief returns the window that currently has inputfocus
   */
  Window getActiveWindow(Display * display)
  {
      unsigned char *data;
      int format;
      unsigned long extra, n, window;
      Atom type;
      Atom property = XInternAtom(display, "_NET_ACTIVE_WINDOW", False);
      Window root = XDefaultRootWindow(display);
      if (!XGetWindowProperty(display, root, property, 0, ~0, False,AnyPropertyType, &type, &format, &n, &extra, &data))
          return 0;
      Window result = *(unsigned long *) data;
      XFree(data);
      return result;
  }


  XVisualInfo *GLWindowManager::initializeDisplay(Display *disp, uint32_t screen)
  {

    // We prefer the more recent glXChooseFBConfig but fall back to glXChooseVisual. They have
    // slight differences in how attributes are specified.
    static int constexpr kChooseFBConfigAtt[] = {
        GLX_RENDER_TYPE, GLX_RGBA_BIT,
        GLX_DOUBLEBUFFER, True,
        GLX_STENCIL_SIZE, 8,
        None};
    // For some reason glXChooseVisual takes a non-const pointer to the attributes.
    GLint chooseVisualAtt[] = {GLX_RGBA, GLX_DEPTH_SIZE, 24, GLX_DOUBLEBUFFER, None};
    XVisualInfo *visualInfo = glXChooseVisual(disp, screen, chooseVisualAtt);
    if (nullptr == visualInfo)
    {
      int n;
      this->gLXFBConfig = glXChooseFBConfig(disp, screen, kChooseFBConfigAtt, &n);
      if (n > 0)
      {
        visualInfo = glXGetVisualFromFBConfig(disp, *gLXFBConfig);
      }
      else
      {
        visualInfo = glXChooseVisual(disp, screen, chooseVisualAtt);
        gLXFBConfig = nullptr;
      }
    }
    if (nullptr == visualInfo)
    {
      throw CreateContextException();
    }
    this->display = disp;
    this->visualInfo = visualInfo;
    return visualInfo;
  }

  Atom GLWindowManager::createContext(Window window)
  {
    this->messages = {
        XInternAtom(this->display, "WM_DELETE_WINDOW", False),
        XInternAtom(this->display, "CLOSE_WINDOW", False),
        XInternAtom(this->display, "CHECK_RESOURCES", False),
    };
    this->context = glXCreateContext(display, visualInfo, NULL, GL_TRUE);
    glXMakeCurrent(this->display, window, this->context);
    this->window = window;
    GLenum err = glewInit();
    if (err != GLEW_OK)
    {
      throw VersionException(std::string("Failed to initialize GLEW."));
    }
    if (!GLEW_VERSION_2_1)
    {
      // throw VersionException(std::string("Invalid GLEW version"));
    }
    GL_init();
    return this->messages.fWmDeleteMessage;
  }

  void GLWindowManager::close()
  {
    glXMakeCurrent(this->display, None, NULL);
    glXDestroyContext(this->display, static_cast<GLXContext>(this->context));
    if (this->gLXFBConfig)
    {
      // XFree(this->gLXFBConfig);
      this->gLXFBConfig = nullptr;
    }
    XUnmapWindow(this->display, this->window);
    XFlush(this->display);
    XDestroyWindow(this->display, this->window);
    this->display = nullptr;
  }

  void GLWindowManager::onIdle()
  {
  }

  void GLWindowManager::checkClipboard(XSelectionEvent *s)
  {
    if (this->eventManager != nullptr)
    {
      std::string value;
      Atom format = XInternAtom(display, "UTF8_STRING", False);
      if (this->gatherClipboad(value, format))
      {
        this->eventManager->paste(this->config.wId, utf8datatype, value);
      }
    }
  }

  void GLWindowManager::resize(uint32_t width, uint32_t height)
  {
    if (this->eventManager != nullptr)
    {
      // in X11 the pixel ratio is 1.0
      this->eventManager->resize(this->config.wId, width, height, 100);
    }
  }

  float GLWindowManager::computeDpi() {
      XRRScreenResources *screenResources = XRRGetScreenResources(this->display, this->window);
      XRRCrtcInfo *crtcInfo = XRRGetCrtcInfo(this->display, screenResources, screenResources->crtcs[0]);
      if (crtcInfo->noutput > 0) {
        XRROutputInfo *outputInfo = XRRGetOutputInfo(display, screenResources, crtcInfo->outputs[0]);
        
        int widthInPixels = crtcInfo->width;
        int heightInPixels = crtcInfo->height;
        int widthInMillimeters = outputInfo->mm_width;
        int heightInMillimeters = outputInfo->mm_height;

        float pixelRatioX = widthInMillimeters > 0 ? (float)widthInPixels / ((float)widthInMillimeters / 25.4) : 1.0;
        float pixelRatioY = heightInMillimeters > 0 ? (float)heightInPixels / ((float)heightInMillimeters / 25.4): 1.0;
        
        XRRFreeOutputInfo(outputInfo);
        XRRFreeCrtcInfo(crtcInfo);
        XRRFreeScreenResources(screenResources);

        return floor((pixelRatioX + pixelRatioY) / 2.0);
      }
      return 96.0;
  }

  float GLWindowManager::getDpiFromResource() {
      char *resourceString = XResourceManagerString(this->display);
      XrmDatabase db;
      XrmValue value;

      char *type = NULL;
      double dpi = 96.0;

      XrmInitialize(); /* Need to initialize the DB before calling Xrm* functions */
      db = XrmGetStringDatabase(resourceString);

      if (resourceString) {
        if (XrmGetResource(db, "Xft.dpi", "String", &type, &value) == True) {
            if (value.addr) {
                dpi = atof(value.addr);
            }
        }
      }
      return dpi;
  }

  void GLWindowManager::performFrame()
  {
    if (this->eventManager != nullptr)
    {
      XWindowAttributes gwa;
      XGetWindowAttributes(this->display, this->window, &gwa);
      glXMakeCurrent(this->display, this->window, this->context);
      this->eventManager->performFrame(
        this->userEnviroment, this->config.wId, this->userContext,
        gwa.width, gwa.height, 100,
        [this](void* userContext){
        this->userContext = userContext;
        this->animationFrame.framePerformed();
        glXSwapBuffers(this->display, this->window); });
    }
  }

  void GLWindowManager::requestClose()
  {
    if (this->eventManager != nullptr)
    {
      this->eventManager->requestClose(this->config.wId);
    }
  }

  void GLWindowManager::manageMouseLocation(uint32_t x, uint32_t y, uint32_t sx, uint32_t sy)
  {
    if (this->eventManager != nullptr)
    {
      this->eventManager->manageMouseLocation(this->config.wId, x, y, sx, sy);
    }
  }

  void GLWindowManager::manageMouseButton(uint32_t b, bool pressed)
  {
    this->eventManager->manageMouseButton(this->config.wId, b, pressed);
  }

  void GLWindowManager::manageKeyPressed(uint32_t code, uint32_t sym, const std::string &value)
  {
    this->eventManager->manageKeyPressed(this->config.wId, code, sym, value);
  }

  void GLWindowManager::manageKeyReleased(uint32_t code)
  {
    this->eventManager->manageKeyReleased(this->config.wId, code);
  }

  void GLWindowManager::updateClipboard(XSelectionRequestEvent *s)
  {

    XSelectionEvent ssev;
    Atom targets = XInternAtom(display, "TARGETS", False);
    Atom format = XInternAtom(display, "UTF8_STRING", False);
    if (s->property != None && s->target == format)
    {
      XChangeProperty(display, s->requestor, s->property, format, 8, PropModeReplace, (const unsigned char *)utf8.c_str(), utf8.size());
      sendSelectionNotify(s, false);
    }
    else if (s->property != None && s->target == targets)
    {
      XSelectionEvent ssev;
      Atom supported[] = {targets, format};
      XChangeProperty(
          display,
          s->requestor,
          s->property,
          targets,
          32,
          PropModeReplace,
          (unsigned char *)(&supported),
          sizeof(supported));
      sendSelectionNotify(s, false);
    }
    else
    {
#ifdef DEBUG
      char *an;
      an = XGetAtomName(display, s->target);
      printf("Denying request of type '%s'\n", an);
      if (an)
        XFree(an);
#endif
      sendSelectionNotify(s, true);
    }
  }

  void GLWindowManager::requestClipboard(const std::string &mimeType, const std::string &content)
  {
    if (mimeType == "text/plain; charset=utf-8")
    {
      utf8 = content;
      Atom clipboard = XInternAtom(display, "CLIPBOARD", False);
      XSetSelectionOwner(display, clipboard, window, CurrentTime);
    }
  }

  void GLWindowManager::initiliazed(XIC xic, std::function<void(Display *disp, Window fWindow)> expose)
  {
    this->xic = xic;
    this->onContextChange(this->config.wId, this->config.wId);
    this->animationFrame.start([this, expose]()
                               { expose(this->display, this->window); },
                               this->config.framePerSecond);
    this->resourceTimer.setInterval(
      [this]() {sendXClientMessage(this->display, this->window, this->messages.fCheckResources, 0, 0);},
      10000
    );
  }

  bool GLWindowManager::manageCustomEvent(XClientMessageEvent xclient)
  {
    Atom messageType = xclient.data.l[0];
    if (this->messages.fWmDeleteMessage == messageType)
    {
      this->requestClose();
    }
    else if (this->messages.fCheckResources == messageType)
    {
      GL_checkTextureToDelete();
    }
    else if (xclient.message_type == this->messages.fCloseMessage)
    {
      this->animationFrame.stop();
      return true;
    } else {
      auto it  = this->customMessages.find(messageType);
      if (it != this->customMessages.end()) {
        it->second((uint32_t)xclient.data.l[1], (uint32_t)xclient.data.l[2]);
      }
    }
    return false;
  }

  void GLWindowManager::sendCloseRequest()
  {
    sendXClientMessage(this->display, this->window, this->messages.fCloseMessage, 0, 0);
  }


  void GLWindowManager::print(std::ostream & buffer) {
    this->animationFrame.print(buffer);
  }
}