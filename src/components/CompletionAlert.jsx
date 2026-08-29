import { CheckIcon } from './Icons';

export default function CompletionAlert({ brick, onDismiss }) {
  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`;
    return `${m}m`;
  };

  return (
    <div className="completion-overlay" onClick={onDismiss}>
      <div className="completion-card" onClick={(e) => e.stopPropagation()}>
        <div className="completion-icon">
          <CheckIcon />
        </div>
        <h2>Brick Complete!</h2>
        <p>
          You finished <strong>{brick.title}</strong> in{' '}
          {formatDuration(brick.duration)}. Keep stacking!
        </p>
        <button className="completion-btn" onClick={onDismiss}>
          Continue Building
        </button>
      </div>
    </div>
  );
}
