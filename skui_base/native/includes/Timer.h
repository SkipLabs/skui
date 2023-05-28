#ifndef __SKUI_TIMER_H__
#define __SKUI_TIMER_H__

#include <functional>

class Timer
{
  bool cancel = false;

public:
  void setTimeout(std::function<void()> function, int delay);
  void setInterval(std::function<void()> function, int interval);
  void stop();
};

#endif