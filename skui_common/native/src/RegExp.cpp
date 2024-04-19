#include "string.h"
#include <array>
#include <pcre.h>
#include <regex>
#include <string>

#define TXT(from, to) std::string to(from, SKIP_String_byteSize(from))
#define STR(text) sk_string_create(text, strlen(text))

std::regex specialChars{R"([-[\]{}()*+?.,\^$|#\s])"};

extern "C" {
uint32_t SKIP_String_byteSize(char *str);
char *sk_string_create(const char *buffer, uint32_t size);
void SKIP_throwRegExpException(const char *buffer);
void *SKIP_RegExp_createRangeArray(uint32_t size);
void SKIP_RegExp_setRange(void *ranges, uint32_t index, uint32_t start,
                          uint32_t end);
void *SKIP_RegExp_createRangesVector();
void SKIP_RegExp_pushRanges(void *rangesVec, void *ranges);
void *SKIP_RegExp_ranges(void *rangesVec);
}

void check(std::string &strPattern, bool caseInsensitive, bool, pcre **regex,
           pcre_extra **extra) {
  const char *errorMessage;
  int errorOffset;
  auto m_regex =
      pcre_compile(strPattern.c_str(), caseInsensitive ? PCRE_CASELESS : 0,
                   &errorMessage, &errorOffset,
                   nullptr // Pointer to character tables, or nullptr to use the
                           // built-in default
      );
  if (m_regex == nullptr) {
    SKIP_throwRegExpException(STR(errorMessage));
  }
  auto m_extra = pcre_study(m_regex, 0, &errorMessage);
  if (m_extra == nullptr && errorMessage != nullptr) {
    pcre_free(m_regex);
    SKIP_throwRegExpException(STR(errorMessage));
  }
  *regex = m_regex;
  *extra = m_extra;
}

extern "C" {
char *SKIP_RegExp_escape(char *value) {
  TXT(value, strValue);
  std::string sanitized =
      std::regex_replace(strValue.c_str(), specialChars, R"(\$&)");
  return sk_string_create(sanitized.c_str(), sanitized.size());
}

void SKIP_RegExp_check(char *pattern) {
  TXT(pattern, strPattern);
  pcre *regex = nullptr;
  pcre_extra *extra = nullptr;
  check(strPattern, false, false, &regex, &extra);
  if (regex != nullptr) {
    pcre_free(regex);
  }
  if (extra != nullptr) {
    pcre_free_study(extra);
  }
}

bool SKIP_RegExp_test(char *subject, char *pattern, bool caseInsensitive,
                      bool global) {
  TXT(subject, strSubject);
  TXT(pattern, strPattern);
  pcre *regex;
  pcre_extra *extra;
  check(strPattern, caseInsensitive, global, &regex, &extra);
  std::array<int, 99 * 3> ovector;
  int ret = pcre_exec(regex, extra, subject, SKIP_String_byteSize(subject), 0,
                      0, // options
                      ovector.data(), ovector.size());
  if (ret == PCRE_ERROR_NOMATCH) {
    pcre_free(regex);
    pcre_free_study(extra);
    return false;
  }
  if (ret == 0) {
    pcre_free(regex);
    pcre_free_study(extra);
    SKIP_throwRegExpException(STR("pcre ovector buffer size too small"));
  }
  if (ret < 0) {
    pcre_free(regex);
    pcre_free_study(extra);
    SKIP_throwRegExpException(STR("Internal pcre error"));
  }
  return ret > 0;
}

void *SKIP_RegExp_match(char *subject, char *pattern, bool caseInsensitive,
                        bool global) {
  TXT(subject, strSubject);
  TXT(pattern, strPattern);
  pcre *regex;
  pcre_extra *extra;
  check(strPattern, caseInsensitive, global, &regex, &extra);
  std::array<int, 99 * 3> ovector;
  int ret = pcre_exec(regex, extra, subject, SKIP_String_byteSize(subject), 0,
                      0, // options
                      ovector.data(), ovector.size());
  if (ret == PCRE_ERROR_NOMATCH) {
    pcre_free(regex);
    pcre_free_study(extra);
    return nullptr;
  }
  if (ret == 0) {
    pcre_free(regex);
    pcre_free_study(extra);
    SKIP_throwRegExpException(STR("pcre ovector buffer size too small"));
  }
  if (ret < 0) {
    pcre_free(regex);
    pcre_free_study(extra);
    SKIP_throwRegExpException(STR("Internal pcre error"));
  }
  auto result = SKIP_RegExp_createRangeArray(ret);
  for (int i = 0; i < ret; ++i) {
    SKIP_RegExp_setRange(result, i, ovector[i * 2], ovector[i * 2 + 1]);
  }
  pcre_free(regex);
  pcre_free_study(extra);
  return result;
}

void *SKIP_RegExp_matchAll(char *subject, char *pattern, bool caseInsensitive,
                           bool global) {
  TXT(pattern, strPattern);
  pcre *regex;
  pcre_extra *extra;
  check(strPattern, caseInsensitive, global, &regex, &extra);
  std::array<int, 99 * 3> ovector;
  int index = 0;
  int ret;
  auto rangesVec = SKIP_RegExp_createRangesVector();
  while ((ret = pcre_exec(
              regex, extra, subject, SKIP_String_byteSize(subject), index,
              0, // options
              ovector.data(), ovector.size())) != PCRE_ERROR_NOMATCH) {
    if (ret == 0) {
      pcre_free(regex);
      pcre_free_study(extra);
      SKIP_throwRegExpException(STR("pcre ovector buffer size too small"));
    }
    if (ret < 0) {
      pcre_free(regex);
      pcre_free_study(extra);
      SKIP_throwRegExpException(STR("Internal pcre error"));
    }
    auto ranges = SKIP_RegExp_createRangeArray(ret);
    for (int i = 0; i < ret; ++i) {
      auto start = ovector[i * 2];
      auto end = ovector[i * 2 + 1];
      SKIP_RegExp_setRange(ranges, i, start, end);
    }
    SKIP_RegExp_pushRanges(rangesVec, ranges);
    index = ovector[1];
  }
  pcre_free(regex);
  pcre_free_study(extra);
  return SKIP_RegExp_ranges(rangesVec);
}
}