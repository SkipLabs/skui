
function Span (el)
  if el.attributes.style and string.find(el.attributes.style, "background%-color") then
    stylestr = el.attributes.style
    found = false
    rgb = {}
    for r, g, b in string.gmatch(stylestr, "background%-color:rgb%(([0-9]+), ([0-9]+), ([0-9]+)%)") do
      table.insert(rgb, r / 255)
      table.insert(rgb, g / 255)
      table.insert(rgb, b / 255)
      found = true
    end

    --print(thecolor)
    if (FORMAT:match 'latex' and found) then
      -- returns only span content
      return pandoc.RawInline('latex', '\\colorbox[rgb]{'..rgb[1]..', '..rgb[2]..', '..rgb[3]..'}{ }')
    else
      -- for other format return unchanged
      return el
    end
  else
    return el
  end
end