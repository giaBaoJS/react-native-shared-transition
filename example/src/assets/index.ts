/**
 * Example assets - Hero characters from One Punch Man
 * 🦸 S-Class Heroes Showcase
 */

import type { Hero } from '../types';

export const Heroes: Hero[] = [
  {
    id: 'saitama',
    name: 'Saitama',
    photo: require('./onepunch.jpg'),
    quote: 'Just an average guy who serves as an average hero',
    description:
      'Saitama is the main protagonist of One Punch Man. Although he looks unimpressive, he has the power to defeat any enemy with a single punch. Despite his overwhelming strength, he suffers from a self-imposed existential crisis, as he no longer feels the thrill of battle.',
    rank: 0,
    class: 'B',
  },
  {
    id: 'garou',
    name: 'Garou',
    photo: require('./garou.png'),
    quote: "The popular will win, the hated will lose, it's such a tragedy.",
    description:
      'Garou is a villain, self-proclaimed "Hero Hunter" and a former disciple of Bang. He is obsessed with the concept of absolute evil and seeks to become a monster. His martial arts prowess makes him one of the most dangerous threats.',
    rank: 0,
    class: 'S',
  },
  {
    id: 'genos',
    name: 'Genos',
    photo: require('./genos.jpg'),
    quote: 'Demon Cyborg',
    description:
      'Genos is the deuteragonist of One Punch Man. He is a 19-year-old cyborg and the disciple of Saitama. His goal is to one day surpass his master and find the cyborg who destroyed his hometown.',
    rank: 14,
    class: 'S',
  },
  {
    id: 'silverfang',
    name: 'Silverfang',
    photo: require('./silverfang.png'),
    quote: 'You do not need to know who the victor is within a battle using martial arts',
    description:
      'Bang, also known by his hero alias Silverfang, is a professional hero, a martial arts master, and the creator of Water Stream Rock Smashing Fist. He is the 3rd ranked S-Class hero.',
    rank: 3,
    class: 'S',
  },
  {
    id: 'tatsumaki',
    name: 'Tatsumaki',
    photo: require('./tatsumaki.png'),
    quote: 'To survive in this world... All you can do is get stronger',
    description:
      'Tatsumaki is the S-Class Rank 2 professional hero of the Hero Association. She is recognized as one of the most powerful heroes and is the older sister of Fubuki.',
    rank: 2,
    class: 'S',
  },
  {
    id: 'king',
    name: 'King',
    photo: require('./king.jpg'),
    quote: 'The Strongest Man on Earth',
    description:
      'King is the S-Class Rank 7 professional hero. In public, he is known as "The Strongest Man on Earth". In truth, he is just an ordinary person who accidentally gets credit for Saitama\'s victories.',
    rank: 7,
    class: 'S',
  },
  {
    id: 'metalknight',
    name: 'Metal Knight',
    photo: require('./metalknight.jpg'),
    quote: 'Dr. Bofoi',
    description:
      'Bofoi, also known by his hero alias Metal Knight, is the S-Class Rank 6 professional hero. He primarily operates through the use of powerful combat robots that he controls from a remote location.',
    rank: 6,
    class: 'S',
  },
  {
    id: 'atomicsamurai',
    name: 'Atomic Samurai',
    photo: require('./atomicsamurai.jpg'),
    quote: 'Master Swordsman',
    description:
      'Kamikaze, better known by his hero alias Atomic Samurai, is the S-Class Rank 4 professional hero. He is a master swordsman and mentor to Iaian, Bushidrill, and Okamaitachi.',
    rank: 4,
    class: 'S',
  },
];

export default Heroes;
