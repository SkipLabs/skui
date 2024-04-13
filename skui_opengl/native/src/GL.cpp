
#include "GLUtils.h"
#include <GL/glew.h>
#include <algorithm>
#include <fstream>
#include <functional>
#include <iomanip>
#include <iostream>
#include <set>
#include <stack>
#include <string.h>
#include <string>
#include <vector>

#define BUFFER_OFFSET(i) ((int *)(sizeof(int) * i))
#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))
#define NOT_MANAGED_IMAGE_FORMAT 1
#define UNABLE_TO_LOAD_IMAGE 2
#define UNABLE_TO_CREATE_TEXTURE 3
#define STR(text) sk_string_create(text, strlen(text))

struct Viewport {
  GLint x;
  GLint y;
  GLuint width;
  GLuint height;
};

struct Color {
  GLclampf r;
  GLclampf g;
  GLclampf b;
  GLclampf a;
};

struct State {
  Color color;
  Viewport viewport;
  GLboolean texture;
  GLboolean blend;
  GLenum srcAlpha;
};

const GLchar *uniforms[] = {
    "u_box",         "u_center",       "u_color",    "u_color1",
    "u_color2",      "u_end",          "u_matrix",   "u_radius",
    "u_sigma",       "u_smooth",       "u_start",    "u_step",
    "u_texture",     "u_texture1",     "u_texture2", "u_thickness",
    "u_stop_colors", "u_stop_offsets", "u_progress", "u_precision",
    "u_size1",       "u_size2",        "u_bColor",   "u_size",
    "u_pxRange"};

const GLchar *attributes[] = {"a_position"};

unsigned long glValue(uint8_t value) {
  switch (value) {
  case 1:
    return GL_NEAREST;
  case 2:
    return GL_NEAREST_MIPMAP_NEAREST;
  case 3:
    return GL_LINEAR_MIPMAP_NEAREST;
  case 4:
    return GL_NEAREST_MIPMAP_LINEAR;
  case 5:
    return GL_LINEAR_MIPMAP_LINEAR;
  case 6:
    return GL_REPEAT;
  case 7:
    return GL_CLAMP_TO_EDGE;
  case 8:
    return GL_MIRRORED_REPEAT;
  case 0:
  default:
    return GL_LINEAR;
  }
}

std::stack<State> gStates;
State gState;
std::stack<uint32_t> textures;
std::set<uint32_t> kept;
GLuint frameBuffer = 0;
GLuint textureBuffer = 0;

void checkError() {
  auto glError = glGetError();
  switch (glError) {
  case GL_NO_ERROR:
    break;
  case GL_INVALID_ENUM:
    std::cout << "GL_INVALID_ENUM" << std::endl;
    break;
  case GL_INVALID_VALUE:
    std::cout << "GL_INVALID_VALUE" << std::endl;
    break;
  case GL_INVALID_OPERATION:
    std::cout << "GL_INVALID_OPERATION" << std::endl;
    break;
  case GL_INVALID_FRAMEBUFFER_OPERATION:
    std::cout << "GL_INVALID_FRAMEBUFFER_OPERATION" << std::endl;
    break;
  case GL_OUT_OF_MEMORY:
    std::cout << "GL_OUT_OF_MEMORY" << std::endl;
    break;
  default:
    std::cout << "GL_UNKNOWN" << std::endl;
    break;
  }
}

void displayBlendState() {
  // retrieve current state of blend enabled
  GLboolean blendEnabled;
  glGetBooleanv(GL_BLEND, &blendEnabled);

  // retrieve current state of src / dst blend functions
  GLint blendSrc;
  GLint blendDst;
  glGetIntegerv(GL_BLEND_SRC_ALPHA, &blendSrc);
  glGetIntegerv(GL_BLEND_DST_ALPHA, &blendDst);

  std::cout << "Blend: " << (blendEnabled ? "true" : "false") << " " << blendSrc
            << " " << blendDst << std::endl;
}

void GL_deleteTexture(uint32_t ident) {
  auto it = kept.find(ident);
  if (it != kept.end()) {
    return;
  }
  GLuint tex = ident;
  glDeleteTextures(1, &tex);
}

void GL_checkTextureToDelete() {
  if (!textures.empty()) {
    GLuint tex = textures.top();
    textures.pop();
    GL_deleteTexture(tex);
  }
}

