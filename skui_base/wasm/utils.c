
void *convertFTime(double timestamp);
double JS_timeStamp();

void * timeStamp() {
  return convertFTime(JS_timeStamp());
}