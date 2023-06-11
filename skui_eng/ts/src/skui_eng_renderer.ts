import {int, ptr, Opt} from "#skui_base/skui_types";

interface Exported {
  SKIP_Eng_getValue: (path: Opt<ptr>, name: ptr) => ptr;
  SKIP_Eng_setValue: (path: Opt<ptr>, name: ptr, value: Opt<ptr>) => void;
  SKIP_Eng_create: (path: Opt<ptr>, value: Opt<ptr>) => ptr;
  SKIP_Eng_combine: (path: Opt<ptr>, combineHdl: int, writeHdl: int) => ptr;
  SKIP_Eng_alert:(text: ptr, title: Opt<ptr>) => void;
  SKIP_Eng_dialog:(dialog: ptr) => void;
}


