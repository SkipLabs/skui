
#include "Timer.h"
#include <thread>
#include <chrono>

void Timer::setTimeout(std::function<void()> function, int delay) {
    this->cancel = false;
    std::thread t([=]() {
        if(this->cancel) return;
        std::this_thread::sleep_for(std::chrono::milliseconds(delay));
        if(this->cancel) return;
        function();
    });
    t.detach();
}

void Timer::setInterval(std::function<void()> function, int interval) {
    this->cancel = false;
    std::thread t([=]() {
        while(true) {
            if(this->cancel) return;
            std::this_thread::sleep_for(std::chrono::milliseconds(interval));
            if(this->cancel) return;
            function();
        }
    });
    t.detach();
}

void Timer::stop() {
    this->cancel = true;
}
    