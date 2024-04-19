
#include <stdbool.h>
#define NULL ((void *)0)

typedef unsigned char uint8_t;

char *workingContext;
char *mainContext;

uint8_t initialized = 0;

void *SKIP_new_Obstack();
void SKIP_destroy_Obstack(void *saved);

void SKIP_SKStore_setMainContext(char *context) { mainContext = context; }

char *SKIP_SKStore_getMainContext() { return mainContext; }

void SKIP_SKStore_setWorkingContext(char *context) { workingContext = context; }

char *SKIP_SKStore_getWorkingContext() { return workingContext; }

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