void GL_init() {
  gState.texture = true;
  glEnable(GL_TEXTURE_2D);
  gState.blend = true;
  glEnable(GL_BLEND);
  gState.srcAlpha = GL_ONE_MINUS_SRC_ALPHA;
  glBlendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE,
                      GL_ONE_MINUS_SRC_ALPHA);
  gState.color = Color{1.0, 1.0, 1.0, 1.0};
  glClearColor(1.0, 1.0, 1.0, 1.0);
}

extern "C" {

extern uint32_t SKIP_String_byteSize(const char *str);
extern char *sk_string_create(const char *buffer, uint32_t size);
extern double SKIP_getFloatAt(void *data, uint32_t index);

uint32_t SKIP_GL_createTexture(uint32_t) {
  GLuint tex = 0;
  glGenTextures(1, &tex);
  return tex;
}

void SKIP_GL_deleteTexture(uint32_t ident, uint32_t) { textures.push(ident); }

void SKIP_GL_bindTexture2D(uint32_t ident, uint32_t) {
  glBindTexture(GL_TEXTURE_2D, ident);
}

void SKIP_GL_setTexture2DMinFilter(uint8_t value, uint32_t) {
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, glValue(value));
}

void SKIP_GL_setTexture2DMagFilter(uint8_t value, uint32_t) {
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, glValue(value));
}

void SKIP_GL_setTexture2DWrapS(uint8_t value, uint32_t) {
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, glValue(value));
}

void SKIP_GL_setTexture2DWrapT(uint8_t value, uint32_t) {
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, glValue(value));
}

uint32_t SKIP_GL_createFragmentShader(uint32_t) {
  return glCreateShader(GL_FRAGMENT_SHADER);
}

uint32_t SKIP_GL_createVertexShader(uint32_t) {
  return glCreateShader(GL_VERTEX_SHADER);
}

void SKIP_GL_shaderSource(uint32_t shader, char *source, uint32_t) {
  uint32_t len = SKIP_String_byteSize(source);
  GLchar const *sources[] = {(const char *)source};
  GLint lengths[] = {(GLint)len};
  glShaderSource(shader, 1, sources, lengths);
}

void SKIP_GL_compileShader(uint32_t shader, uint32_t) {
  glCompileShader(shader);
}

void SKIP_GL_deleteShader(uint32_t shader, uint32_t) { glDeleteShader(shader); }

bool SKIP_GL_isCompiled(uint32_t shader, uint32_t) {
  GLint isCompiled = 0;
  glGetShaderiv(shader, GL_COMPILE_STATUS, &isCompiled);
  return isCompiled;
}

char *SKIP_GL_getShaderInfoLog(uint32_t shader, uint32_t) {
  GLint maxLength = 0;
  glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &maxLength);
  std::vector<GLchar> infoLog(maxLength);
  glGetShaderInfoLog(shader, maxLength, &maxLength, &infoLog[0]);
  std::string s(infoLog.begin(), infoLog.end());
  return sk_string_create(s.c_str(), s.size());
}

void SKIP_GL_setTexture2DRGBASubImage(uint32_t level, uint32_t x, uint32_t y,
                                      uint32_t width, uint32_t height,
                                      const void *src, uint32_t) {
  glTexSubImage2D(GL_TEXTURE_2D, level, x, y, width, height, GL_RGBA,
                  GL_UNSIGNED_BYTE, src);
}

void SKIP_GL_setTexture2DRGBAImage(uint32_t level, uint32_t width,
                                   uint32_t height, const void *src, uint32_t) {
  glTexImage2D(GL_TEXTURE_2D, level, GL_RGBA, width, height, 0, GL_RGBA,
               GL_UNSIGNED_BYTE, src);
}

void SKIP_GL_flush(uint32_t) { glFlush(); }

void SKIP_GL_viewport(int32_t x, int32_t y, uint32_t width, uint32_t height,
                      uint32_t) {
  gState.viewport = Viewport{x, y, width, height};
  glViewport(x, y, width, height);
}

uint32_t SKIP_GL_createProgram(uint32_t) { return glCreateProgram(); }

void SKIP_GL_attachShader(uint32_t program, uint32_t shader, uint32_t) {
  glAttachShader(program, shader);
}

void SKIP_GL_detachShader(uint32_t program, uint32_t shader, uint32_t) {
  glDetachShader(program, shader);
}

