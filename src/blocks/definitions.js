import * as Blockly from 'blockly'
import { BLOCK_CATEGORIES } from './whitelist'

/**
 * 注册所有白名单积木到 Blockly
 * 注册全部类别，可见性由 toolbox 控制
 */
export function registerBlocks() {
  for (const [type, category] of Object.entries(BLOCK_CATEGORIES)) {
    Blockly.Blocks[type] = {
      init() {
        this.appendDummyInput()
          .appendField(category.label)
          .appendField(
            new Blockly.FieldDropdown(category.options),
            'VALUE'
          )
        this.setOutput(false)
        this.setPreviousStatement(false)
        this.setNextStatement(false)
        this.setDeletable(true)
        this.setMovable(true)
      },
    }
  }
}

/**
 * 生成 Blockly Toolbox 定义
 * @param {Object} categories - 过滤后的 BLOCK_CATEGORIES 子集
 */
export function buildToolbox(categories) {
  return {
    kind: 'categoryToolbox',
    contents: Object.entries(categories).map(([type, category]) => ({
      kind: 'category',
      name: category.label,
      contents: [
        {
          kind: 'block',
          type,
        },
      ],
    })),
  }
}

/**
 * 默认 Toolbox（全部类别，向后兼容）
 */
export const toolbox = buildToolbox(BLOCK_CATEGORIES)
