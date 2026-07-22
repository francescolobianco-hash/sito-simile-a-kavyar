export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress-track h-2 w-full ${className}`}>
      <div className="progress-fill h-full" style={{ width: `${pct}%` }} />
    </div>
  );
}
