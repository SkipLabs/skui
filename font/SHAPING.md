# Text shaping in skui: design proposal

Status: proposal, nothing implemented yet. This document describes how to add
OpenType shaping (GSUB substitutions, full GPOS positioning) to `font/`,
incrementally, and how to fit it into the reactive (SKStore) text pipeline of
`framework/`.

## 1. Goals and non-goals

Goals:

- Ligatures and contextual forms for Latin text (`liga`, `clig`, `calt`,
  `ccmp`), and correct mark (accent) positioning (`mark`, `mkmk`).
- A shaping API that works on runs of text and returns positioned glyphs,
  each linked to the characters it comes from.
- An implementation built in independent steps, each one usable on its own.
- Incremental recomputation: editing one word only reshapes that word.

Non-goals for the first steps:

- Complex scripts (Arabic joining, Indic reordering, Thai/Khmer, Hangul
  composition) and the Unicode bidirectional algorithm. The design leaves room
  for them (section 6) but they come last.
- Vertical text, justification alternates, OpenType variations of GSUB/GPOS
  (FeatureVariations), AAT `morx`/`kerx`.

## 2. What exists today

### 2.1 In `font/`

- `TrueType.Font` parses the tables, `TrueType.Face` loads and draws glyphs.
- `Gpos.sk` reads the GPOS `FeatureList` and `LookupList`, follows
  extension lookups, and reads Coverage and ClassDef tables, but only for
  pair adjustment (type 2) lookups of the `kern` feature, regardless of
  script and language.
- `Font.Face.getKern(previous: Char, next: Glyph)` returns the kerning
  between two adjacent glyphs. Everything else is one character, one glyph.

### 2.2 In `framework/`: the reactive text pipeline

The pipeline is a chain of lazy SKStore handles (`SKStore.LHandle`). Each
handle caches its results by key and is recomputed only when one of the
values it read changes.

```
TypefaceInfo ──► fonts/ttfs/typefaces/   TrueType.File (parsed Font)
                     │
FaceID ─────────► fonts/ttfs/faces/      Font.TypeFace (Face at a size, dpi, hinting)
                     │
GlyphID ────────► fonts/ttfs/glyphs/     Font.GlyphFile (one glyph: path, bounds, advance)
(FaceID, Char)       │
                     ├──────────────► fonts/ttfs/msdf/       Font.Msdf (glyph texture)
                     │
FacedText ──────► /ui/utils/text/words/  Ui.Word (advance + kern per char)
(String, FaceID)  /ui/utils/text/sizes/  Geometry.Size
                     │
TextKey ────────► /ui/utils/text/glyphs/    Ui.Line (positioned glyphs)
(String, Display) /ui/utils/text/drawables/ Ui.Drawables
```

Code: `framework/src/font/TrueType.sk` (font, face, glyph, MSDF suppliers),
`framework/src/widgets/TextSupport.sk` (words, sizes, glyphs, drawables),
`framework/src/text/LineWrapper.sk` and `Reducer.sk` (line breaking and
ellipsis), `framework/src/BaseTypes.sk` (`FontSupport`).

The key assumption everywhere is **one character = one glyph**:

- `GlyphID` is keyed by `Char`.
- Kerning is computed from the previous character (`getKern(previous, ...)`).
- `Word.widths`, `LineWrapper` groups, `Reducer`, cursor and selection code
  index widths by character.

Shaping breaks this assumption: "ffi" can become one glyph, "é" can be "e"
plus a positioned combining accent, and a glyph's advance depends on its
neighbours.

## 3. What all shaping features share

GSUB and GPOS use the same "OpenType Layout" structure. Only the last step of
each lookup type differs. Most of the work is therefore shared, and part of it
already exists in `Gpos.sk`.

| Component | Used by | Exists |
|---|---|---|
| ScriptList, LangSys: select features for a script and language | GSUB, GPOS | no |
| FeatureList, LookupList, extension lookups | GSUB, GPOS | yes (GPOS, kern only) |
| Coverage, ClassDef | GSUB, GPOS, GDEF | yes |
| GDEF glyph classes, mark attachment classes, mark filtering sets | lookup flags | no |
| LookupFlag: skip marks, ligatures or base glyphs while matching | GSUB, GPOS | no |
| Sequence and chained context matching (GSUB 5/6, GPOS 7/8) | GSUB, GPOS | no |
| Glyph buffer with clusters | everything | no |

Lookup types, by what they need on top of the shared parts:

| Lookup | Effect | Typical feature |
|---|---|---|
| GSUB 1 single | 1 glyph → 1 glyph | `smcp`, Arabic forms |
| GSUB 2 multiple | 1 → n | `ccmp` decomposition |
| GSUB 3 alternate | 1 → 1 of n | `salt`, `aalt` |
| GSUB 4 ligature | n → 1 | `liga`, `clig` |
| GSUB 5/6 context | apply nested lookups in a context | `calt` |
| GSUB 8 reverse chaining | 1 → 1, right to left | Urdu Nastaliq |
| GPOS 1/2 single, pair | adjust placement/advance | `kern` |
| GPOS 3 cursive | join exit and entry anchors | Arabic, Urdu |
| GPOS 4/5/6 mark-to-base, -ligature, -mark | anchor marks | `mark`, `mkmk` |
| GPOS 7/8 context | nested positioning in a context | `kern`, `mark` |

