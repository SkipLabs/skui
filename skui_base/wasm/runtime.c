
#include <stdbool.h>
#define NULL ((void*)0)

char * workingContext;
char * mainContext;

void SKIP_SKFS_setMainContext(char * context) {
  mainContext = context;
}

char *SKIP_SKFS_getMainContext()
{
  return mainContext;
}

void SKIP_SKFS_setWorkingContext(char * context) {
  workingContext = context;
}

char *SKIP_SKFS_getWorkingContext()
{
  return workingContext;
}