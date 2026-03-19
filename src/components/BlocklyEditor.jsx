import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { registerBlocks, buildToolbox, childCodeTheme } from '../blocks/definitions'
import { exportBlocksJson } from '../blocks/exportJson'
import { getBlocksByTier, DEFAULT_AGE_TIER } from '../blocks/whitelist'
import { loadConfig } from '../config/storage'

// 注册积木定义（只执行一次，注册全部类别）
registerBlocks()

export default function BlocklyEditor({ onJsonChange, initialBlocks }) {
  const containerRef = useRef(null)
  const workspaceRef = useRef(null)
  // Store callback in ref so Blockly listener always calls latest version
  const onJsonChangeRef = useRef(onJsonChange)
  // 模板初始积木只在挂载时使用一次
  const initialBlocksRef = useRef(initialBlocks)

  // Keep ref in sync with prop, via effect (lint-safe)
  useEffect(() => {
    onJsonChangeRef.current = onJsonChange
  }, [onJsonChange])

  useEffect(() => {
    if (!containerRef.current) return
    // If workspace already exists in this container, skip
    if (workspaceRef.current) return

    // 根据家长配置的年龄段过滤可用积木
    const config = loadConfig()
    const ageTier = config?.ageTier || DEFAULT_AGE_TIER
    const categories = getBlocksByTier(ageTier)
    const toolbox = buildToolbox(categories)

    const workspace = Blockly.inject(containerRef.current, {
      toolbox,
      theme: childCodeTheme,
      scrollbars: true,
      trashcan: true,
      zoom: {
        controls: false,
        wheel: false,
        startScale: 1.0,
      },
    })

    workspaceRef.current = workspace

    const handleChange = (event) => {
      // Skip UI-only events (click, select, scroll, toolbox open, etc.)
      if (event && event.isUiEvent) return

      const json = exportBlocksJson(workspace)
      onJsonChangeRef.current(json)
    }

    // 从模板加载初始积木
    if (initialBlocksRef.current) {
      let yOffset = 30
      for (const [type, data] of Object.entries(initialBlocksRef.current)) {
        if (!data) continue
        const block = workspace.newBlock(type)
        block.setFieldValue(data.value, 'VALUE')
        block.initSvg()
        block.render()
        block.moveTo(new Blockly.utils.Coordinate(30, yOffset))
        yOffset += 60
      }
    }

    workspace.addChangeListener(handleChange)
    // 初始导出一次 (pass null event to bypass UI check)
    handleChange(null)

    return () => {
      workspace.dispose()
      workspaceRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
