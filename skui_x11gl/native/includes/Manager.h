#ifndef __SKUI_WINDOW_MANAGER_H__
#define __SKUI_WINDOW_MANAGER_H__

#include <functional>
#include <X11/Xlib.h>


class SKUiWindowManager {
    public:
        virtual void resize(uint32_t width, uint32_t height) = 0;
        virtual void performFrame(Display* d, Window w, uint32_t width, uint32_t height, std::function<void()> onDone) = 0;
        virtual void close() = 0;
        virtual void manageMouseLocation(uint32_t x, uint32_t y, uint32_t sx, uint32_t sy) = 0;
        virtual void manageMouseButton(uint32_t b, bool pressed) = 0;
        virtual void manageKeyPressed(uint32_t code, uint32_t sym,const std::string & value) = 0;
        virtual void manageKeyReleased(uint32_t code) = 0;
        virtual void checkClipboard(XSelectionEvent * s, Window w) = 0;
        virtual void updateClipboard(XSelectionRequestEvent * s) = 0;
        virtual void onIdle() = 0;
        
};

#endif