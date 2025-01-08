import type { T, Vector, Array as IArray } from "@skiplang/std/internal.js";
export type * from "@skiplang/std/internal.js";

declare const _Range: unique symbol;
export type Range = T<typeof _Range>;

export type RangesVector = Vector<IArray<Range>>;
export type RangesArray = IArray<IArray<Range>>;
