#ifndef __SKUI_GL_H__
#define __SKUI_GL_H__

void GL_init();
void GL_checkTextureToDelete();
// The framebuffer of offscreen rendering, or 0 to draw to the window.
unsigned int GL_mainFramebuffer();

#endif