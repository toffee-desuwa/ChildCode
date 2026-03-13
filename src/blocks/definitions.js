import * as Blockly from 'blockly'
import { BLOCK_CATEGORIES } from './whitelist'

/**
 * 注册 4 类白名单积木到 Blockly
 * 每类积木是一个带下拉选择的独立块，无嵌套、无连接
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
 * Blockly Toolbox 定义：4 个分类，每类 1 个块
 */
export const toolbox = {
  kind: 'categoryToolbox',
  contents: Object.entries(BLOCK_CATEGORIES).map(([type, category]) => ({
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
