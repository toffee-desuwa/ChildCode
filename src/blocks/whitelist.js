/**
 * Whitelist block data
 * tier 1 = basic (8-10), tier 2 = expanded (10-12), tier 3 = advanced (12+)
 */

export const BLOCK_CATEGORIES = {
  // ── tier 1: core four categories (always available) ──
  subject: {
    label: 'Subject',
    tier: 1,
    required: true,
    options: [
      ['Cat', 'cat'],
      ['Dog', 'dog'],
      ['Robot', 'robot'],
      ['Girl', 'girl'],
      ['Boy', 'boy'],
      ['Dragon', 'dragon'],
      ['Rabbit', 'rabbit'],
      ['Astronaut', 'astronaut'],
    ],
  },
  action: {
    label: 'Action',
    tier: 1,
    required: true,
    options: [
      ['Running', 'running'],
      ['Flying', 'flying'],
      ['Painting', 'painting'],
      ['Dancing', 'dancing'],
      ['Sleeping', 'sleeping'],
      ['Eating', 'eating'],
      ['Playing Guitar', 'playing_guitar'],
    ],
  },
  scene: {
    label: 'Scene',
    tier: 1,
    required: true,
    options: [
      ['Forest', 'forest'],
      ['Space', 'space'],
      ['Underwater', 'underwater'],
      ['Castle', 'castle'],
      ['Desert', 'desert'],
      ['Snow Mountain', 'snow_mountain'],
      ['Candy Land', 'candy_land'],
    ],
  },
  style: {
    label: 'Style',
    tier: 1,
    required: true,
    options: [
      ['Watercolor', 'watercolor'],
      ['Pixel Art', 'pixel_art'],
      ['Oil Painting', 'oil_painting'],
      ['Cartoon', 'cartoon'],
      ['Crayon', 'crayon'],
      ['Paper Cut', 'paper_cut'],
    ],
  },
  // ── tier 2: expanded categories (unlocked at 10-12) ──
  emotion: {
    label: 'Emotion',
    tier: 2,
    required: false,
    options: [
      ['Happy', 'happy'],
      ['Sad', 'sad'],
      ['Surprised', 'surprised'],
      ['Scared', 'scared'],
      ['Angry', 'angry'],
      ['Curious', 'curious'],
    ],
  },
  weather: {
    label: 'Weather',
    tier: 2,
    required: false,
    options: [
      ['Sunny', 'sunny'],
      ['Rainy', 'rainy'],
      ['Snowy', 'snowy'],
      ['Stormy', 'stormy'],
      ['Rainbow', 'rainbow'],
      ['Foggy', 'foggy'],
    ],
  },
  // ── tier 3: advanced categories (unlocked at 12+) ──
  time: {
    label: 'Time',
    tier: 3,
    required: false,
    options: [
      ['Daytime', 'daytime'],
      ['Dusk', 'dusk'],
      ['Night', 'night'],
      ['Dawn', 'dawn'],
    ],
  },
}

/**
 * Age tier → max unlocked tier
 */
export const AGE_TIERS = {
  '8-10': { label: '8-10 (Basic)', maxTier: 1 },
  '10-12': { label: '10-12 (Expanded)', maxTier: 2 },
  '12+': { label: '12+ (Advanced)', maxTier: 3 },
}

export const DEFAULT_AGE_TIER = '8-10'

/**
 * Filter available block categories by age tier
 * @param {string} ageTier - '8-10' | '10-12' | '12+'
 * @returns {Object} filtered subset of BLOCK_CATEGORIES
 */
export function getBlocksByTier(ageTier) {
  const maxTier = AGE_TIERS[ageTier]?.maxTier ?? 1
  return Object.fromEntries(
    Object.entries(BLOCK_CATEGORIES).filter(([, cat]) => cat.tier <= maxTier)
  )
}

/**
 * Get list of required categories (always the tier 1 four)
 */
export function getRequiredCategories() {
  return Object.entries(BLOCK_CATEGORIES)
    .filter(([, cat]) => cat.required)
    .map(([type]) => type)
}

/**
 * Category label map, derived from BLOCK_CATEGORIES.
 * English labels — for localized display, use t('blocks.category.<type>') instead.
 */
export const CATEGORY_LABELS = Object.fromEntries(
  Object.entries(BLOCK_CATEGORIES).map(([type, cat]) => [type, cat.label])
)
