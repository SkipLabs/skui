
## Split items positioning and draw to avoid unecesary recompute

- Remove offset drawable 
- Manage depth with opengl

## Visual check of the shared glyph MSDFs (commit 965d88a)

Glyph MSDFs are now generated once at `Font.msdfSize` (45) and scaled to
the drawn size, placed from the glyph origin on the baseline instead of the
integer top left of the glyph image. Only checked by tests
(`mtsdf/tests/Placement.sk`): the rendering has not been looked at yet.

- Baseline: lowercase letters (`aeoxnsu`) share the same baseline at small
  sizes (11, 13, 14, 17 px) and with a device pixel ratio other than 1.
- Sharpness at small sizes: glyphs are now placed at sub-pixel positions.
  If text looks blurry, round the baseline of each line (not each glyph)
  to an integer pixel.
- Thickness compensation (`thickness` in `framework/src/BaseTypes.sk`,
  below 20 px): it was tuned with per-size MSDFs, check regular and bold
  text weights.
- Font icons (`FontIcon`): they also share one MSDF now. Check that icons
  are placed and sized as before, at two different sizes. This assumes the
  offset/size box given to `FontIcon.fillDrawables` has the top left of the
  icon image as its corner.
- Hinted faces (`FaceID.hinting` other than `HintingNone`) keep one MSDF
  per device size: check that they are unchanged.
- Performance: glyph MSDFs should be generated once per character instead
  of once per size and zoom level.
