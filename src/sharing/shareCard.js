/**
 * Build share text for a creation
 * @param {object} json - block JSON truth layer
 * @param {function} t - i18n translator function
 * @returns {string}
 */
export function buildShareText(json, t) {
  const blocks = Object.entries(json.blocks)
    .filter(([, v]) => v !== null)
    .map(([type, v]) => `${t('blocks.category.' + type)}: ${v.value ? t('blocks.option.' + v.value) : v.label}`)
    .join(' | ')

  return t('share.text', { blocks })
}

/**
 * Share via Web Share API (mobile-first) with clipboard fallback
 * @param {object} json
 * @param {string} imageUrl
 * @param {function} t - i18n translator function
 * @returns {Promise<boolean>} whether share was successful
 */
export async function shareCreation(json, imageUrl, t) {
  const text = buildShareText(json, t)

  // Try Web Share API (supported on mobile browsers)
  if (navigator.share) {
    try {
      const shareData = { title: t('share.title'), text }

      // Try sharing image (requires File)
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
      // User cancelled or share failed, fall through
    }
  }

  // Fallback: copy text to clipboard
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Download image locally
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
