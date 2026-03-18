/**
 * 白名单积木数据
 * tier 1 = 基础（8-10 岁），tier 2 = 扩展（10-12 岁），tier 3 = 进阶（12+ 岁）
 */

export const BLOCK_CATEGORIES = {
  // ── tier 1：基础四类（始终可用）──
  subject: {
    label: '对象',
    tier: 1,
    required: true,
    options: [
      ['猫', 'cat'],
      ['狗', 'dog'],
      ['机器人', 'robot'],
      ['小女孩', 'girl'],
      ['小男孩', 'boy'],
      ['龙', 'dragon'],
      ['兔子', 'rabbit'],
      ['宇航员', 'astronaut'],
    ],
  },
  action: {
    label: '动作',
    tier: 1,
    required: true,
    options: [
      ['奔跑', 'running'],
      ['飞翔', 'flying'],
      ['画画', 'painting'],
      ['跳舞', 'dancing'],
      ['睡觉', 'sleeping'],
      ['吃东西', 'eating'],
      ['弹吉他', 'playing_guitar'],
    ],
  },
  scene: {
    label: '场景',
    tier: 1,
    required: true,
    options: [
      ['森林', 'forest'],
      ['太空', 'space'],
      ['海底', 'underwater'],
      ['城堡', 'castle'],
      ['沙漠', 'desert'],
      ['雪山', 'snow_mountain'],
      ['糖果王国', 'candy_land'],
    ],
  },
  style: {
    label: '风格',
    tier: 1,
    required: true,
    options: [
      ['水彩', 'watercolor'],
      ['像素风', 'pixel_art'],
      ['油画', 'oil_painting'],
      ['卡通', 'cartoon'],
      ['蜡笔画', 'crayon'],
      ['剪纸风', 'paper_cut'],
    ],
  },
  // ── tier 2：扩展类（10-12 岁解锁）──
  emotion: {
    label: '情绪',
    tier: 2,
    required: false,
    options: [
      ['开心', 'happy'],
      ['伤心', 'sad'],
      ['惊讶', 'surprised'],
      ['害怕', 'scared'],
      ['生气', 'angry'],
      ['好奇', 'curious'],
    ],
  },
  weather: {
    label: '天气',
    tier: 2,
    required: false,
    options: [
      ['晴天', 'sunny'],
      ['下雨', 'rainy'],
      ['下雪', 'snowy'],
      ['雷电', 'stormy'],
      ['彩虹', 'rainbow'],
      ['雾气', 'foggy'],
    ],
  },
  // ── tier 3：进阶类（12+ 岁解锁）──
  time: {
    label: '时间',
    tier: 3,
    required: false,
    options: [
      ['白天', 'daytime'],
      ['黄昏', 'dusk'],
      ['夜晚', 'night'],
      ['黎明', 'dawn'],
    ],
  },
}

/**
 * 年龄段 → 解锁的最高 tier
 */
export const AGE_TIERS = {
  '8-10': { label: '8-10 岁（基础）', maxTier: 1 },
  '10-12': { label: '10-12 岁（扩展）', maxTier: 2 },
  '12+': { label: '12 岁以上（进阶）', maxTier: 3 },
}

export const DEFAULT_AGE_TIER = '8-10'

/**
 * 按年龄段过滤可用积木类别
 * @param {string} ageTier - '8-10' | '10-12' | '12+'
 * @returns {Object} 过滤后的 BLOCK_CATEGORIES 子集
 */
export function getBlocksByTier(ageTier) {
  const maxTier = AGE_TIERS[ageTier]?.maxTier ?? 1
  return Object.fromEntries(
    Object.entries(BLOCK_CATEGORIES).filter(([, cat]) => cat.tier <= maxTier)
  )
}

/**
 * 获取必填类别列表（始终是 tier 1 的四类）
 */
export function getRequiredCategories() {
  return Object.entries(BLOCK_CATEGORIES)
    .filter(([, cat]) => cat.required)
    .map(([type]) => type)
}

/**
 * 类别中文标签映射，从 BLOCK_CATEGORIES 派生
 * 供 phaseGuide.js、WorkspacePage.jsx 等模块共用
 */
export const CATEGORY_LABELS = Object.fromEntries(
  Object.entries(BLOCK_CATEGORIES).map(([type, cat]) => [type, cat.label])
)
