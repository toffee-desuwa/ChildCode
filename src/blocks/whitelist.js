/**
 * v0 白名单积木数据
 * 与 docs/V0_SCHEMA_AND_FLOW.md 中的 Block Inventory 保持一致
 */

export const BLOCK_CATEGORIES = {
  subject: {
    label: '对象',
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
    options: [
      ['水彩', 'watercolor'],
      ['像素风', 'pixel_art'],
      ['油画', 'oil_painting'],
      ['卡通', 'cartoon'],
      ['蜡笔画', 'crayon'],
      ['剪纸风', 'paper_cut'],
    ],
  },
}
