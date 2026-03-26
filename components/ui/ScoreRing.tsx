interface ScoreRingProps {
  score: number // 1-10
  size?: 'sm' | 'md' | 'lg'
}

function scoreKlasse(score: number): string {
  if (score >= 8) return 'text-green-600'
  if (score >= 6) return 'text-blue-600'
  if (score >= 4) return 'text-yellow-600'
  return 'text-red-600'
}

function scoreRingFarve(score: number): string {
  if (score >= 8) return '#16a34a'
  if (score >= 6) return '#2563eb'
  if (score >= 4) return '#ca8a04'
  return '#dc2626'
}

const storrelseMap = {
  sm: { size: 64, stroke: 5, tekstKlasse: 'text-lg' },
  md: { size: 96, stroke: 7, tekstKlasse: 'text-2xl' },
  lg: { size: 128, stroke: 9, tekstKlasse: 'text-4xl' },
}

export function ScoreRing({ score, size = 'md' }: ScoreRingProps) {
  const { size: px, stroke, tekstKlasse } = storrelseMap[size]
  const radius = (px - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 10) * circumference
  const offset = circumference - progress

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={px} height={px} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke={scoreRingFarve(score)}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold leading-none ${tekstKlasse} ${scoreKlasse(score)}`}>
          {score}
        </span>
        <span className="text-xs text-gray-500 leading-none mt-0.5">/10</span>
      </div>
    </div>
  )
}
