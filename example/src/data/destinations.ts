/**
 * Gallery content.
 *
 * The titles and copy are editorial writing for the demo — they describe what is
 * visible in each frame and are deliberately not claims about where a given
 * photograph was taken. Photo provenance and licensing live in
 * `src/assets/CREDITS.md`.
 */

import type { Destination } from '../types';

export const destinations: Destination[] = [
  {
    id: 'cloudridge',
    title: 'Above the Inversion',
    region: 'Alpine ridgeline',
    hour: 'Dawn',
    tagline: 'The valley disappears and the peaks become islands.',
    swatch: '#E2A0A6',
    photo: require('../assets/cloudridge.jpg'),
    body: [
      'A temperature inversion traps cold air in the valley overnight and fills it, edge to edge, with cloud. From below it is a grey morning with no view at all. Four hundred metres higher it is the clearest day of the year.',
      'The trick is being on the ridge before the sun clears the far summits. For about twenty minutes the cloud takes the colour of the sky and the whole basin glows, and then the light goes flat and ordinary and it is simply a nice morning in the mountains.',
    ],
  },
  {
    id: 'altairlake',
    title: 'Still Water',
    region: 'Glacier lake',
    hour: 'Late morning',
    tagline: 'Meltwater so clear the boats look like they are hovering.',
    swatch: '#2FA8A0',
    photo: require('../assets/altairlake.jpg'),
    body: [
      'The colour is not a filter. Glacial meltwater carries rock flour — sediment ground so fine it stays suspended instead of settling — and that suspension scatters the blue-green end of the spectrum straight back out of the water.',
      'It is coldest and clearest in early summer, before runoff peaks. Later in the season the same lake turns a flatter, milkier turquoise as the load of sediment increases.',
    ],
  },
  {
    id: 'fernfalls',
    title: 'The Long Drop',
    region: 'Temperate rainforest',
    hour: 'Midday',
    tagline: 'A footbridge, and a lot of falling water.',
    swatch: '#4E8B45',
    photo: require('../assets/fernfalls.jpg'),
    body: [
      'Temperate rainforest is the rarer kind of rainforest — cool, wet year round, and dense enough that the canopy stays saturated even on a clear day. The permanent spray around a fall like this builds its own microclimate on the rock face.',
      'Midday is usually the worst light for a forest, but a deep gorge is the exception: it is the only hour the sun reaches the bottom, and the fall lights up for a few minutes while everything around it stays in shade.',
    ],
  },
  {
    id: 'mistvalley',
    title: 'Valley Fog',
    region: 'River basin',
    hour: 'First light',
    tagline: 'Granite walls resolving out of the haze.',
    swatch: '#8FA9B8',
    photo: require('../assets/mistvalley.jpg'),
    body: [
      'Radiation fog forms on still, clear nights when the ground gives up its heat and the air just above it cools past its dew point. It pools in the low ground and burns off from the edges inward once the sun is properly up.',
      'It is the one condition that makes a wide valley read as layered rather than flat — each ridge slightly paler than the one in front of it, which is depth you cannot manufacture on a clear morning.',
    ],
  },
  {
    id: 'starfield',
    title: 'Under the Milky Way',
    region: 'Snow ridge',
    hour: 'Astronomical night',
    tagline: 'The galactic core, and one very well-timed meteor.',
    swatch: '#5B62B5',
    photo: require('../assets/starfield.jpg'),
    body: [
      'What is visible here is the core of our own galaxy, seen edge-on from inside one of its outer arms. The dark lanes running through it are not gaps but dust clouds, dense enough to block the light of everything behind them.',
      'It needs three things at once: no moon, no nearby town, and enough altitude to be above the haze. Snow helps more than you would expect — it returns just enough starlight to keep the foreground from going completely black.',
    ],
  },
  {
    id: 'emberlake',
    title: 'Ember Peaks',
    region: 'Glacial basin',
    hour: 'Sunrise',
    tagline: 'Ten minutes of orange, then it is over.',
    swatch: '#D9793C',
    photo: require('../assets/emberlake.jpg'),
    body: [
      'The first direct sun of the day hits the highest rock while the basin floor is still in shadow. Because the light is travelling through so much atmosphere at that angle, the blue is scattered out of it long before it arrives and only the warm end survives.',
      'The lake does the rest. Still water at dawn is close to a perfect mirror, and it doubles the only part of the scene that is lit.',
    ],
  },
  {
    id: 'goldenmoor',
    title: 'Golden Moor',
    region: 'Highland moor',
    hour: 'Sunset',
    tagline: 'Low light raking across an impossibly green hillside.',
    swatch: '#8FAF3A',
    photo: require('../assets/goldenmoor.jpg'),
    body: [
      'Moorland reads as a single flat green under midday sun. At the very end of the day the light arrives almost horizontally, and every hummock and cut in the ground throws a shadow long enough to see.',
      'That raking angle is what makes the texture legible — the same hillside photographed three hours earlier looks like a lawn.',
    ],
  },
  {
    id: 'tallpines',
    title: 'Cathedral Pines',
    region: 'Old-growth forest',
    hour: 'Afternoon',
    tagline: 'Straight trunks, high canopy, and a path through it.',
    swatch: '#3E6B4A',
    photo: require('../assets/tallpines.jpg'),
    body: [
      'An old stand self-thins: the trees that lose the race for light die out, and the survivors put everything into height. What is left is a high closed canopy and a floor open enough to walk through, which is why old-growth forest feels architectural in a way young woodland does not.',
      'Overcast afternoons are the good ones. Direct sun through a canopy blows out into hard white patches and loses the trunks entirely.',
    ],
  },
  {
    id: 'duskcoast',
    title: 'Slow Tide',
    region: 'Rocky coast',
    hour: 'Dusk',
    tagline: 'A thirty-second exposure turns surf into smoke.',
    swatch: '#7C7195',
    photo: require('../assets/duskcoast.jpg'),
    body: [
      'Hold the shutter open long enough and moving water stops being a collection of individual waves and becomes a single soft field. Everything that stayed put — rock, headland, horizon — stays sharp, which is what sells the effect.',
      'Dusk is when it becomes possible without filters. There is still colour in the sky but little enough light that a long exposure is the correct one rather than a trick.',
    ],
  },
];

export function getDestination(id: string): Destination | undefined {
  return destinations.find((d) => d.id === id);
}
