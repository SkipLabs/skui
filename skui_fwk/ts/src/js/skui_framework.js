class LinksImpl {
    constructor(env) {
        this.SKIP_FWK_applyCursor = (wId, code) => {
            let cursor = "default";
            switch (code) {
                case 0:
                    cursor = "none";
                    break;
                case 1:
                    cursor = "default";
                    break;
                case 2:
                    cursor = "pointer";
                    break;
                case 3:
                    cursor = "grab";
                    break;
                case 4:
                    cursor = "grabbing";
                    break;
                case 5:
                    cursor = "crosshair";
                    break;
                case 6:
                    cursor = "none";
                    break;
                case 7:
                    cursor = "move";
                    break;
                case 8:
                    cursor = "n-resize";
                    break;
                case 9:
                    cursor = "ne-resize";
                    break;
                case 10:
                    cursor = "e-resize";
                    break;
                case 11:
                    cursor = "se-resize";
                    break;
                case 12:
                    cursor = "s-resize";
                    break;
                case 13:
                    cursor = "sw-resize";
                    break;
                case 14:
                    cursor = "w-resize";
                    break;
                case 15:
                    cursor = "nw-resize";
                    break;
                case 16:
                    cursor = "col-resize";
                    break;
                case 17:
                    cursor = "row-resize";
                    break;
                case 18:
                    cursor = "text";
                    break;
                case 19:
                    cursor = "wait";
                    break;
                case 20:
                    cursor = "not-allowed";
                    break;
                case 21:
                    cursor = "cell";
                    break;
                case 22:
                    cursor = "help";
                    break;
                case 23:
                    cursor = "copy";
                    break;
                case 24:
                    cursor = "alias";
                    break;
                case 25:
                    cursor = "move";
                    break;
                case 26:
                    cursor = "no-drop";
                    break;
                case 27:
                    cursor = "help";
                    break;
            }
            if (this.env) {
                this.env.canvas().style.cursor = cursor;
            }
            else {
                console.log(["Apply cursor", cursor]);
            }
        };
        this.complete = (utils, exports) => {
            this.SKIP_FWK_update = (wId) => {
                if (this.env) {
                    this.env.update();
                }
                else {
                    console.log("Update");
                }
            };
        };
        this.env = env;
    }
}
class Manager {
    constructor(env) {
        this.prepare = (wasm) => {
            let toWasm = wasm;
            let links = new LinksImpl(this.env);
            toWasm.SKIP_FWK_applyCursor = (wId, code) => links.SKIP_FWK_applyCursor(wId, code);
            toWasm.SKIP_FWK_update = (wId) => links.SKIP_FWK_update(wId);
            return links;
        };
        this.env = env;
    }
}
/** @sk init */
export function init(env) {
    return Promise.resolve(new Manager(env ? env : undefined));
}
