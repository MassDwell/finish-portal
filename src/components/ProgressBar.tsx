interface ProgressBarProps {
  current: number
  total: number
  percentage: number
}

export function ProgressBar({ current, total, percentage }: ProgressBarProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-soft-denim mt-1">
        <span>Start</span>
        <span>{current}/{total}</span>
        <span>Complete</span>
      </div>
    </div>
  )
}