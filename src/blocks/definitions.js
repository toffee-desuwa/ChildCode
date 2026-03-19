import * as Blockly from 'blockly'
import { BLOCK_CATEGORIES } from './whitelist'

/**
 * Category color mapping: Subject=blue, Action=green, Scene=orange, Style=purple
 * Extended: Emotion=pink, Weather=cyan, Time=yellow
 */
const CATEGORY_COLORS = {
  subject: { primary: '#3b82f6', secondary: '#2563eb', tertiary: '#1d4ed8' },
  action: { primary: '#22c55e', secondary: '#16a34a', tertiary: '#15803d' },
  scene: { primary: '#f97316', secondary: '#ea580c', tertiary: '#c2410c' },
  style: { primary: '#a855f7', secondary: '#9333ea', tertiary: '#7e22ce' },
  emotion: { primary: '#ec4899', secondary: '#db2777', tertiary: '#be185d' },
  weather: { primary: '#06b6d4', secondary: '#0891b2', tertiary: '#0e7490' },
  time: { primary: '#eab308', secondary: '#ca8a04', tertiary: '#a16207' },
}

// Build blockStyles and categoryStyles from color mapping
const blockStyles = {}
const categoryStyles = {}
for (const [type, colors] of Object.entries(CATEGORY_COLORS)) {
  blockStyles[`${type}_style`] = {
    colourPrimary: colors.primary,
    colourSecondary: colors.secondary,
    colourTertiary: colors.tertiary,
  }
  categoryStyles[`${type}_category`] = { colour: colors.primary }
}

/**
 * Dark theme for Blockly workspace — slate background with colored category blocks
 */
export const childCodeTheme = Blockly.Theme.defineTheme('childcode-dark', {
  blockStyles,
  categoryStyles,
  componentStyles: {
    workspaceBackgroundColour: '#1e293b',
    toolboxBackgroundColour: '#0f172a',
    toolboxForegroundColour: '#e2e8f0',
    flyoutBackgroundColour: '#1e293b',
    flyoutForegroundColour: '#e2e8f0',
    flyoutOpacity: 0.9,
    scrollbarColour: '#475569',
    scrollbarOpacity: 0.6,
    insertionMarkerColour: '#818cf8',
    insertionMarkerOpacity: 0.5,
    cursorColour: '#818cf8',
  },
  fontStyle: {
    family: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    weight: '500',
    size: 12,
  },
})

/**
 * Register all whitelist blocks to Blockly with category-specific styles
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
        this.setStyle(`${type}_style`)
      },
    }
  }
}

/**
 * Generate Blockly Toolbox definition with category styles
 * @param {Object} categories - filtered subset of BLOCK_CATEGORIES
 */
export function buildToolbox(categories) {
  return {
    kind: 'categoryToolbox',
    contents: Object.entries(categories).map(([type, category]) => ({
      kind: 'category',
      name: category.label,
      categorystyle: `${type}_category`,
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
 * Default Toolbox (all categories)
 */
export const toolbox = buildToolbox(BLOCK_CATEGORIES)
