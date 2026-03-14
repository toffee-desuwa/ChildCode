import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { registerBlocks, toolbox } from '../blocks/definitions'
import { exportBlocksJson } from '../blocks/exportJson'

// 注册积木定义（只执行一次）
registerBlocks()

export default function BlocklyEditor({ onJsonChange }) {
  const containerRef = useRef(null)
  const workspaceRef = useRef(null)
  // Store callback in ref so Blockly listener always calls latest version
  const onJsonChangeRef = useRef(onJsonChange)

  // Keep ref in sync with prop, via effect (lint-safe)
  useEffect(() => {
    onJsonChangeRef.current = onJsonChange
  }, [onJsonChange])

  useEffect(() => {
    if (!containerRef.current) return
    // If workspace already exists in this container, skip
    if (workspaceRef.current) return

    const workspace = Blockly.inject(containerRef.current, {
      toolbox,
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

    workspace.addChangeListener(handleChange)
    // 初始导出一次 (pass null event to bypass UI check)
    handleChange(null)

    return () => {
      workspace.dispose()
      workspaceRef.current = null
    }
  }, [])

  return <div ref={containerRef} className="blockly-container" />
}
