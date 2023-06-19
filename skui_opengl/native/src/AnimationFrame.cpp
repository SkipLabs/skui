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
    this->framePerSecond = framePerSecond;
    int64_t interval = (int64_t)floor(1000.0 / framePerSecond);
    std::thread t([=]()
                  {
        while(true) {
            if(this->cancel) return;
            std::this_thread::sleep_for(std::chrono::milliseconds(interval));
            if(this->cancel) return;
            this->total++;
            if (!this->animationRequested) {
              function();
              this->animationRequested = true;
            } else {
              if (this->dropped == 0) {
                this->droppedAt = this->total;
              }
              this->totalDropped++;
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
    if (this->dropped > this->maxDropped) {
      this->maxDropped = this->dropped;
      this->maxDroppedAt = this->droppedAt;
    }
    this->dropped = 0;
  }

  void AnimationFrame::print(std::ostream & buffer)  {
    auto avgFPS = floor((this->total - this->totalDropped) * 60 / (this->total - this->maxDropped));
    buffer << "For FPS: " << this->framePerSecond << " Total: " << this->total << ", Dropped: " << this->totalDropped;
    buffer << ", Max drop size: " << this->maxDropped << " at " << this->maxDroppedAt << ", Avg FPS " << avgFPS;
  }
}
