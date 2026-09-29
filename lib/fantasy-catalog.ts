export interface FantasyItem {
  id: string;
  category: 'ambiance' | 'foreplay' | 'roleplay' | 'exploration' | 'sensory';
  title: string;
  emoji: string;
  tag: string;
  description: string;
  intensity: 'Soft & Romantic' | 'Spicy & Playful' | 'Wild & Adventurous';
}

export const fantasyCategories = [
  { id: 'all', label: 'All Fantasies', emoji: '✨' },
  { id: 'ambiance', label: 'Ambiance & Romance', emoji: '🕯️' },
  { id: 'foreplay', label: 'Teasing & Foreplay', emoji: '💋' },
  { id: 'sensory', label: 'Sensory & Touch', emoji: '🪶' },
  { id: 'roleplay', label: 'Roleplay & Scenarios', emoji: '🎭' },
  { id: 'exploration', label: 'Passionate Exploration', emoji: '🔥' },
];

export const fantasyCatalog: FantasyItem[] = [
  // Ambiance & Romance
  {
    id: 'candlelight_massage',
    category: 'ambiance',
    title: 'Candlelight & Warm Oil Massage',
    emoji: '🕯️',
    tag: 'Sensory Relaxation',
    description: 'A slow, full-body massage with heated lavender or coconut oil under soft candlelight and lo-fi beats.',
    intensity: 'Soft & Romantic',
  },
  {
    id: 'bath_shower_steam',
    category: 'ambiance',
    title: 'Warm Bubble Bath or Steamy Shower',
    emoji: '🛁',
    tag: 'Warm Water Romance',
    description: 'Sharing a soothing warm tub with bath bombs or a steamy shower washing each other with soft sponges.',
    intensity: 'Soft & Romantic',
  },
  {
    id: 'bedroom_picnic',
    category: 'ambiance',
    title: 'Late Night Bed Picnic & Sweets',
    emoji: '🍓',
    tag: 'Sweet Treats',
    description: 'Feeding each other strawberries, melted chocolate, whipped cream, or chilled champagne between the sheets.',
    intensity: 'Soft & Romantic',
  },
  {
    id: 'midnight_stargazing',
    category: 'ambiance',
    title: 'Midnight Car or Rooftop Rendezvous',
    emoji: '🌌',
    tag: 'Spontaneous Outdoor',
    description: 'Driving to a secluded viewpoint or rooftop with cozy blankets, fogged-up windows, and passionate making out.',
    intensity: 'Spicy & Playful',
  },

  // Teasing & Foreplay
  {
    id: 'slow_burn_teasing',
    category: 'foreplay',
    title: 'All-Day Flirty Teasing (No Touch Rule)',
    emoji: '⏳',
    tag: 'Anticipation',
    description: 'Sending spicy hints and whispered promises throughout the whole day, with a strict no-touching rule until midnight.',
    intensity: 'Spicy & Playful',
  },
  {
    id: 'whispered_confessions',
    category: 'foreplay',
    title: 'Whispered Desires & Pillow Talk',
    emoji: '🤫',
    tag: 'Deep Intimacy',
    description: 'Whispering your most secret unfiltered fantasies and sweet appreciations directly into each other’s ear in the dark.',
    intensity: 'Soft & Romantic',
  },
  {
    id: 'strip_game',
    category: 'foreplay',
    title: 'Couple Strip Game & Truth or Dare',
    emoji: '🎲',
    tag: 'Playful Stakes',
    description: 'Playing a custom cards, dice, or trivia game where losing a round means losing an article of clothing or doing a dare.',
    intensity: 'Spicy & Playful',
  },
  {
    id: 'morning_wake_up',
    category: 'foreplay',
    title: 'Slow Morning Wake-Up Lovin’',
    emoji: '🌅',
    tag: 'Gentle Awakening',
    description: 'Waking up slowly with soft kisses, warm entangled sheets, and lazy romantic intimacy before getting out of bed.',
    intensity: 'Soft & Romantic',
  },

  // Sensory & Touch
  {
    id: 'blindfold_sensory',
    category: 'sensory',
    title: 'Blindfold & Sensory Guessing Game',
    emoji: '🙈',
    tag: 'Heightened Senses',
    description: 'One partner wears a silk blindfold while the other heightens anticipation using feathers, ice, warm breaths, and kisses.',
    intensity: 'Spicy & Playful',
  },
  {
    id: 'feathers_ice',
    category: 'sensory',
    title: 'Temperature Play (Ice & Warm Breaths)',
    emoji: '🧊',
    tag: 'Sensory Shivers',
    description: 'Alternating between a slow melting ice cube and warm lingering kisses along the neck, back, and collarbones.',
    intensity: 'Spicy & Playful',
  },
  {
    id: 'silk_satin_ties',
    category: 'sensory',
    title: 'Soft Silk & Satin Restraints',
    emoji: '🎀',
    tag: 'Gentle Surrender',
    description: 'Lightly tying hands to the headboard or with a silk scarf for sweet, trusting surrender and total focus on touch.',
    intensity: 'Wild & Adventurous',
  },

  // Roleplay & Scenarios
  {
    id: 'strangers_at_bar',
    category: 'roleplay',
    title: 'Strangers Meeting at a Hotel Lounge',
    emoji: '🍸',
    tag: 'First Spark Rekindled',
    description: 'Arriving separately, ordering a drink, pretending you’ve never met before, flirting shamelessly, and "leaving together".',
    intensity: 'Spicy & Playful',
  },
  {
    id: 'power_switch',
    category: 'roleplay',
    title: 'Total Surrender / Command Night',
    emoji: '👑',
    tag: 'Power Dynamic',
    description: 'One partner takes 100% full charge of the bedroom dynamics while the other relaxes completely and obeys every gentle order.',
    intensity: 'Wild & Adventurous',
  },
  {
    id: 'costume_lingerie_show',
    category: 'roleplay',
    title: 'Private Runway & Lingerie Reveal',
    emoji: '💃',
    tag: 'Visual Seduction',
    description: 'A private dance or runway showcase in your favorite matching lingerie or confidence-boosting outfit.',
    intensity: 'Spicy & Playful',
  },

  // Passionate Exploration
  {
    id: 'mirror_play',
    category: 'exploration',
    title: 'Full-Length Mirror Intimacy',
    emoji: '🪞',
    tag: 'Visual Sensation',
    description: 'Making love in front of a floor-length mirror to watch each other’s expressions and movements in real-time.',
    intensity: 'Wild & Adventurous',
  },
  {
    id: 'slow_tantric_eye_contact',
    category: 'exploration',
    title: 'Tantric Connection & Deep Eye Gazing',
    emoji: '👁️',
    tag: 'Soulful Connection',
    description: 'Moving together at the slowest possible pace with synchronized breathing and unbroken eye contact for intense closeness.',
    intensity: 'Soft & Romantic',
  },
  {
    id: 'edging_anticipation',
    category: 'exploration',
    title: 'Pacing & Delayed Gratification',
    emoji: '⚡',
    tag: 'Building Waves',
    description: 'Building up the passion to the very edge, taking a break to kiss and catch breath, and repeating for maximum fireworks.',
    intensity: 'Wild & Adventurous',
  },
];
