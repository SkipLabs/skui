import type { Pair, T, Vector, String } from "../skui-base/internal.js";
export type * from "../skui-base/internal.js";

declare const _JSON: unique symbol;
export type Json<Sub = any, Sub2 = any> = T<typeof _JSON> & {
  sub: Sub;
  sub2: Sub2;
};

declare const _JSNull: unique symbol;
export type JSNull = Json<typeof _JSNull>;

declare const _JSBool: unique symbol;
export type JSBool = Json<typeof _JSBool>;

declare const _JSInt: unique symbol;
export type JSInt = Json<typeof _JSInt>;

declare const _JSFloat: unique symbol;
export type JSFloat = Json<typeof _JSFloat>;

declare const _JSString: unique symbol;
export type JSString = Json<typeof _JSString>;

declare const _JSArray: unique symbol;
export type JSArray<Sub extends Json = Json> = Json<typeof _JSArray, Sub>;

declare const _JSObject: unique symbol;
export type JSObject = Json<typeof _JSObject>;

export type PartialJSObj = Vector<Pair<String, Json>>;
export type PartialJSArray<T extends Json> = Vector<T>;