Latin ligatures only need GSUB 4. Arabic needs GSUB 1 plus a script-specific
joining analysis (section 6). The script-specific logic, not GSUB itself, is
what makes complex scripts expensive.

## 4. Shaping engine design (`font/`)

### 4.1 Module layout

```
font/src/layout/
  Layout.sk      Script/LangSys/Feature/Lookup lists, Coverage, ClassDef,
                 GDEF, LookupFlag, context matching (moved from Gpos.sk)
  Buffer.sk      GlyphBuffer
  Gsub.sk        GSUB lookup application
  Gpos.sk        GPOS lookup application (kerning moves here)
  Shaper.sk      shape(): plan + run GSUB then GPOS
  Script.sk      script detection, default features, script-specific hooks
```

### 4.2 The glyph buffer

```
class ShapedGlyph(
  glyph: Int,         // glyph index
  cluster: Int,       // index of the first source character
  advance: Int,       // in font units, x advance (y for vertical, later)
  xOffset: Int,       // placement offsets, in font units
  yOffset: Int,
  // internal: GDEF class, ligature id/component (for marks), masks
)
```

- A buffer starts as one glyph per character (via cmap), with
  `cluster = character index`.
- Substitutions merge clusters (a ligature takes the smallest cluster of its
  components) or duplicate them (a 1 → n substitution gives every new glyph
  the same cluster).
- Clusters are monotonic for left-to-right text. They are what lets callers
  map between characters and glyphs (cursor positions, selection, hit
  testing, line breaking).

### 4.3 Shaping plan

Selecting lookups is independent of the text. It depends only on the font,
the script, the language and the requested features, so it is computed once
and cached:

```
class ShapePlan(
  gsubLookups: Array<(lookupIndex, featureMask)>,
  gposLookups: Array<(lookupIndex, featureMask)>,
)

fun plan(font: Font, script: Tag, language: Tag, features: Array<Feature>): ShapePlan
```

Default features for horizontal Latin text: `ccmp`, `locl`, `rlig`, `liga`,
`clig`, `calt` (GSUB), then `kern`, `mark`, `mkmk` (GPOS). Users can turn
features on or off (e.g. disable `liga` in a code editor, enable `tnum`).

### 4.4 API

```
fun shape(
  face: Face,
  text: Array<Char>,   // one run: same face, script, direction
  plan: ShapePlan,
): Array<ShapedGlyph>
```

`Face` scales the advances and offsets to pixels as it already does for
`getKern` and `getGlyphAdvance`. Fonts without GSUB/GPOS fall back to one
glyph per character, with legacy `kern` table kerning: the result is the
same as today.

## 5. Reactive pipeline (`framework/`)

### 5.1 Principle

Shaping becomes one more lazy handle between faces and glyph layout. Keys are
chosen so that unrelated changes do not invalidate shaped text:

```
FaceID + script + features ──► /fonts/shaping/plans/   ShapePlan
                                    │
ShapeKey ──────────────────────► /fonts/shaping/runs/  ShapedRun
(run text, FaceID, script,          │                  (glyphs, clusters,
 direction, features)               │                   advances, offsets)
                                    ▼
GlyphID (FaceID, glyph index) ─► fonts/ttfs/glyphs/    GlyphFile (path, bounds)
                                    │
                                    └──► fonts/ttfs/msdf/  Msdf
                                    │
                                    ▼
                   /ui/utils/text/words/, sizes/, glyphs/, drawables/
                   (built from ShapedRun instead of per-char lookups)
```

### 5.2 Granularity: what a run is

Shaping must see whole words (a ligature or a kerning pair cannot cross a run
boundary), but runs should be as small as possible so edits invalidate little.

A shaping run is a maximal sequence of characters with the same face, script
and direction, **split at spaces**. Spaces are where kerning across words
does not matter in practice and where no common ligature applies. This
matches the existing `/ui/utils/text/words/` cache, which is already keyed by
word and face.

Consequences:

- Typing in a paragraph reshapes only the edited word: the other `ShapeKey`s
  are unchanged, so SKStore reuses their cached `ShapedRun`.
- Changing the font size changes `FaceID`, so every run is reshaped, as today.
- Changing a feature setting (e.g. turning off ligatures) changes
  `ShapeKey.features` and the plan; runs are reshaped, glyph outlines and
  MSDF textures are reused as long as glyph indices are unchanged.

Known limit: a few fonts have kerning or contextual rules across spaces
(e.g. `calt` around space in some script fonts). They are ignored by design;
a per-paragraph mode could be added later if needed.

### 5.3 Glyph identity

`GlyphID` must identify a glyph by **glyph index**, not by character, since
ligatures and alternates have no character of their own:

