import { useState, useEffect, useCallback, useRef } from 'react'
import { useI18n } from '../i18n'

/**
 * Demo showcase sets — each has two images differing by one block.
 * blockLabels: the 4 blocks shown as tags. changedIndex: which one changes.
 * Keys reference i18n block option labels.
 */
const DEMO_SETS = [
  {
    blocks: [
      { category: 'subject', valueA: 'cat', valueB: 'cat' },
      { category: 'action', valueA: 'running', valueB: 'sleeping' },
      { category: 'scene', valueA: 'forest', valueB: 'forest' },
      { category: 'style', valueA: 'watercolor', valueB: 'watercolor' },
    ],
    changedIndex: 1,
    imageA: '/demo-images/demo-001.svg',
    imageB: '/demo-images/demo-002.svg',
    insight: 'carousel.insight.action',
  },
  {
    blocks: [
      { category: 'subject', valueA: 'dragon', valueB: 'dragon' },
      { category: 'action', valueA: 'flying', valueB: 'flying' },
      { category: 'scene', valueA: 'sky', valueB: 'ocean' },
      { category: 'style', valueA: 'pixel_art', valueB: 'pixel_art' },
    ],
    changedIndex: 2,
    imageA: '/demo-images/demo-003.svg',
    imageB: '/demo-images/demo-004.svg',
    insight: 'carousel.insight.scene',
  },
  {
    blocks: [
      { category: 'subject', valueA: 'robot', valueB: 'robot' },
      { category: 'action', valueA: 'dancing', valueB: 'dancing' },
      { category: 'scene', valueA: 'city', valueB: 'city' },
      { category: 'style', valueA: 'cartoon', valueB: 'oil_painting' },
    ],
    changedIndex: 3,
    imageA: '/demo-images/demo-005.svg',
    imageB: '/demo-images/demo-006.svg',
    insight: 'carousel.insight.style',
  },
]

// Animation phases within each 5-second cycle
const PHASE_DURATIONS = {
  blocksIn: 800,     // block labels slide in
  showA: 1200,       // hold image A
  blockSwap: 600,    // highlight + swap the changed block
  showB: 2400,       // crossfade to image B + hold
}

const CYCLE_MS =
  PHASE_DURATIONS.blocksIn +
  PHASE_DURATIONS.showA +
  PHASE_DURATIONS.blockSwap +
  PHASE_DURATIONS.showB

// Category colors for block tags
const CATEGORY_COLORS = {
  subject: 'bg-indigo-500/80 text-indigo-100',
  action: 'bg-emerald-500/80 text-emerald-100',
  scene: 'bg-amber-500/80 text-amber-100',
  style: 'bg-pink-500/80 text-pink-100',
}

export default function HeroCarousel() {
  const { t } = useI18n()
  const [setIndex, setSetIndex] = useState(0)
  const [phase, setPhase] = useState('blocksIn') // blocksIn | showA | blockSwap | showB
  const [imgError, setImgError] = useState({})
  const timerRef = useRef(null)

  const set = DEMO_SETS[setIndex]

  // Advance phase within a cycle, then move to next set
  const advancePhase = useCallback(() => {
    setPhase((prev) => {
      if (prev === 'blocksIn') return 'showA'
      if (prev === 'showA') return 'blockSwap'
      if (prev === 'blockSwap') return 'showB'
      // showB → next set, reset error state
      setSetIndex((i) => (i + 1) % DEMO_SETS.length)
      setImgError({})
      return 'blocksIn'
    })
  }, [])

  useEffect(() => {
    const duration = PHASE_DURATIONS[phase]
    timerRef.current = setTimeout(advancePhase, duration)
    return () => clearTimeout(timerRef.current)
  }, [phase, setIndex, advancePhase])

  const blocksReady = phase !== 'blocksIn'
  const showImageA = phase === 'showA' || phase === 'blockSwap' || phase === 'showB'
  const showImageB = phase === 'showB'
  const highlightChanged = phase === 'blockSwap' || phase === 'showB'
  const useB = phase === 'showB'

  // Dot indicator
  const dots = DEMO_SETS.map((_, i) => (
    <button
      key={i}
      onClick={() => { setSetIndex(i); setPhase('blocksIn'); setImgError({}) }}
      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
        i === setIndex ? 'bg-indigo-400 w-6' : 'bg-slate-600 hover:bg-slate-500'
      }`}
      aria-label={`Demo set ${i + 1}`}
    />
  ))

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Block tags row */}
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 min-h-[2rem]">
        {set.blocks.map((block, i) => {
          const isChanged = i === set.changedIndex
          const value = useB && isChanged ? block.valueB : block.valueA
          const label = `${t(`blocks.category.${block.category}`)}: ${t(`blocks.option.${value}`)}`
          const colorClass = CATEGORY_COLORS[block.category] || 'bg-slate-600 text-slate-200'

          return (
            <span
              key={`${setIndex}-${i}`}
              className={`
                inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium
                transition-all duration-500
                ${colorClass}
                ${blocksReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                ${isChanged && highlightChanged ? 'ring-2 ring-white/60 scale-110' : ''}
              `}
              style={{
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {label}
            </span>
          )
        })}
      </div>

      {/* Image display area */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        {/* Image A */}
        {!imgError.a ? (
          <img
            src={set.imageA}
            alt={set.blocks.map(b => t(`blocks.option.${b.valueA}`)).join(', ')}
            className={`absolute inset-0 w-full h-full object-contain p-2 sm:p-4 transition-opacity duration-700 ${
              showImageA ? 'opacity-100' : 'opacity-0'
            }`}
            onError={() => setImgError(e => ({ ...e, a: true }))}
          />
        ) : null}

        {/* Image B (crossfades over A) */}
        {!imgError.b ? (
          <img
            src={set.imageB}
            alt={set.blocks.map((b, i) =>
              t(`blocks.option.${i === set.changedIndex ? b.valueB : b.valueA}`)
            ).join(', ')}
            className={`absolute inset-0 w-full h-full object-contain p-2 sm:p-4 transition-opacity duration-700 ${
              showImageB ? 'opacity-100' : 'opacity-0'
            }`}
            onError={() => setImgError(e => ({ ...e, b: true }))}
          />
        ) : null}

        {/* Fallback if images fail */}
        {imgError.a && imgError.b && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
            {t('carousel.fallback')}
          </div>
        )}

        {/* Loading state — visible only in blocksIn phase */}
        {!showImageA && !imgError.a && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        )}

        {/* Insight text overlay */}
        <div
          className={`absolute bottom-3 left-0 right-0 text-center transition-opacity duration-500 ${
            showImageB ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="inline-block px-4 py-1.5 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs text-indigo-300">
            {t(set.insight)}
          </span>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {dots}
      </div>
    </div>
  )
}
