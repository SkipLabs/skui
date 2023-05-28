#include "AnimationFrame.h"

#include <thread>
#include <chrono>
#include <math.h>
#include <algorithm>

namespace skui
{
  void AnimationFrame::start(std::function<void()> function, int framePerSecond)
  {
    this->cancel = false;
    int64_t interval = (int64_t)floor(1000.0 / framePerSecond);
    std::thread t([=]()
                  {
        while(true) {
            if(this->cancel) return;
            std::this_thread::sleep_for(std::chrono::milliseconds(interval));
            if(this->cancel) return;
            if (!this->animationRequested) {
              function();
              this->animationRequested = true;
            } else {
              this->dropped++;
            }
        } });
    t.detach();
  }

  void AnimationFrame::stop()
  {
    this->cancel = true;
  }

  void AnimationFrame::framePerformed()
  {
    this->animationRequested = false;
    this->maxDropped = std::max(this->maxDropped, this->dropped);
    this->dropped = 0;
  }
}
