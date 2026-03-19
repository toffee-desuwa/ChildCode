import { CATEGORY_LABELS } from '../blocks/whitelist'

/**
 * 生成分享文案
 * @param {object} json - 积木 JSON 真相层
 * @returns {string}
 */
export function buildShareText(json) {
  const blocks = Object.entries(json.blocks)
    .filter(([, v]) => v !== null)
    .map(([type, v]) => `${CATEGORY_LABELS[type]}：${v.label}`)
    .join('｜')

  return `我用 ChildCode 创作了一幅画！\n积木组合：${blocks}\n\n来试试用积木控制 AI 画画吧！`
}

/**
 * 使用 Web Share API 分享（移动端优先）
 * @param {object} json
 * @param {string} imageUrl
 * @returns {Promise<boolean>} 是否成功调用分享
 */
export async function shareCreation(json, imageUrl) {
  const text = buildShareText(json)

  // 尝试 Web Share API（移动端浏览器支持）
  if (navigator.share) {
    try {
      const shareData = { title: 'ChildCode 创作', text }

      // 尝试分享图片（需要 File）
      if (navigator.canShare && imageUrl.startsWith('data:')) {
        const blob = await fetch(imageUrl).then(r => r.blob())
        const file = new File([blob], 'childcode-creation.png', { type: blob.type })
        if (navigator.canShare({ files: [file] })) {
          shareData.files = [file]
        }
      }

      await navigator.share(shareData)
      return true
    } catch {
      // 用户取消或分享失败，fall through
    }
  }

  // 降级：复制文案到剪贴板
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * 下载图片到本地
 * @param {string} imageUrl
 * @param {string} filename
 */
export function downloadImage(imageUrl, filename = 'childcode-creation.png') {
  const a = document.createElement('a')
  a.href = imageUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
