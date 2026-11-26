// Offscreen OpenGL rendering without a window system, with EGL on the Mesa
// surfaceless platform. Used to render drawables to images in tests.
#include <EGL/egl.h>
#include <EGL/eglext.h>
#include "GLUtils.h"
#include <GL/glew.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

namespace {

EGLDisplay gDisplay = EGL_NO_DISPLAY;
EGLContext gContext = EGL_NO_CONTEXT;
GLuint gFramebuffer = 0;
GLuint gColor = 0;
GLuint gDepthStencil = 0;
uint32_t gWidth = 0;
uint32_t gHeight = 0;

bool initContext() {
  if (gContext != EGL_NO_CONTEXT) {
    return true;
  }
  auto getPlatformDisplay = (PFNEGLGETPLATFORMDISPLAYEXTPROC)eglGetProcAddress(
      "eglGetPlatformDisplayEXT");
  if (getPlatformDisplay == nullptr) {
    fprintf(stderr, "Offscreen: eglGetPlatformDisplayEXT is not available\n");
    return false;
  }
  gDisplay = getPlatformDisplay(EGL_PLATFORM_SURFACELESS_MESA,
                                EGL_DEFAULT_DISPLAY, nullptr);
  EGLint major, minor;
  if (gDisplay == EGL_NO_DISPLAY || !eglInitialize(gDisplay, &major, &minor)) {
    fprintf(stderr, "Offscreen: unable to initialize EGL (0x%x)\n",
            eglGetError());
    return false;
  }
  const EGLint configAttributes[] = {EGL_SURFACE_TYPE,
                                     EGL_PBUFFER_BIT,
                                     EGL_RENDERABLE_TYPE,
                                     EGL_OPENGL_BIT,
                                     EGL_RED_SIZE,
                                     8,
                                     EGL_GREEN_SIZE,
                                     8,
                                     EGL_BLUE_SIZE,
                                     8,
                                     EGL_ALPHA_SIZE,
                                     8,
                                     EGL_NONE};
  EGLConfig config;
  EGLint count = 0;
  if (!eglChooseConfig(gDisplay, configAttributes, &config, 1, &count) ||
      count == 0) {
    fprintf(stderr, "Offscreen: no EGL configuration\n");
    return false;
  }
  eglBindAPI(EGL_OPENGL_API);
  gContext = eglCreateContext(gDisplay, config, EGL_NO_CONTEXT, nullptr);
  if (gContext == EGL_NO_CONTEXT ||
      !eglMakeCurrent(gDisplay, EGL_NO_SURFACE, EGL_NO_SURFACE, gContext)) {
    fprintf(stderr, "Offscreen: unable to create the GL context (0x%x)\n",
            eglGetError());
    return false;
  }
  glewExperimental = GL_TRUE;
  // Without a window system, GLEW reports an error when it looks up GLX
  // functions, but the GL functions it needs are loaded.
  glewInit();
  glGetError();
  GL_init();
  return true;
}

void releaseFramebuffer() {
  if (gFramebuffer != 0) {
    glDeleteFramebuffers(1, &gFramebuffer);
    glDeleteRenderbuffers(1, &gColor);
    glDeleteRenderbuffers(1, &gDepthStencil);
    gFramebuffer = gColor = gDepthStencil = 0;
  }
}

} // namespace

/**
 * The framebuffer offscreen rendering draws to, bound as the main
 * framebuffer (see SKIP_GL_bindMainFrameBuffer), or 0 for the window.
 */
GLuint GL_mainFramebuffer() { return gFramebuffer; }

extern "C" {

/**
 * Creates the offscreen GL context if needed and a width x height drawing
 * target, and makes it the main framebuffer. Returns false when no GL
 * implementation is available.
 */
bool SKIP_GLOffscreen_begin(uint32_t width, uint32_t height) {
  if (!initContext()) {
    return false;
  }
  if (gFramebuffer == 0 || width != gWidth || height != gHeight) {
    releaseFramebuffer();
    glGenFramebuffers(1, &gFramebuffer);
    glBindFramebuffer(GL_FRAMEBUFFER, gFramebuffer);
    glGenRenderbuffers(1, &gColor);
    glBindRenderbuffer(GL_RENDERBUFFER, gColor);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_RGBA8, width, height);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,
                              GL_RENDERBUFFER, gColor);
    glGenRenderbuffers(1, &gDepthStencil);
    glBindRenderbuffer(GL_RENDERBUFFER, gDepthStencil);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, width, height);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT,
                              GL_RENDERBUFFER, gDepthStencil);
    if (glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE) {
      fprintf(stderr, "Offscreen: incomplete framebuffer\n");
      releaseFramebuffer();
      return false;
    }
    gWidth = width;
    gHeight = height;
  }
  glBindFramebuffer(GL_FRAMEBUFFER, gFramebuffer);
  return true;
}

/**
 * Reads the pixels drawn since SKIP_GLOffscreen_begin as RGBA bytes, top
 * row first, into data (width * height * 4 bytes).
 */
void SKIP_GLOffscreen_read(uint8_t *data) {
  glFinish();
  glBindFramebuffer(GL_READ_FRAMEBUFFER, gFramebuffer);
  glPixelStorei(GL_PACK_ALIGNMENT, 1);
  uint32_t row = gWidth * 4;
  uint8_t *pixels = new uint8_t[row * gHeight];
  glReadPixels(0, 0, gWidth, gHeight, GL_RGBA, GL_UNSIGNED_BYTE, pixels);
  // GL rows start at the bottom.
  for (uint32_t y = 0; y < gHeight; y++) {
    memcpy(data + y * row, pixels + (gHeight - 1 - y) * row, row);
  }
  delete[] pixels;
}
}
