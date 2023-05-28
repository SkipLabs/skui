#ifndef __SKUI_ANIMATION_FRAME_H__
#define __SKUI_ANIMATION_FRAME_H__

#include <functional>
namespace skui
{
  class AnimationFrame
  {
    bool cancel = false;
    bool animationRequested = false;
    int dropped = 0;
    int maxDropped = 0;

  public:
    void start(std::function<void()> function, int framePerSecond);
    void stop();
    void framePerformed();
  };
} // namespace skui

#endif