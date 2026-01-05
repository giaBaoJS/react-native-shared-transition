/**
 * Example assets - Hero characters from One Punch Man
 */

import type { Hero } from '../types';

export const Heroes: Hero[] = [
  {
    id: 'saitama',
    name: 'Saitama',
    photo: require('./onepunch.jpg'),
    quote: 'Just an average guy who serves as an average hero',
    description:
      'Saitama is usually deliberately drawn in a simpler style than all the other characters, with an elliptical-shaped head and only a basic mouth and eyes. When drawn in a more serious style with more detail, Saitama is revealed to have sharp features, fearsome eyes, and chiseled musculature.',
  },
  {
    id: 'garou',
    name: 'Garou',
    photo: require('./garou.png'),
    quote: 'The popular will win, the hated will lose, it\'s such a tragedy.',
    description:
      'Garou is a young man with sharp features, yellow eyes, and long silver hair that spikes upwards in two large prongs, giving a feeling of a young wolf. While not being a particularly large person, he is shown to be quite muscular.',
  },
  {
    id: 'genos',
    name: 'Genos',
    photo: require('./genos.jpg'),
    quote: 'Demon Cyborg',
    description:
      'Genos is an extremely serious character. He constantly strives to become stronger and pesters Saitama to train him frequently. Since becoming Saitama\'s disciple, Genos is very reverent and protective towards his "teacher".',
  },
  {
    id: 'silverfang',
    name: 'Silverfang',
    photo: require('./silverfang.png'),
    quote: 'You do not need to know who the victor is within a battle using martial arts',
    description:
      'Bang has a serious personality. His normal demeanor is very calm, shown when he is seemingly unafraid of the dragon-level meteor falling on Z-City.',
  },
  {
    id: 'tatsumaki',
    name: 'Tatsumaki',
    photo: require('./tatsumaki.png'),
    quote: 'To survive in this world... All you can do is get stronger',
    description:
      'Tatsumaki has a rather brash, moody, hotheaded and impatient personality. She is disrespectful towards most people, especially to those she deems incompetent.',
  },
  {
    id: 'king',
    name: 'King',
    photo: require('./king.jpg'),
    quote: 'The Strongest Man on Earth',
    description:
      'King is an S-Class hero ranked 7th by the Hero Association. In public, King is known as "The Strongest Man on Earth".',
  },
  {
    id: 'metalknight',
    name: 'Metal Knight',
    photo: require('./metalknight.jpg'),
    quote: 'Dr. Bofoi',
    description:
      'Bofoi has white hair and a large nose. He is also seen wearing a lab coat over his blue shirt. Bofoi acts mainly through the use of his robots controlled from a safe distance.',
  },
  {
    id: 'atomicsamurai',
    name: 'Atomic Samurai',
    photo: require('./atomicsamurai.jpg'),
    quote: 'Master Swordsman',
    description:
      'Atomic Samurai has long black hair tied in a ponytail and a defined jawline. He sports a traditional Japanese style of clothing.',
  },
];

export default Heroes;
