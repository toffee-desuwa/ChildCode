import { useState, useRef, useMemo, useCallback } from 'react'
import { isComplete } from '../blocks/exportJson'
import { loadConfig, isQuotaExhausted, incrementUsage, addHistoryEntry, loadMastery, recordComparison } from '../config/storage'
import { derivePrompt } from '../generation/derivePrompt'
import { generateImage } from '../generation/provider'
import { diffBlocks } from '../generation/diffBlocks'

/**
 * 图片生成核心逻辑 hook
 * 管理 snapshotA/B、生成状态、对比结果、掌握度
 */
export function useGeneration(currentJson, configStatus) {
  const [snapshotA, setSnapshotA] = useState(null)
  const [snapshotB, setSnapshotB] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [generationFailed, setGenerationFailed] = useState(false)
  const [zeroChangeWarn, setZeroChangeWarn] = useState(false)
  const [quotaExhausted, setQuotaExhausted] = useState(() => isQuotaExhausted())
  const [mastery, setMastery] = useState(() => loadMastery())

  // Ref mirrors snapshotA to avoid closure staleness in async handleGenerate
  const snapshotARef = useRef(null)

  const complete = currentJson && isComplete(currentJson)
  const hasA = snapshotA !== null
  const hasB = snapshotB !== null
  const canGenerate = complete && configStatus === 'configured' && !generating && !quotaExhausted

  // 实时检测当前积木与 A 的差异，用于预测提示
  const liveDiff = useMemo(() => {
    if (!snapshotA || !currentJson || snapshotB) return null
    return diffBlocks(snapshotA.json, currentJson)
  }, [snapshotA, snapshotB, currentJson])

  // AB 对比结果
  const comparison = useMemo(() => {
    if (!snapshotA || !snapshotB) return null
    return diffBlocks(snapshotA.json, snapshotB.json)
  }, [snapshotA, snapshotB])

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return

    const currentA = snapshotARef.current
    setZeroChangeWarn(false)

    // If A exists and 0 blocks changed, block generation
    if (currentA !== null) {
      const diff = diffBlocks(currentA.json, currentJson)
      if (diff.count === 0) {
        setZeroChangeWarn(true)
        return
      }
    }

    setGenerating(true)
    setError(null)
    setGenerationFailed(false)

    try {
      const prompt = derivePrompt(currentJson)
      if (!prompt) {
        setError('积木组合不完整，无法生成')
        return
      }

      const config = loadConfig()
      const result = await generateImage(prompt, config)

      const newSnapshot = {
        json: JSON.parse(JSON.stringify(currentJson)),
        imageUrl: result.url,
      }

      incrementUsage()
      setQuotaExhausted(isQuotaExhausted())
      addHistoryEntry(currentJson, result.url)

      if (snapshotARef.current === null) {
        snapshotARef.current = newSnapshot
        setSnapshotA(newSnapshot)
      } else {
        const diff = diffBlocks(snapshotARef.current.json, currentJson)
        setMastery(recordComparison(diff.count))
        setSnapshotB(newSnapshot)
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Generation error:', err)
      }
      setError('这次创作没有成功，请稍后再试一次。若一直失败，请让家长检查设置。')
      setGenerationFailed(true)
    } finally {
      setGenerating(false)
    }
  }, [canGenerate, currentJson])

  const handleNewRound = useCallback(() => {
    snapshotARef.current = snapshotB
    setSnapshotA(snapshotB)
    setSnapshotB(null)
    setZeroChangeWarn(false)
  }, [snapshotB])

  const clearError = useCallback(() => {
    setError(null)
    setGenerationFailed(false)
  }, [])

  return {
    snapshotA,
    snapshotB,
    generating,
    error,
    generationFailed,
    zeroChangeWarn,
    quotaExhausted,
    mastery,
    complete,
    hasA,
    hasB,
    canGenerate,
    liveDiff,
    comparison,
    handleGenerate,
    handleNewRound,
    clearError,
  }
}
