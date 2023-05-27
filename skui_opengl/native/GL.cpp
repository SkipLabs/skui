
#include <GL/glew.h>
#include <algorithm>
#include <string.h>
#include <map>
#include <vector>
#include <string>
#include <iostream>
#include <stack>
#include <set>
#include <thread>
#include <functional>
#include <fstream>
#include <iomanip>
#include <experimental/filesystem>

namespace fs = std::experimental::filesystem;
#define BUFFER_OFFSET(i) ((char *)NULL + (i))
#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))
#define NOT_MANAGED_IMAGE_FORMAT 1
#define UNABLE_TO_LOAD_IMAGE 2
#define UNABLE_TO_CREATE_TEXTURE 3
#define STR(text) sk_string_create(text, strlen(text))

struct Viewport
{
  GLint x;
  GLint y;
  GLuint width;
  GLuint height;
};

struct Color
{
  GLclampf r;
  GLclampf g;
  GLclampf b;
  GLclampf a;
};

struct State
{
  Color color;
  Viewport viewport;
  GLboolean texture;
  GLboolean blend;
  GLenum srcAlpha;
};

const GLchar *uniforms[] = {
    "u_box",
    "u_center",
    "u_color",
    "u_color1",
    "u_color2",
    "u_end",
    "u_matrix",
    "u_radius",
    "u_sigma",
    "u_smooth",
    "u_start",
    "u_step",
    "u_texture",
    "u_texture1",
    "u_texture2",
    "u_thickness",
    "u_stop_colors",
    "u_stop_offsets",
    "u_progress",
    "u_precision",
    "u_size1",
    "u_size2",
    "u_bColor",
    "u_size",
    "u_pxRange"
};

const GLchar *attributes[] = {
    "a_position"};

unsigned long glValue(uint8_t value)
{
  switch (value)
  {
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

// trim from start (in place)
static inline void ltrim(std::string &s)
{
  s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](int ch)
                                  { return !std::isspace(ch); }));
}

// trim from end (in place)
static inline void rtrim(std::string &s)
{
  s.erase(std::find_if(s.rbegin(), s.rend(), [](int ch)
                       { return !std::isspace(ch); })
              .base(),
          s.end());
}

// trim from both ends (in place)
static inline void trim(std::string &s)
{
  ltrim(s);
  rtrim(s);
}

