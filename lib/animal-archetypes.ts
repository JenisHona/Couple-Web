export interface AnimalData {
  id: string;
  name: string;
  emoji: string;
  category: 'Canines' | 'Cats' | 'Aquatic' | 'Giants & Cozy';
  looks: string;
  behavior: string;
  with_you: string;
}

export const animalLibrary: Record<string, AnimalData> = {
  // --- DOGS & CANINES ---
  golden_retriever: {
    id: 'golden_retriever',
    name: 'Golden Retriever',
    emoji: '🦮',
    category: 'Canines',
    looks: 'Big, expressive eyes, an instant smile, and hair that always looks effortlessly messy-cute.',
    behavior: 'Outgoing, easily excited, makes friends with strangers instantly, and radiates pure positive energy.',
    with_you: "Follows you from room to room, thrives on physical touch, and acts like you've been gone for years even if you just checked the mail.",
  },
  doberman: {
    id: 'doberman',
    name: 'Doberman',
    emoji: '🐕‍🦺',
    category: 'Canines',
    looks: 'A sharp jawline, athletic posture, striking features, and a powerful presence that commands a room.',
    behavior: 'Highly alert, intensely loyal, a natural protector, and takes life a bit more seriously.',
    with_you: 'Stays glued to your side, stands up for you no matter what, and drops their tough exterior completely just for your cuddles.',
  },
  puppy: {
    id: 'puppy',
    name: 'Playful Puppy',
    emoji: '🐶',
    category: 'Canines',
    looks: 'A youthful, adorable face, wide eyes, and an expression that makes it impossible to ever stay mad at them.',
    behavior: 'Easily distracted, clumsily enthusiastic, playful, and loves trying new hobbies every week.',
    with_you: 'Demands constant attention, pouts when you look at your phone, and wraps you around their little finger instantly.',
  },
  fox: {
    id: 'fox',
    name: 'Clever Fox',
    emoji: '🦊',
    category: 'Canines',
    looks: 'Sharp, highly attractive features, a slightly mischievous smirk, and an effortlessly sharp wardrobe.',
    behavior: 'Quick-witted, strategic, incredibly clever, and loves a good playful debate.',
    with_you: 'Keeps things exciting with unexpected date nights, buys brilliant gifts, and teases you just enough to keep you laughing.',
  },

  // --- CATS ---
  sassy_cat: {
    id: 'sassy_cat',
    name: 'Sassy Cat',
    emoji: '🐱',
    category: 'Cats',
    looks: 'Sleek, sharp eyes, impeccable styling, and a model-like elegance that turns heads.',
    behavior: 'Fiercely independent, values quiet personal space, and operates strictly on their own schedule.',
    with_you: 'Chooses highly specific, incredibly sweet moments to cuddle, and pretends to be unbothered while secretly being obsessed with you.',
  },
  lion: {
    id: 'lion',
    name: 'Majestic Lion',
    emoji: '🦁',
    category: 'Cats',
    looks: 'A magnificent mane of hair, an air of royalty, and a calm, confident physical presence.',
    behavior: 'Natural leader, fiercely ambitious, commanding, and treats their close circle like true royalty.',
    with_you: 'Deeply protective, treats you like a prize, and lets you completely call the shots when you are behind closed doors.',
  },

  // --- WATER & SEMI-AQUATIC ---
  otter: {
    id: 'otter',
    name: 'Sweet Otter',
    emoji: '🦦',
    category: 'Aquatic',
    looks: 'Soft, incredibly cozy features, looks great in oversized hoodies, and always looks warm and inviting.',
    behavior: 'Playful, collects random small trinkets, and is happiest when floating through a relaxed, stress-free day.',
    with_you: "Insists on holding hands at all times (especially while sleeping), and brings you little 'gifts' like snacks or chaotic memes.",
  },
  swan: {
    id: 'swan',
    name: 'Graceful Swan',
    emoji: '🦢',
    category: 'Aquatic',
    looks: 'Classic, timeless style, beautiful poise, put-together, and fiercely photogenic from every angle.',
    behavior: 'Calm and collected in public, deeply polite, highly protective of their peace, and hates unnecessary drama.',
    with_you: 'Intensely loyal for life, fiercely protective of your relationship, and reveals a deeply romantic, soft side reserved only for you.',
  },
  penguin: {
    id: 'penguin',
    name: 'Tidy Penguin',
    emoji: '🐧',
    category: 'Aquatic',
    looks: 'Always looks formally dressed, has a cute, distinct walk, and radiates clean, tidy vibes.',
    behavior: 'Extremely organized, loyal to their routine, and thrives in colder weather.',
    with_you: "Chooses you as their lifelong 'pebble', loves stealing food directly off your plate, and pairs up with you against the world.",
  },

  // --- LAND GIANTS & COZY ANIMALS ---
  elephant: {
    id: 'elephant',
    name: 'Gentle Elephant',
    emoji: '🐘',
    category: 'Giants & Cozy',
    looks: 'A tall or grounded, powerful physical presence, a comforting smile, and eyes that make you feel safe.',
    behavior: 'Wise, incredibly patient, handles chaos smoothly, and serves as a dependable rock.',
    with_you: 'Gives the absolute best, bone-crushing hugs, shields you from stress, and remembers every tiny promise they ever made to you.',
  },
  panda: {
    id: 'panda',
    name: 'Couch Panda',
    emoji: '🐼',
    category: 'Giants & Cozy',
    looks: 'Looks incredibly huggable, soft, loves being comfortable, and looks best in loungewear.',
    behavior: 'High sleep requirements, fueled entirely by snacks, and highly unbothered by outside drama.',
    with_you: 'The ultimate couch-cuddle partner, happiest just sharing a meal with you, and brings an instant sense of peace to your day.',
  },
  koala: {
    id: 'koala',
    name: 'Cuddle Koala',
    emoji: '🐨',
    category: 'Giants & Cozy',
    looks: 'Gentle eyes, a calm expression, and radiates a slow, relaxed, and non-threatening aesthetic.',
    behavior: 'Low-energy, deeply peaceful, avoids arguments at all costs, and loves a slow-paced lifestyle.',
    with_you: 'Physically latches onto you like a backpack, falls asleep on your shoulder instantly, and needs constant reassurance and warmth.',
  },
  sloth: {
    id: 'sloth',
    name: 'Chill Sloth',
    emoji: '🦥',
    category: 'Giants & Cozy',
    looks: 'Slow, heavy-lidded eyes, a permanent relaxed smile, and completely unhurried movements.',
    behavior: 'Moves at their own gentle pace, refuses to be rushed by life, and excels at sleeping in late.',
    with_you: 'Slows down your racing mind, loves spending entire rainy days in bed with you, and gives long, slow, comforting hugs.',
  },
  beaver: {
    id: 'beaver',
    name: 'Busy Beaver',
    emoji: '🦫',
    category: 'Giants & Cozy',
    looks: 'Practical, neat, looks ready to tackle a project, and usually has clean-cut, organized styling.',
    behavior: 'The ultimate planner. Always building something, organizing schedules, and fixing things around the house.',
    with_you: 'Shows love by taking care of chores, fixing things before you even ask, and building a perfectly secure life for the two of you.',
  },
};

export const animalOptions = Object.values(animalLibrary);

export function formatArchetypeSentence(
  looksKey?: string,
  behaviorKey?: string,
  withYouKey?: string,
  partnerName = 'My partner'
): string {
  const looks = animalLibrary[looksKey || '']?.name || '[Looks Animal]';
  const behavior = animalLibrary[behaviorKey || '']?.name || '[Behavior Animal]';
  const withYou = animalLibrary[withYouKey || '']?.name || '[With You Animal]';

  return `${partnerName} looks like a ${looks}, behaves like a ${behavior}, but when they are with me, they are a ${withYou}.`;
}
