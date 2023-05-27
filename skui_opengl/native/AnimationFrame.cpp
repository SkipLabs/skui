#include "AnimationFrame.h"

#include <thread>
#include <chrono>
#include <math.h>
#include  <algorithm>

void SKUiAnimationFrame::start(std::function<void()> function, int framePerSecond) {
    this->cancel = false;
    int64_t interval = (int64_t)floor(1000.0 / framePerSecond);
    std::thread t([=]() {
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
        }
    });
    t.detach();
}

void SKUiAnimationFrame::stop() {
    this->cancel = true;
}

void SKUiAnimationFrame::framePerformed() {
    this->animationRequested = false;
    this->maxDropped = std::max(this->maxDropped, this->dropped);
    this->dropped = 0;
}
