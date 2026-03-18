/**
 * 引导提示组件
 * 根据阶段显示上下文相关的引导信息
 */
export default function GuidanceHint({ message, phase }) {
  if (!message) return null
  return (
    <div className={`guidance-hint guidance-${phase}`} role="status">
      <p>{message}</p>
    </div>
  )
}
