#include <ctime>
#include <sys/time.h>
#include <stdint.h>
#include <iomanip>
#include <iostream>
#include <fstream>
#include <sstream>
#include <iterator>
#include <cstdlib>
#include <vector>
#include <openssl/evp.h>
#include <sys/utsname.h>
#include <experimental/filesystem>
#include <array>
#include <string.h>

typedef uint64_t SkipInt;
namespace fs = std::experimental::filesystem;

uint8_t initialized = 0;

#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))
#define STR(text) sk_string_create(text, strlen(text))

char * workingContext;
char * mainContext;

void tempName(std::string & tmpName) {
  fs::path tmpDir = fs::temp_directory_path();
  fs::path tmpFileName =  tmpDir / "tmp-XXXXXXXXXXX";
  std::string strFileName = tmpFileName.c_str();
  char* nameBuff = (char*)malloc(strFileName.size()+1);
  memcpy(nameBuff, strFileName.c_str(), strFileName.size());
  mkstemp(nameBuff);
  tmpName = nameBuff;
  free(nameBuff);
}

bool computeHash(const std::string &unhashed, std::string &hashed)
{
  bool success = false;

  EVP_MD_CTX *context = EVP_MD_CTX_new();

  if (context != NULL)
  {
    if (EVP_DigestInit_ex(context, EVP_sha256(), NULL))
    {
      if (EVP_DigestUpdate(context, unhashed.c_str(), unhashed.length()))
      {
        unsigned char hash[EVP_MAX_MD_SIZE];
        unsigned int lengthOfHash = 0;

        if (EVP_DigestFinal_ex(context, hash, &lengthOfHash))
        {
          std::stringstream ss;
          for (unsigned int i = 0; i < lengthOfHash; ++i)
          {
            ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
          }

          hashed = ss.str();
          success = true;
        }
      }
    }

    EVP_MD_CTX_free(context);
  }

  return success;
}


extern "C"
{
  char *SKIP_createByteArray(int32_t);
  char *SKIP_chillByteArray(char *);
  void SKIP_throw(void *);
  uint32_t SKIP_String_byteSize(char *str);
  void *SKIP_System_createTimeStamp(int32_t seconds, int32_t microseconds);
  char *sk_string_create(const char *buffer, uint32_t size);
  void SKIP_FileSystem_throwError(char *, char *);

  void *SKIP_new_Obstack();
  void SKIP_destroy_Obstack(void *saved);
}

bool _exec(std::string command, std::string &result, bool exep)
{
  std::array<char, 128> buffer;
  std::unique_ptr<FILE, decltype(&pclose)> pipe(popen(command.c_str(), "r"), pclose);
  if (!pipe)
  {
    if (exep)
    {
      SKIP_throw(NULL);
    }
    else
    {
      return false;
    }
  }
  while (fgets(buffer.data(), buffer.size(), pipe.get()) != nullptr)
  {
    result += buffer.data();
  }
  return true;
}

char* md5sum(std::string & strPath) {
  std::string result;
  std::stringstream command;
  command << "md5sum ";
  command << std::quoted(strPath);
  _exec(command.str(), result, true);
  std::istringstream iss(result);
  std::vector<std::string> results(std::istream_iterator<std::string>{iss},
                                    std::istream_iterator<std::string>());
  auto str = results.front();
  return sk_string_create(str.c_str(), str.size());
}

extern "C"
{
  void* SKIP_SKUI_checkObstack() {
    if (initialized == 0) {
      void* saved = SKIP_new_Obstack();
      initialized = 1;
      return saved;
    }
    return NULL;
  }

  void SKIP_SKUI_cleanObstack(void* saved) {
    if (saved != NULL && initialized > 0) {
      SKIP_destroy_Obstack(saved);
      initialized = 0;
    }
  }

  void SKIP_SKStore_setMainContext(char * context) {
    mainContext = context;
  }

  char *SKIP_SKStore_getMainContext()
  {
    return mainContext;
  }

  void SKIP_SKStore_setWorkingContext(char * context) {
    workingContext = context;
  }

  char *SKIP_SKStore_getWorkingContext()
  {
    return workingContext;
  }

  void *SKIP_System_timeStamp()
  {
    timeval curTime;
    gettimeofday(&curTime, 0);
    return SKIP_System_createTimeStamp(curTime.tv_sec, curTime.tv_usec);
  }

  char *SKIP_Utils_sha256(char *toEncode)
  {
    auto len = SKIP_String_byteSize(toEncode);
    char cToEncode[len + 1];
    memcpy(cToEncode, (const char *)toEncode, len);
    cToEncode[len] = 0;

    std::string hashed;
    computeHash(cToEncode, hashed);
    return sk_string_create(hashed.c_str(), hashed.size());
  }

  char *SKIP_Utils_md5sum(char *path)
  {
    std::string strPath(path, SKIP_String_byteSize(path));
    return md5sum(strPath);
  }

  char *SKIP_Utils_md5(char *value, uint32_t size)
  {
    std::string filename;
    tempName(filename);
    //std::mkstemp
    if(size <= 0) {
      size = SKIP_String_byteSize(value);
    }
    try
    {
      std::ofstream ofs(filename);
      ofs.write(value, size);
      ofs.close();
    }
    catch (...)
    {
      return sk_string_create("", 0);
    }
    auto res = md5sum(filename);
    fs::remove(filename);
    return res;
  }


  char * SKIP_JS_getExceptionMessage(uint32_t actor) {
    char message[] = "SKIP_JS_getExceptionMessage shall not be used here;";
    return sk_string_create(message, strlen(message));
  }

  void SKIP_JS_deleteException(uint32_t actor) {
    // Nothing
  }

}
