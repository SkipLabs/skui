#ifndef __SKUI_ANIMATION_FRAME_H__
#define __SKUI_ANIMATION_FRAME_H__

#include <fstream>
#include <functional>
#include <stdint.h>

namespace skui {
class AnimationFrame {
  bool cancel = false;
  bool animationRequested = false;
  uint64_t framePerSecond = 0;
  uint64_t dropped = 0;
  uint64_t droppedAt = 0;
  uint64_t total = 0;
  uint64_t totalDropped = 0;
  uint64_t maxDropped = 0;
  uint64_t maxDroppedAt = 0;

public:
  void start(std::function<void()> function, int framePerSecond);
  void stop();
  void framePerformed();
  void print(std::ostream &buffer);
};
} // namespace skui

#endif