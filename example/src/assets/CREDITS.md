# Image credits

Every photograph in this folder comes from [Unsplash](https://unsplash.com) and is
covered by the [Unsplash License](https://unsplash.com/license):

> Unsplash grants you an irrevocable, nonexclusive, worldwide copyright license to
> download, copy, modify, distribute, perform, and use photos from Unsplash for free,
> including for commercial purposes, without permission from or attributing the
> photographer or Unsplash.

Attribution is **not required** by that license — the table below is provided as a
courtesy so the provenance of every file is auditable.

All files were fetched from the `images.unsplash.com/photo-*` path, which serves the
free Unsplash-License catalogue. None of them are Unsplash+ / premium assets (those are
served from `premium_photo-*` and carry a different, more restrictive licence).

## Files

Each image was requested at 1200x800 (`fit=crop&crop=entropy`) and encoded in a single
imgix pass at the per-image quality noted below, to stay under a 200 KB budget.

| File | Scene | Source URL | Quality | Size |
| --- | --- | --- | --- | --- |
| `cloudridge.jpg` | Alpine ridgeline above a cloud inversion at dawn | https://images.unsplash.com/photo-1506905925346-21bda4d32df4 | q=85 | 142 KB |
| `altairlake.jpg` | Rowing boat on a turquoise glacier lake | https://images.unsplash.com/photo-1501785888041-af3ef285b470 | q=50 | 168 KB |
| `fernfalls.jpg` | Waterfall and footbridge in temperate rainforest | https://images.unsplash.com/photo-1433086966358-54859d0ed716 | q=40 | 193 KB |
| `mistvalley.jpg` | River basin under valley fog at first light | https://images.unsplash.com/photo-1506744038136-46273834b3fb | q=85 | 172 KB |
| `starfield.jpg` | Milky Way over a snow-covered ridge | https://images.unsplash.com/photo-1519681393784-d120267933ba | q=80 | 186 KB |
| `emberlake.jpg` | Glacial basin lit orange at sunrise | https://images.unsplash.com/photo-1493246507139-91e8fad9978e | q=85 | 178 KB |
| `goldenmoor.jpg` | Highland moor at sunset | https://images.unsplash.com/photo-1472214103451-9374bd1c798e | q=45 | 178 KB |
| `tallpines.jpg` | Path through an old-growth pine forest | https://images.unsplash.com/photo-1441974231531-c6227db76b6e | q=45 | 182 KB |
| `duskcoast.jpg` | Long exposure of a rocky coast at dusk | https://images.unsplash.com/photo-1475924156734-496f6cac6ec1 | q=85 | 122 KB |

## Note on photographer names

Unsplash's public API requires an access key, so the individual photographers could not
be resolved programmatically when these files were fetched. The canonical source URL for
each file is recorded above and is sufficient to identify the original photograph. If you
would like a photographer credited by name here, open an issue and it will be added.

## The titles in the app are not geographic claims

The destination names and locations rendered in the example app (`src/data/destinations.ts`)
are evocative editorial copy written for the demo. They describe what is visible in each
frame — they are deliberately not assertions about where a given photograph was taken.