void checkError()
{
  auto glError = glGetError();
  switch (glError)
  {
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

  std::cout << "Blend: " << (blendEnabled ? "true" : "false") << " " << blendSrc << " " << blendDst << std::endl;
}

bool saveImage(std::string &strPath, const char *data, uint32_t width, uint32_t height);



void GL_checkTextureToDelete()
{
  if (!textures.empty())
  {
    GLuint tex = textures.top();
    textures.pop();
    GL_deleteTexture(tex);
  }
}

class VersionException : public std::exception
{
public:
    VersionException(const std::string& msg) : m_msg(msg)
    {
    }

   ~VersionException()
   {
   }

   virtual const char* what() const throw () 
   {
        return m_msg.c_str();
   }

   const std::string m_msg;
};

void GL_check()
{
  GLenum err = glewInit();
  if (err != GLEW_OK)
  {
    throw VersionException(std::string("Failed to initialize GLEW."));
  }
  if (!GLEW_VERSION_2_1)
  {
    //throw VersionException(std::string("Invalid GLEW version"));
  }
  gState.texture = true;
  glEnable(GL_TEXTURE_2D);
  gState.blend = true;
  glEnable(GL_BLEND);
  gState.srcAlpha = GL_ONE_MINUS_SRC_ALPHA;
  glBlendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
  gState.color = Color{1.0, 1.0, 1.0, 1.0};
  glClearColor(1.0, 1.0, 1.0, 1.0);
  SKIP_GL_init();
}

extern "C"
{

  extern uint32_t SKIP_getStringsSize(void *source);
  extern uint32_t SKIP_String_byteSize(const char *str);
  extern char *sk_string_create(const char *buffer, uint32_t size);
  extern double SKIP_getFloatAt(void *data, uint32_t index);
  extern void SKIP_FWK_drawFrame(uint32_t width, uint32_t height, uint32_t time);
  extern void SKIP_GL_init();
  extern void SKIP_FWK_execute(uint32_t wId, std::function<void()> fun);
  extern void checkScopePath(std::string strScope, fs::path &fsScopePath);
  extern void *SKIP_FWK_createPixArray(uint32_t size);
  extern void SKIP_FWK_setPix(void *pixArray, uint32_t index, uint8_t r, uint8_t g, uint8_t b, uint8_t a);
  extern void SKIP_FWK_imgFailure(char *path, uint32_t code, char *target);
  extern void SKIP_FWK_imgSuccess(char *path, void *pixArray, uint32_t width, uint32_t height, char *target);
  extern void SKIP_FWK_throwInvalidImage(char *path);
  extern void *SKIP_FWK_createImage(void *pixArray, uint32_t width, uint32_t height);
  extern uint32_t SKIP_getBytesSize(void *pixArray);
  extern char *SKIP_Base64_decode(char *base64);
  extern void SKIP_IO_writeLoadable(char *path, char *key, void *optFile, void *optError);
  extern void *SKIP_text(char *text, char *category);

  uint32_t SKIP_GL_createTexture(uint32_t ctx)
  {
    GLuint tex = 0;
    glGenTextures(1, &tex);
    return tex;
  }

  void GL_deleteTexture(uint32_t ident)
  {
    auto it = kept.find(ident);
    if (it != kept.end())
    {
      return;
    }
    GLuint tex = ident;
    glDeleteTextures(1, &tex);
  }

  void SKIP_GL_deleteTexture(uint32_t ident, uint32_t ctx)
  {
    textures.push(ident);
  }

  void SKIP_GL_bindTexture2D(uint32_t ident, uint32_t ctx)
  {
    glBindTexture(GL_TEXTURE_2D, ident);
  }

  void SKIP_GL_setTexture2DMinFilter(uint8_t value, uint32_t ctx)
  {
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, glValue(value));
  }

  void SKIP_GL_setTexture2DMagFilter(uint8_t value, uint32_t ctx)
  {
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, glValue(value));
  }

  void SKIP_GL_setTexture2DWrapS(uint8_t value, uint32_t ctx)
  {
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, glValue(value));
  }

  void SKIP_GL_setTexture2DWrapT(uint8_t value, uint32_t ctx)
  {
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, glValue(value));
  }

  uint32_t SKIP_GL_createFragmentShader(uint32_t ctx)
  {
    return glCreateShader(GL_FRAGMENT_SHADER);
  }

  uint32_t SKIP_GL_createVertexShader(uint32_t ctx)
  {
    return glCreateShader(GL_VERTEX_SHADER);
  }

  void SKIP_GL_shaderSource(uint32_t shader, char *source, uint32_t ctx)
  {
    uint32_t len = SKIP_String_byteSize(source);
    GLchar const *sources[] = {(const char *)source};
    GLint lengths[] = {(GLint)len};
    glShaderSource(shader, 1, sources, lengths);
  }

  void SKIP_GL_compileShader(uint32_t shader, uint32_t ctx)
  {
    glCompileShader(shader);
  }

  void SKIP_GL_deleteShader(uint32_t shader, uint32_t ctx)
  {
    glDeleteShader(shader);
  }

  bool SKIP_GL_isCompiled(uint32_t shader, uint32_t ctx)
  {
    GLint isCompiled = 0;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &isCompiled);
    return isCompiled;
  }

  char *SKIP_GL_getShaderInfoLog(uint32_t shader, uint32_t ctx)
  {
    GLint maxLength = 0;
    glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &maxLength);
    std::vector<GLchar> infoLog(maxLength);
    glGetShaderInfoLog(shader, maxLength, &maxLength, &infoLog[0]);
    std::string s(infoLog.begin(), infoLog.end());
    return sk_string_create(s.c_str(), s.size());
  }

  void SKIP_GL_setTexture2DRGBASubImage(
      uint32_t level,
      uint32_t x,
      uint32_t y,
      uint32_t width,
      uint32_t height,
      const void *src,
      uint32_t ctx)
  {
    glTexSubImage2D(GL_TEXTURE_2D, level, x, y, width, height, GL_RGBA, GL_UNSIGNED_BYTE, src);
  }

  void SKIP_GL_setTexture2DRGBAImage(
      uint32_t level,
      uint32_t width,
      uint32_t height,
      const void *src,
      uint32_t ctx)
  {
    glTexImage2D(GL_TEXTURE_2D, level, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, src);
  }

  void SKIP_GL_flush(uint32_t ctx)
  {
    glFlush();
  }

  void SKIP_GL_viewport(int32_t x, int32_t y, uint32_t width, uint32_t height, uint32_t ctx)
  {
    gState.viewport = Viewport{x, y, width, height};
    glViewport(x, y, width, height);
  }

  uint32_t SKIP_GL_createProgram(uint32_t ctx)
  {
    return glCreateProgram();
  }

  void SKIP_GL_attachShader(uint32_t program, uint32_t shader, uint32_t ctx)
  {
    glAttachShader(program, shader);
  }

  void SKIP_GL_detachShader(uint32_t program, uint32_t shader, uint32_t ctx)
  {
    glDetachShader(program, shader);
  }

  void SKIP_GL_linkProgram(uint32_t program, uint32_t ctx)
  {
    glLinkProgram(program);
  }

  void SKIP_GL_useProgram(uint32_t program, uint32_t ctx)
  {
    glUseProgram(program);
  }

  void SKIP_GL_deleteProgram(uint32_t program, uint32_t ctx)
  {
    glDeleteProgram(program);
  }

  bool SKIP_GL_isLinked(uint32_t program, uint32_t ctx)
  {
    GLint isLinked = 0;
    glGetProgramiv(program, GL_LINK_STATUS, &isLinked);
    return isLinked;
  }

  char *SKIP_GL_getProgramInfoLog(uint32_t program, uint32_t ctx)
  {
    GLint maxLength = 0;
    glGetProgramiv(program, GL_INFO_LOG_LENGTH, &maxLength);
    std::vector<GLchar> infoLog(maxLength);
    glGetProgramInfoLog(program, maxLength, &maxLength, &infoLog[0]);
    std::string s(infoLog.begin(), infoLog.end());
    return sk_string_create(s.c_str(), s.size());
  }

  void SKIP_GL_bindArrayBuffer(uint32_t buffer, uint32_t ctx)
  {
    glBindBuffer(GL_ARRAY_BUFFER, buffer);
  }

  void SKIP_GL_enableVertexAttributeArray(uint32_t location, uint32_t ctx)
  {
    glEnableVertexAttribArray(location);
  }

  void SKIP_GL_disableVertexAttributeArray(uint32_t location, uint32_t ctx)
  {
    glDisableVertexAttribArray(location);
  }

  void SKIP_GL_vertexFloatAttributePointer(uint32_t location, uint32_t size, bool normalized, uint32_t offset, uint32_t ctx)
  {
    glVertexAttribPointer(location, size, GL_FLOAT, normalized, 0, BUFFER_OFFSET(offset));
  }

  void SKIP_GL_uniformMatrix4fv(
      uint32_t location,
      bool transpose,
      double v1,
      double v2,
      double v3,
      double v4,
      double v5,
      double v6,
      double v7,
      double v8,
      double v9,
      double v10,
      double v11,
      double v12,
      double v13,
      double v14,
      double v15,
      double v16,
      uint32_t ctx)
  {
    GLfloat modelviewmatrix[] = {
        (GLfloat)v1,
        (GLfloat)v2,
        (GLfloat)v3,
        (GLfloat)v4,
        (GLfloat)v5,
        (GLfloat)v6,
        (GLfloat)v7,
        (GLfloat)v8,
        (GLfloat)v9,
        (GLfloat)v10,
        (GLfloat)v11,
        (GLfloat)v12,
        (GLfloat)v13,
        (GLfloat)v14,
        (GLfloat)v15,
        (GLfloat)v16,
    };
    glUniformMatrix4fv(
        location,
        1,
        transpose,
        modelviewmatrix);
  }

  void SKIP_GL_uniform1i(uint32_t location, uint32_t value, uint32_t ctx)
  {
    glUniform1i(location, value);
  }

  void SKIP_GL_uniform1f(uint32_t location, double value, uint32_t ctx)
  {
    glUniform1f(location, (GLfloat)value);
  }

  void SKIP_GL_uniform2f(uint32_t location, double v0, double v1, uint32_t ctx)
  {
    glUniform2f(location, (GLfloat)v0, (GLfloat)v1);
  }

  void SKIP_GL_uniform4f(uint32_t location, double v0, double v1, double v2, double v3, uint32_t ctx)
  {
    glUniform4f(location, (GLfloat)v0, (GLfloat)v1, (GLfloat)v2, (GLfloat)v3);
  }

  void SKIP_GL_uniform4fv(uint32_t location, uint32_t count, void *data, uint32_t ctx)
  {
    auto len = count * 4;
    std::vector<GLfloat> new_vec(len, 0.0f);
    for (int i = 0; i < len; i++)
    {
      new_vec[i] = (GLfloat)SKIP_getFloatAt(data, i);
    };
    const GLfloat *ptr = &new_vec[0];
    glUniform4fv(location, count, ptr);
  }

  void SKIP_GL_uniform1fv(uint32_t location, uint32_t count, void *data, uint32_t ctx)
  {
    std::vector<GLfloat> new_vec(count, 0.0f);
    for (int i = 0; i < count; i++)
    {
      new_vec[i] = (GLfloat)SKIP_getFloatAt(data, i);
    };
    const GLfloat *ptr = &new_vec[0];
    glUniform1fv(location, count, ptr);
  }

  void SKIP_GL_drawTriangles(uint32_t first, uint32_t count, uint32_t ctx)
  {
    glDrawArrays(GL_TRIANGLES, first, count);
  }

  void SKIP_GL_drawTriangleStrip(uint32_t first, uint32_t count, uint32_t ctx)
  {
    glDrawArrays(GL_TRIANGLE_STRIP, first, count);
  }

  uint32_t SKIP_GL_getAttributeLocation(uint32_t program, uint32_t index, uint32_t ctx)
  {
    return glGetAttribLocation(program, attributes[index]);
  }

  uint32_t SKIP_GL_getUniformLocation(uint32_t program, uint32_t index, uint32_t ctx)
  {
    return glGetUniformLocation(program, uniforms[index]);
  }

  uint32_t SKIP_GL_createBuffer(uint32_t ctx)
  {
    GLuint buf;
    glCreateBuffers(1, &buf);
    return buf;
  }

  void SKIP_GL_staticDrawData(void *data, uint32_t len, uint32_t ctx)
  {
    std::vector<GLfloat> new_vec(len, 0.0f);
    for (int i = 0; i < len; i++)
    {
      new_vec[i] = (GLfloat)SKIP_getFloatAt(data, i);
    };
    void *ptr = &new_vec[0];
    glBufferData(GL_ARRAY_BUFFER, len * sizeof(GLfloat), ptr, GL_STATIC_DRAW);
  }

  void SKIP_GL_deleteBuffer(uint32_t buffer, uint32_t ctx)
  {
    glDeleteBuffers(1, &buffer);
  }

  uint32_t SKIP_GL_createVertexArray(uint32_t ctx)
  {
    GLuint arr;
    glCreateVertexArrays(1, &arr);
    return arr;
  }

  void SKIP_GL_bindVertexArray(uint32_t arr, uint32_t ctx)
  {
    glBindVertexArray(arr);
  }

  void SKIP_GL_deleteVertexArray(uint32_t arr, uint32_t ctx)
  {
    glDeleteVertexArrays(1, &arr);
  }

  uint32_t SKIP_GL_createFramebuffer(uint32_t ctx)
  {
    GLuint buf;
    glCreateFramebuffers(1, &buf);
    return buf;
  }

  void SKIP_GL_bindMainFrameBuffer(uint32_t ctx)
  {
    if (frameBuffer != 0)
    {
      glBindFramebuffer(GL_FRAMEBUFFER, 0);
      frameBuffer = 0;
    }
  }

  void SKIP_GL_bindTextureFrameBuffer(uint32_t ctx)
  {
    if (textureBuffer == 0)
    {
      textureBuffer = SKIP_GL_createFramebuffer(ctx);
    }
    if (frameBuffer != textureBuffer)
    {
      glBindFramebuffer(GL_FRAMEBUFFER, textureBuffer);
      frameBuffer = textureBuffer;
    }
  }

  void SKIP_GL_clear(uint32_t ctx)
  {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  }

  void SKIP_GL_clearColor(double r, double g, double b, double a, uint32_t ctx)
  {
    gState.color = Color{(GLclampf)r, (GLclampf)g, (GLclampf)b, (GLclampf)a};
    glClearColor((GLclampf)r, (GLclampf)g, (GLclampf)b, (GLclampf)a);
  }

  void GL_drawFrame(uint32_t width, uint32_t height, uint32_t time)
  {
    gState.viewport = Viewport{0, 0, width, height};
    gState.color = Color{1, 1, 1, 1};
    SKIP_FWK_drawFrame(width, height, time);
    glFlush();
  }

  void SKIP_GL_framebufferTexture2DColor(uint32_t texture, uint32_t level, uint32_t ctx)
  {
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture, level);
  }

  void SKIP_GL_srcAlphaBlendSrcColor(uint32_t ctx)
  {
    glBlendFunc(GL_SRC_ALPHA, GL_SRC_COLOR);
  }

  void SKIP_GL_srcAlphaBlendOneMinus(uint32_t ctx)
  {
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
  }

  void SKIP_GL_oneBlendOneMinus(uint32_t ctx)
  {
    glBlendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
  }

  void SKIP_GL_straitAlphaBlending(uint32_t ctx)
  {
    glBlendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA);
  }

  void SKIP_GL_activeTexture(uint32_t index, uint32_t ctx)
  {
    glActiveTexture(GL_TEXTURE0 + index);
  };

  void SKIP_GL_disableBlend(uint32_t ctx)
  {
    gState.blend = false;
    glDisable(GL_BLEND);
  }

  void SKIP_GL_enableBlend(uint32_t ctx)
  {
    gState.blend = true;
    glEnable(GL_BLEND);
  }

  void SKIP_GL_save(uint32_t ctx)
  {
    gStates.push(gState);
  }

  void SKIP_GL_restore(uint32_t ctx)
  {
    gState = gStates.top();
    if (gState.texture)
    {
      glEnable(GL_TEXTURE_2D);
    }
    else
    {
      glDisable(GL_TEXTURE_2D);
    };
    if (gState.blend)
    {
      glEnable(GL_BLEND);
    }
    else
    {
      glDisable(GL_BLEND);
    };
    glBlendFunc(GL_SRC_ALPHA, gState.srcAlpha);
    glViewport(
        gState.viewport.x,
        gState.viewport.y,
        gState.viewport.width,
        gState.viewport.height);
    glClearColor(
        gState.color.r,
        gState.color.g,
        gState.color.b,
        gState.color.a);
    gStates.pop();
  }

  bool checkImage(std::string path, uint32_t &width, uint32_t &height)
  {
    std::stringstream command;
    command << "convert ";
    command << std::quoted(path);
    command << " -print \"%wx%h\" /dev/null";
    auto fp = popen(command.str().c_str(), "r");
    if (fp != nullptr)
    {
      char buf[1024];
      std::stringstream res;
      while (fgets(buf, 1024, fp))
      {
        res << buf;
      }
      auto status = pclose(fp);
      if (status == 0)
      {
        std::string info = res.str();
        trim(info);
        sscanf(info.c_str(), "%dx%d", &width, &height);
        return true;
      }
      else
      {
        return false;
      }
    };
    return false;
  }

  bool convertToBin(std::string path, char *buffer, int size)
  {
    std::stringstream command;
    command << "convert ";
    command << std::quoted(path);
    command << " RGBA:-";
    std::string strCommand = command.str();
    auto fp = popen(strCommand.c_str(), "r");
    if (fp != nullptr)
    {
      auto count = fread(buffer, 1, size, fp);
      auto status = pclose(fp);
      return status == 0 && count == size;
    };
    return false;
  }

  bool convertFromBin(fs::path &fromPath, fs::path &toPath, uint32_t width, uint32_t height, uint32_t depth)
  {
    std::stringstream command;
    command << "convert -size ";
    command << width;
    command << "x";
    command << height;
    command << " -depth ";
    command << depth;
    command << " ";
    command << " RGBA:";
    command << std::quoted(fromPath.string());
    command << " ";
    command << std::quoted(toPath.string());
    std::string strCommand = command.str();
    // std::cout << strCommand << std::endl;
    auto fp = popen(strCommand.c_str(), "r");
    if (fp != nullptr)
    {
      auto status = pclose(fp);
      return status == 0;
    };
    return false;
  }

  bool resizeBin(
      std::string &fromPath,
      uint32_t srcWidth,
      uint32_t srcHeight,
      uint32_t width,
      uint32_t height,
      char *buffer,
      int size)
  {
    std::stringstream command;
    command << "convert -size ";
    command << srcWidth;
    command << "x";
    command << srcHeight;
    command << " -depth 8";
    command << " RGBA:";
    command << std::quoted(fromPath);
    command << " -resize ";
    command << width;
    command << "x";
    command << height;
    command << "! RGBA:-";
    std::string strCommand = command.str();
    auto fp = popen(strCommand.c_str(), "r");
    if (fp != nullptr)
    {
      auto count = fread(buffer, 1, size, fp);
      auto status = pclose(fp);
      return status == 0 && count == size;
    };
    return false;
  }

  void SKIP_FWK_loadImage(uint32_t wId, char *scope, char *path, char *target, uint32_t ctx)
  {
    TXT(path, strPath);
    TXT(scope, strScope);
    TXT(target, strTarget);
    std::thread t([wId, strScope, strPath, strTarget, ctx]()
                  {
      std::string type;
      fs::path fsScopePath;
      checkScopePath(strScope, fsScopePath);
      fs::path fspath = fsScopePath / strPath;
      uint32_t width, height, result;
      if (!checkImage(fspath.string(), width, height)) {
        result = NOT_MANAGED_IMAGE_FORMAT;
      } else {
        int size = width * height * 4;
        char * buffer = new char[size + 1];
        if (!convertToBin(fspath.string(), buffer, size)) {
          result = UNABLE_TO_LOAD_IMAGE;
        } else {
          std::vector<uint8_t> vector(&buffer[0], &buffer[size]);
          SKIP_FWK_execute(wId, [strPath, strTarget, vector, width, height, ctx]()
          {
            auto skPath = sk_string_create(strPath.c_str(), strPath.size());
            auto skTarget = sk_string_create(strTarget.c_str(), strTarget.size());
            auto arraySize = width * height;
            auto pixArray = SKIP_FWK_createPixArray(arraySize);
            for (int i = 0; i < arraySize * 4; i += 4) {
              SKIP_FWK_setPix(pixArray, i / 4, vector[i], vector[i + 1], vector[i + 2], vector[i + 3]);
            }
            SKIP_FWK_imgSuccess(skPath, pixArray, width, height, skTarget);
          });
          result = 0;
        }
        delete[] buffer;
      };
      if (result != 0) {
        SKIP_FWK_execute(wId, [strPath, strTarget, result]()
        {
          auto skPath = sk_string_create(strPath.c_str(), strPath.size());
          auto skTarget = sk_string_create(strTarget.c_str(), strTarget.size());
          SKIP_FWK_imgFailure(skPath, result, skTarget);
        });
      } });
    t.detach();
  }

  bool SKIP_GL_saveTexture(char *path, uint32_t texture, uint32_t width, uint32_t height, uint32_t ctx)
  {
    TXT(path, strPath);
    GLubyte pixels[width * height * 4];
    glBindTexture(GL_TEXTURE_2D, texture);
    glGetTexImage(GL_TEXTURE_2D, 0, GL_RGBA, GL_UNSIGNED_BYTE, pixels);
    auto res = saveImage(strPath, (const char *)pixels, width, height);
    glBindTexture(GL_TEXTURE_2D, 0);
    return res;
  }

  uint32_t createTexture(uint32_t width, uint32_t height, uint32_t ctx, void *buffer)
  {
    auto size = width * height * 4;
    GLuint target = SKIP_GL_createTexture(ctx);
    glBindTexture(GL_TEXTURE_2D, target);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, buffer);
    glBindTexture(GL_TEXTURE_2D, 0);
    kept.insert(target);
    return target;
  }

  void fillTexture(uint32_t id, void *buffer, uint32_t width, uint32_t height, uint32_t ctx)
  {
    glBindTexture(GL_TEXTURE_2D, id);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, buffer);
    glBindTexture(GL_TEXTURE_2D, 0);
  }

  void releaseTexture(uint32_t id)
  {
    auto it = kept.find(id);
    if (it != kept.end())
    {
      kept.erase(it);
    }
    GL_deleteTexture(id);
  }

  uint32_t SKIP_GL_cloneTexture(uint32_t texture, uint32_t width, uint32_t height, uint32_t ctx)
  {
    auto size = width * height * 4;
    glBindTexture(GL_TEXTURE_2D, texture);
    GLubyte pixels[size];
    glGetTexImage(GL_TEXTURE_2D, 0, GL_RGBA, GL_UNSIGNED_BYTE, pixels);
    GLuint target = SKIP_GL_createTexture(ctx);
    glBindTexture(GL_TEXTURE_2D, target);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, pixels);
    glBindTexture(GL_TEXTURE_2D, 0);
    return target;
  }

  uint32_t SKIP_GL_resizeTexture(uint32_t texture, uint32_t srcWidth, uint32_t srcHeight, uint32_t dstWidth, uint32_t dstHeight, uint32_t ctx)
  {
    GLuint target = SKIP_GL_createTexture(ctx);
    glBindTexture(GL_TEXTURE_2D, target);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, dstWidth, dstHeight, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);
    glBindTexture(GL_TEXTURE_2D, 0);
    auto currentFrame = frameBuffer;
    SKIP_GL_bindTextureFrameBuffer(ctx);
    glFramebufferTexture2D(GL_READ_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture, 0);
    glFramebufferTexture2D(GL_DRAW_FRAMEBUFFER, GL_COLOR_ATTACHMENT1, GL_TEXTURE_2D, target, 0);
    glDrawBuffer(GL_COLOR_ATTACHMENT1);
    auto width = srcWidth > dstWidth ? dstWidth : srcWidth;
    auto height = srcHeight > dstHeight ? dstHeight : srcHeight;
    glBlitFramebuffer(
        0, 0, width, height,
        0, 0, width, height,
        GL_COLOR_BUFFER_BIT, GL_NEAREST);
    if (currentFrame != textureBuffer)
    {
      SKIP_GL_bindMainFrameBuffer(ctx);
    }
    return target;
  }

  void SKIP_GL_copyTexture(
      uint32_t toPaste,
      uint32_t srcX, uint32_t srcY,
      uint32_t srcWidth, uint32_t srcHeight,
      uint32_t target, uint32_t dstX, uint32_t dstY,
      uint32_t width, uint32_t height,
      bool reverted,
      uint32_t ctx)
  {
    GLubyte *pixels = (GLubyte *)malloc(srcWidth * srcHeight * 4 * sizeof(GLubyte));
    glBindTexture(GL_TEXTURE_2D, toPaste);
    glGetTexImage(GL_TEXTURE_2D, 0, GL_RGBA, GL_UNSIGNED_BYTE, pixels);
    checkError();
    if (width < srcWidth || height < srcHeight || reverted)
    {
      GLubyte *buffer = (GLubyte *)malloc(width * height * 4 * sizeof(GLubyte));
      for (int y = srcY; y < srcY + height; y++)
      {
        auto index = (y - srcY) * width * 4;
        auto ySrc = y;
        if (reverted)
        {
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
    }
    else
    {
      glBindTexture(GL_TEXTURE_2D, target);
      SKIP_GL_setTexture2DRGBASubImage(0, dstX, dstY, width, height, pixels, ctx);
    }
    glBindTexture(GL_TEXTURE_2D, 0);
    free(pixels);
  }
}