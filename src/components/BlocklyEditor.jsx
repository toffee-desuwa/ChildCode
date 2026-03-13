import { useEffect, useRef } from 'react'
import * as Blockly from 'blockly'
import { registerBlocks, toolbox } from '../blocks/definitions'
import { exportBlocksJson } from '../blocks/exportJson'

// 注册积木定义（只执行一次）
registerBlocks()

export default function BlocklyEditor({ onJsonChange }) {
  const containerRef = useRef(null)
  const workspaceRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || workspaceRef.current) return

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

    const handleChange = () => {
      const json = exportBlocksJson(workspace)
      onJsonChange(json)
    }

    workspace.addChangeListener(handleChange)
    // 初始导出一次
    handleChange()

    return () => {
      workspace.dispose()
      workspaceRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="blockly-container" />
}
