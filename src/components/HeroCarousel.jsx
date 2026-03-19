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
    imageA: '/demo-images/demo-001.png',
    imageB: '/demo-images/demo-002.png',
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
    imageA: '/demo-images/demo-003.png',
    imageB: '/demo-images/demo-004.png',
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
    imageA: '/demo-images/demo-005.png',
    imageB: '/demo-images/demo-006.png',
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

// Scratch-style block colors — solid, vivid, kid-friendly
const CATEGORY_COLORS = {
  subject: { bg: '#6366f1', dark: '#4f46e5', text: '#fff', emoji: '🐾' },
  action: { bg: '#10b981', dark: '#059669', text: '#fff', emoji: '⚡' },
  scene:  { bg: '#f59e0b', dark: '#d97706', text: '#fff', emoji: '🌍' },
  style:  { bg: '#ec4899', dark: '#db2777', text: '#fff', emoji: '🎨' },
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
      aria-label={t('carousel.demoSet', { index: i + 1 })}
    />
  ))

  return (
    <div className="w-full px-4 sm:px-6">
      {/* Scratch-style block row */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-5 min-h-[3.5rem]">
        {set.blocks.map((block, i) => {
          const isChanged = i === set.changedIndex
          const value = useB && isChanged ? block.valueB : block.valueA
          const category = t(`blocks.category.${block.category}`)
          const option = t(`blocks.option.${value}`)
          const colors = CATEGORY_COLORS[block.category] || { bg: '#475569', dark: '#334155', text: '#fff', emoji: '📦' }

          return (
            <div
              key={`${setIndex}-${i}`}
              className={`
                relative flex flex-col items-center
                transition-all duration-500
                ${blocksReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                ${isChanged && highlightChanged ? 'scale-110 z-10' : ''}
              `}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Block body — Scratch-style */}
              <div
                className="relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-bold text-sm sm:text-base"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  boxShadow: `0 4px 0 0 ${colors.dark}, 0 8px 16px rgba(0,0,0,0.3)`,
                  border: `2px solid ${colors.dark}`,
                  transform: isChanged && highlightChanged ? 'translateY(-3px)' : 'none',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
              >
                {/* Notch on top */}
                <div
                  className="absolute -top-[8px] left-3 w-8 h-[8px] rounded-t-sm"
                  style={{ backgroundColor: colors.bg, borderTop: `2px solid ${colors.dark}`, borderLeft: `2px solid ${colors.dark}`, borderRight: `2px solid ${colors.dark}` }}
                />
                {/* Bump on bottom */}
                <div
                  className="absolute -bottom-[8px] left-3 w-8 h-[8px] rounded-b-sm"
                  style={{ backgroundColor: colors.bg, borderBottom: `2px solid ${colors.dark}`, borderLeft: `2px solid ${colors.dark}`, borderRight: `2px solid ${colors.dark}` }}
                />
                <span className="mr-1.5">{colors.emoji}</span>
                <span className="opacity-70 text-xs sm:text-sm">{category}: </span>
                <span>{option}</span>
              </div>

              {/* Glow ring when changed */}
              {isChanged && highlightChanged && (
                <div
                  className="absolute inset-0 -m-1 rounded-lg animate-pulse"
                  style={{ boxShadow: `0 0 16px 4px ${colors.bg}66` }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Image display area */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[21/9] rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        {/* Image A — full width normally, left half during showB */}
        {!imgError.a ? (
          <img
            src={set.imageA}
            alt={set.blocks.map(b => t(`blocks.option.${b.valueA}`)).join(', ')}
            className={`absolute top-0 h-full object-cover transition-all duration-700 ${
              showImageA ? 'opacity-100' : 'opacity-0'
            } ${showImageB ? 'left-0 w-[49.5%]' : 'left-0 w-full'}`}
            onError={() => setImgError(e => ({ ...e, a: true }))}
          />
        ) : null}

        {/* Image B — slides in from right during showB */}
        {!imgError.b ? (
          <img
            src={set.imageB}
            alt={set.blocks.map((b, i) =>
              t(`blocks.option.${i === set.changedIndex ? b.valueB : b.valueA}`)
            ).join(', ')}
            className={`absolute top-0 right-0 h-full w-[49.5%] object-cover transition-all duration-700 ${
              showImageB ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
            onError={() => setImgError(e => ({ ...e, b: true }))}
          />
        ) : null}

        {/* Center divider during showB */}
        <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-indigo-400/80 transition-opacity duration-500 ${
          showImageB ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Arrow indicator during showB */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 z-10 ${
          showImageB ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-indigo-300 text-lg font-bold">
            →
          </div>
        </div>

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
