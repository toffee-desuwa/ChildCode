/**
 * Guidance hint component — contextual guidance based on workspace phase.
 * Renders inside dark-themed WorkspacePage.
 */

const PHASE_STYLES = {
  empty: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  incomplete: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  ready: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  'first-image': 'bg-blue-500/10 border-blue-500/30 text-blue-300',
}

export default function GuidanceHint({ message, phase }) {
  if (!message) return null
  const style = PHASE_STYLES[phase] || PHASE_STYLES.empty
  return (
    <div className={`px-4 py-2.5 rounded-lg mt-2 mb-2 font-semibold text-sm border animate-[fadeIn_0.3s_ease-out] ${style}`} role="status">
      <p>{message}</p>
    </div>
  )
}
