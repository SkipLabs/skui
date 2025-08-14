#include <array>
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <iterator>
#include <openssl/evp.h>
#include <sstream>
#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <sys/time.h>
#include <sys/utsname.h>
#include <vector>

typedef uint64_t SkipInt;

uint8_t initialized = 0;

#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))
#define STR(text) sk_string_create(text, strlen(text))

char *workingContext;
char *mainContext;

bool computeHash(const std::string &unhashed, std::string &hashed) {
  bool success = false;

  EVP_MD_CTX *context = EVP_MD_CTX_new();

  if (context != NULL) {
    if (EVP_DigestInit_ex(context, EVP_sha256(), NULL)) {
      if (EVP_DigestUpdate(context, unhashed.c_str(), unhashed.length())) {
        unsigned char hash[EVP_MAX_MD_SIZE];
        unsigned int lengthOfHash = 0;

        if (EVP_DigestFinal_ex(context, hash, &lengthOfHash)) {
          std::stringstream ss;
          for (unsigned int i = 0; i < lengthOfHash; ++i) {
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

extern "C" {
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

extern "C" {
void *SKIP_SKUI_checkObstack() {
  if (initialized == 0) {
    void *saved = SKIP_new_Obstack();
    initialized = 1;
    return saved;
  }
  return NULL;
}

void SKIP_SKUI_cleanObstack(void *saved) {
  if (saved != NULL && initialized > 0) {
    SKIP_destroy_Obstack(saved);
    initialized = 0;
  }
}

void SKIP_SKStore_setMainContext(char *context) { mainContext = context; }

char *SKIP_SKStore_getMainContext() { return mainContext; }

void SKIP_SKStore_setWorkingContext(char *context) { workingContext = context; }

char *SKIP_SKStore_getWorkingContext() { return workingContext; }
void *SKIP_System_timeStamp() {
  timeval curTime;
  gettimeofday(&curTime, 0);
  return SKIP_System_createTimeStamp(curTime.tv_sec, curTime.tv_usec);
}
char *SKIP_Utils_sha256(char *toEncode) {
  std::string hashed;
  computeHash(toEncode, hashed);
  return sk_string_create(hashed.c_str(), hashed.size());
}
}