```
class GlyphID(fid: FaceID, glyph: Int, pxRange: Int = 8)
```

`GlyphFile` and `Msdf` handles stay the same, keyed by this new id. A
`(FaceID, Char) → glyph index` mapping is still needed for code that asks for
a single character (icons, monospace measurement); it is the cmap lookup and
needs no cache.

### 5.4 What changes for layout and editing

| Consumer | Today | With shaping |
|---|---|---|
| `TextSupport` words/sizes | sum of per-char advance + kern | sum of `ShapedRun` advances |
| `TextSupport` glyphs/drawables | one glyph per char, kern from previous char | one drawable per shaped glyph, at advance + offsets |
| `LineWrapper`, `Reducer` | break between any chars, widths per char | break between runs or between clusters; widths per cluster |
| Cursor, selection, hit testing | char index ↔ x by summing widths | cluster boundaries; positions inside a ligature are interpolated (split the ligature advance evenly between its characters, as browsers do) |
| Monospace editor | one glyph per char | disable `liga`/`calt` by default; shaping still places marks |

The per-cluster widths can be derived from a `ShapedRun`, so
`Word.widths` can keep its shape (one width per character): each character of
a cluster gets an equal share of the cluster width. This keeps most of
`LineWrapper`, `Reducer` and the editing code unchanged in the first steps.

### 5.5 Invalidation summary

| Change | Recomputed | Reused |
|---|---|---|
| One word edited | that word's `ShapedRun`, its line layout | every other run, all glyph outlines and MSDF |
| Font size / dpi / hinting | plans, all runs, glyph outlines, MSDF | parsed font |
| Feature toggled | plan, runs | outlines and MSDF of unchanged glyph indices |
| Font loaded later | everything for that face | other faces |
| Color only | drawables | runs, outlines, MSDF |

## 6. Script-specific shaping (later)

These plug into `Shaper.sk` as hooks run before or between the GSUB stages,
without changing the shared layout code:

- **Arabic, Syriac, N'Ko, Mongolian:** joining analysis assigns `init`,
  `medi`, `fina`, `isol` per character from Unicode joining types; GSUB then
  applies those features. GPOS cursive attachment joins the glyphs.
- **Bidirectional text:** the Unicode bidirectional algorithm splits a
  paragraph into directional runs before shaping; runs are shaped in logical
  order and reordered for display. Cursor movement has to follow logical
  order.
- **Indic scripts:** syllable segmentation, reordering of pre-base vowels and
  reph, then a specific feature order (`nukt`, `akhn`, `rphf`, `blwf`, ...).
- **Thai, Khmer, Myanmar, Hangul, ...:** their own shapers.

Each needs Unicode data (joining types, script, bidi classes, Indic
categories) as generated tables.

## 7. Incremental implementation steps

Each step keeps all existing tests passing and is usable on its own.

1. **Extract the shared layout code.** Move Coverage, ClassDef, the
   Feature/Lookup lists and extension handling out of `Gpos.sk` into
   `layout/Layout.sk`; add ScriptList/LangSys selection, GDEF and LookupFlag.
   Pure refactoring: the GPOS kerning tests must not change.
2. **Glyph buffer and `shape()`, positioning only.** One glyph per
   character, GPOS kerning applied through the plan. Same output as today for
   kerning, checked against the existing kerning tests.
3. **Framework integration with shaped runs.** `ShapeKey`/`ShapedRun`
   handles, `GlyphID` by glyph index, `TextSupport` built from runs,
   per-character widths derived from clusters. Visible behaviour is
   unchanged; this is the largest step.
4. **GSUB 1, 2, 4, 7** with `ccmp`, `locl`, `liga`, `clig`. Latin ligatures
   appear; cursor positions inside ligatures are interpolated.
5. **Context lookups (GSUB 5/6, GPOS 7/8) and marks (GPOS 4/5/6)**:
   `calt`, correct accent placement.
6. **Script-specific shaping**, starting with Arabic and bidi if needed.

## 8. Testing

- Every lookup type gets a hand-built font in the tests, as for CFF, variable
  and COLR fonts, with expected glyph sequences derived independently.
- Real fonts: Liberation Sans (already a test resource) has GSUB (`liga`
  for "fi"/"fl" depends on the version, `ccmp`) and GPOS (`kern`, `mark`).
- Reference output: shaping results can be compared with HarfBuzz
  (`hb-shape --show-flags --cluster-level=1 font.ttf text`) when it is
  available, glyph by glyph, cluster by cluster.
- Framework: layout snapshots of a few strings before and after step 3 must
  be identical (no visible change before ligatures are enabled).

## 9. Open questions

- Should ligatures be enabled by default in editable text fields? Browsers do;
  code editors usually do not.
- Is splitting runs at spaces acceptable for all target fonts, or is a
  per-paragraph mode needed from the start?
- Where should feature settings live in the style model (`Text.Display`,
  `FaceID`, or a separate key)? They must be part of `ShapeKey` but not of
  the glyph outline keys.