void SKIP_GL_linkProgram(uint32_t program, uint32_t) { glLinkProgram(program); }

void SKIP_GL_useProgram(uint32_t program, uint32_t) { glUseProgram(program); }

void SKIP_GL_deleteProgram(uint32_t program, uint32_t) {
  glDeleteProgram(program);
}

bool SKIP_GL_isLinked(uint32_t program, uint32_t) {
  GLint isLinked = 0;
  glGetProgramiv(program, GL_LINK_STATUS, &isLinked);
  return isLinked;
}

char *SKIP_GL_getProgramInfoLog(uint32_t program, uint32_t) {
  GLint maxLength = 0;
  glGetProgramiv(program, GL_INFO_LOG_LENGTH, &maxLength);
  std::vector<GLchar> infoLog(maxLength);
  glGetProgramInfoLog(program, maxLength, &maxLength, &infoLog[0]);
  std::string s(infoLog.begin(), infoLog.end());
  return sk_string_create(s.c_str(), s.size());
}

void SKIP_GL_bindArrayBuffer(uint32_t buffer, uint32_t) {
  glBindBuffer(GL_ARRAY_BUFFER, buffer);
}

void SKIP_GL_enableVertexAttributeArray(uint32_t location, uint32_t) {
  glEnableVertexAttribArray(location);
}

void SKIP_GL_disableVertexAttributeArray(uint32_t location, uint32_t) {
  glDisableVertexAttribArray(location);
}

void SKIP_GL_vertexFloatAttributePointer(uint32_t location, uint32_t size,
                                         bool normalized, uint32_t offset,
                                         uint32_t) {
  glVertexAttribPointer(location, size, GL_FLOAT, normalized, 0,
                        BUFFER_OFFSET(offset));
}

void SKIP_GL_uniformMatrix4fv(uint32_t location, bool transpose, double v1,
                              double v2, double v3, double v4, double v5,
                              double v6, double v7, double v8, double v9,
                              double v10, double v11, double v12, double v13,
                              double v14, double v15, double v16, uint32_t) {
  GLfloat modelviewmatrix[] = {
      (GLfloat)v1,  (GLfloat)v2,  (GLfloat)v3,  (GLfloat)v4,
      (GLfloat)v5,  (GLfloat)v6,  (GLfloat)v7,  (GLfloat)v8,
      (GLfloat)v9,  (GLfloat)v10, (GLfloat)v11, (GLfloat)v12,
      (GLfloat)v13, (GLfloat)v14, (GLfloat)v15, (GLfloat)v16,
  };
  glUniformMatrix4fv(location, 1, transpose, modelviewmatrix);
}

void SKIP_GL_uniform1i(uint32_t location, uint32_t value, uint32_t) {
  glUniform1i(location, value);
}

void SKIP_GL_uniform1f(uint32_t location, double value, uint32_t) {
  glUniform1f(location, (GLfloat)value);
}

void SKIP_GL_uniform2f(uint32_t location, double v0, double v1, uint32_t) {
  glUniform2f(location, (GLfloat)v0, (GLfloat)v1);
}

void SKIP_GL_uniform4f(uint32_t location, double v0, double v1, double v2,
                       double v3, uint32_t) {
  glUniform4f(location, (GLfloat)v0, (GLfloat)v1, (GLfloat)v2, (GLfloat)v3);
}

void SKIP_GL_uniform4fv(uint32_t location, uint32_t count, void *data,
                        uint32_t) {
  auto len = count * 4;
  std::vector<GLfloat> new_vec(len, 0.0f);
  for (uint32_t i = 0; i < len; i++) {
    new_vec[i] = (GLfloat)SKIP_getFloatAt(data, i);
  }
  const GLfloat *ptr = &new_vec[0];
  glUniform4fv(location, count, ptr);
}

void SKIP_GL_uniform1fv(uint32_t location, uint32_t count, void *data,
                        uint32_t) {
  std::vector<GLfloat> new_vec(count, 0.0f);
  for (uint32_t i = 0; i < count; i++) {
    new_vec[i] = (GLfloat)SKIP_getFloatAt(data, i);
  }
  const GLfloat *ptr = &new_vec[0];
  glUniform1fv(location, count, ptr);
}

