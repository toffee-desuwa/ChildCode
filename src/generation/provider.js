/**
 * Provider adapter 统一接口
 *
 * 业务层只调用 generateImage(prompt, config)
 * 切换 provider 只需替换此文件中的实现，不改业务逻辑
 *
 * config: { apiKey: string }
 * 返回: { url: string } 或抛出错误
 */

/**
 * OpenAI DALL-E provider adapter
 */
async function openaiProvider(prompt, config) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    }),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message = errorBody?.error?.message || `API 请求失败 (${response.status})`
    throw new Error(message)
  }

  const data = await response.json()
  const url = data?.data?.[0]?.url
  if (!url) {
    throw new Error('API 未返回图片')
  }

  return { url }
}

/**
 * 统一入口：generateImage(prompt, config)
 * 业务层通过此函数调用，不直接绑定具体 provider
 */
export async function generateImage(prompt, config) {
  return openaiProvider(prompt, config)
}
