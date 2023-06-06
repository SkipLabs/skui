
void *SKIP_System_convertFTime(double timestamp);
double JS_timeStamp();

void * SKIP_System_timeStamp() {
  return SKIP_System_convertFTime(JS_timeStamp());
}