void SKIP_GL_drawTriangles(uint32_t first, uint32_t count, uint32_t) {
  glDrawArrays(GL_TRIANGLES, first, count);
}

void SKIP_GL_drawTriangleStrip(uint32_t first, uint32_t count, uint32_t) {
  glDrawArrays(GL_TRIANGLE_STRIP, first, count);
}

uint32_t SKIP_GL_getAttributeLocation(uint32_t program, uint32_t index,
                                      uint32_t) {
  return glGetAttribLocation(program, attributes[index]);
}

uint32_t SKIP_GL_getUniformLocation(uint32_t program, uint32_t index,
                                    uint32_t) {
  return glGetUniformLocation(program, uniforms[index]);
}

uint32_t SKIP_GL_createBuffer(uint32_t) {
  GLuint buf;
  glCreateBuffers(1, &buf);
  return buf;
}

void SKIP_GL_staticDrawData(void *data, uint32_t len, uint32_t) {
  std::vector<GLfloat> new_vec(len, 0.0f);
  for (uint32_t i = 0; i < len; i++) {
    new_vec[i] = (GLfloat)SKIP_getFloatAt(data, i);
  }
  void *ptr = &new_vec[0];
  glBufferData(GL_ARRAY_BUFFER, len * sizeof(GLfloat), ptr, GL_STATIC_DRAW);
}

void SKIP_GL_deleteBuffer(uint32_t buffer, uint32_t) {
  glDeleteBuffers(1, &buffer);
}

uint32_t SKIP_GL_createVertexArray(uint32_t) {
  GLuint arr;
  glCreateVertexArrays(1, &arr);
  return arr;
}

void SKIP_GL_bindVertexArray(uint32_t arr, uint32_t) { glBindVertexArray(arr); }

void SKIP_GL_deleteVertexArray(uint32_t arr, uint32_t) {
  glDeleteVertexArrays(1, &arr);
}

uint32_t SKIP_GL_createFramebuffer(uint32_t) {
  GLuint buf;
  glCreateFramebuffers(1, &buf);
  return buf;
}

void SKIP_GL_bindMainFrameBuffer(uint32_t) {
  if (frameBuffer != 0) {
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    frameBuffer = 0;
  }
}

void SKIP_GL_bindTextureFrameBuffer(uint32_t ctx) {
  if (textureBuffer == 0) {
    textureBuffer = SKIP_GL_createFramebuffer(ctx);
  }
  if (frameBuffer != textureBuffer) {
    glBindFramebuffer(GL_FRAMEBUFFER, textureBuffer);
    frameBuffer = textureBuffer;
  }
}

void SKIP_GL_clear(uint32_t) {
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

void SKIP_GL_clearColor(double r, double g, double b, double a, uint32_t) {
  gState.color = Color{(GLclampf)r, (GLclampf)g, (GLclampf)b, (GLclampf)a};
  glClearColor((GLclampf)r, (GLclampf)g, (GLclampf)b, (GLclampf)a);
}

void SKIP_GL_framebufferTexture2DColor(uint32_t texture, uint32_t level,
                                       uint32_t) {
  glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D,
                         texture, level);
}

void SKIP_GL_srcAlphaBlendSrcColor(uint32_t) {
  glBlendFunc(GL_SRC_ALPHA, GL_SRC_COLOR);
}

void SKIP_GL_srcAlphaBlendOneMinus(uint32_t) {
  glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
}

void SKIP_GL_oneBlendOneMinus(uint32_t) {
  glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
}

void SKIP_GL_straitAlphaBlending(uint32_t) {
  glBlendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE,
                      GL_ONE_MINUS_SRC_ALPHA);
}

void SKIP_GL_activeTexture(uint32_t index, uint32_t) {
  glActiveTexture(GL_TEXTURE0 + index);
};

void SKIP_GL_disableBlend(uint32_t) {
  gState.blend = false;
  glDisable(GL_BLEND);
}

void SKIP_GL_enableBlend(uint32_t) {
  gState.blend = true;
  glEnable(GL_BLEND);
}

void SKIP_GL_save(uint32_t) { gStates.push(gState); }

void SKIP_GL_restore(uint32_t) {
  gState = gStates.top();
  if (gState.texture) {
    glEnable(GL_TEXTURE_2D);
  } else {
    glDisable(GL_TEXTURE_2D);
  }
  if (gState.blend) {
    glEnable(GL_BLEND);
  } else {
    glDisable(GL_BLEND);
  }
  glBlendFunc(GL_SRC_ALPHA, gState.srcAlpha);
  glViewport(gState.viewport.x, gState.viewport.y, gState.viewport.width,
             gState.viewport.height);
  glClearColor(gState.color.r, gState.color.g, gState.color.b, gState.color.a);
  gStates.pop();
}

uint32_t SKIP_GL_cloneTexture(uint32_t texture, uint32_t width, uint32_t height,
                              uint32_t ctx) {
  auto size = width * height * 4;
  glBindTexture(GL_TEXTURE_2D, texture);
  GLubyte pixels[size];
  glGetTexImage(GL_TEXTURE_2D, 0, GL_RGBA, GL_UNSIGNED_BYTE, pixels);
  GLuint target = SKIP_GL_createTexture(ctx);
  glBindTexture(GL_TEXTURE_2D, target);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA,
               GL_UNSIGNED_BYTE, pixels);
  glBindTexture(GL_TEXTURE_2D, 0);
  return target;
}

uint32_t SKIP_GL_resizeTexture(uint32_t texture, uint32_t srcWidth,
                               uint32_t srcHeight, uint32_t dstWidth,
                               uint32_t dstHeight, uint32_t ctx) {
  GLuint target = SKIP_GL_createTexture(ctx);
  glBindTexture(GL_TEXTURE_2D, target);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, dstWidth, dstHeight, 0, GL_RGBA,
               GL_UNSIGNED_BYTE, nullptr);
  glBindTexture(GL_TEXTURE_2D, 0);
  auto currentFrame = frameBuffer;
  SKIP_GL_bindTextureFrameBuffer(ctx);
  glFramebufferTexture2D(GL_READ_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,
                         GL_TEXTURE_2D, texture, 0);
  glFramebufferTexture2D(GL_DRAW_FRAMEBUFFER, GL_COLOR_ATTACHMENT1,
                         GL_TEXTURE_2D, target, 0);
  glDrawBuffer(GL_COLOR_ATTACHMENT1);
  auto width = srcWidth > dstWidth ? dstWidth : srcWidth;
  auto height = srcHeight > dstHeight ? dstHeight : srcHeight;
  glBlitFramebuffer(0, 0, width, height, 0, 0, width, height,
                    GL_COLOR_BUFFER_BIT, GL_NEAREST);
  if (currentFrame != textureBuffer) {
    SKIP_GL_bindMainFrameBuffer(ctx);
  }
  return target;
}

void SKIP_GL_copyTexture(uint32_t toPaste, uint32_t srcX, uint32_t srcY,
                         uint32_t srcWidth, uint32_t srcHeight, uint32_t target,
                         uint32_t dstX, uint32_t dstY, uint32_t width,
                         uint32_t height, bool reverted, uint32_t ctx) {
  GLubyte *pixels =
      (GLubyte *)malloc(srcWidth * srcHeight * 4 * sizeof(GLubyte));
  glBindTexture(GL_TEXTURE_2D, toPaste);
  glGetTexImage(GL_TEXTURE_2D, 0, GL_RGBA, GL_UNSIGNED_BYTE, pixels);
  checkError();
  if (width < srcWidth || height < srcHeight || reverted) {
    GLubyte *buffer = (GLubyte *)malloc(width * height * 4 * sizeof(GLubyte));
    for (uint32_t y = srcY; y < srcY + height; y++) {
      auto index = (y - srcY) * width * 4;
      auto ySrc = y;
      if (reverted) {
        ySrc = (srcHeight - 1) - y;
      }
      auto srcIndex = ((ySrc * srcWidth) + srcX) * 4;
      auto copied = width * 4;
      void *dest = buffer + index;
      const void *src = pixels + srcIndex;
      memcpy(dest, src, copied);
    }
    glBindTexture(GL_TEXTURE_2D, target);
    SKIP_GL_setTexture2DRGBASubImage(0, dstX, dstY, width, height, buffer, ctx);
    free(buffer);
  } else {
    glBindTexture(GL_TEXTURE_2D, target);
    SKIP_GL_setTexture2DRGBASubImage(0, dstX, dstY, width, height, pixels, ctx);
  }
  glBindTexture(GL_TEXTURE_2D, 0);
  free(pixels);
}
}