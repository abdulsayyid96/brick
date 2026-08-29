import BrickItem from './BrickItem';
import { BrickIcon } from './Icons';

export default function BrickStack({ bricks, onPlay, onEdit, onDelete }) {
  const totalMinutes = bricks.reduce((sum, b) => sum + b.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const totalStr = hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minute`;

  if (bricks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <BrickIcon />
        </div>
        <h3>No bricks yet</h3>
        <p>Stack your time blocks below to start building your day, one brick at a time.</p>
      </div>
    );
  }

  return (
    <div className="brick-stack">
      <div className="brick-stack-header">
        <span className="brick-stack-label">
          {bricks.length} brick{bricks.length !== 1 ? 's' : ''}
        </span>
        <span className="brick-stack-total">{totalStr}</span>
      </div>
      {bricks.map((brick, i) => (
        <BrickItem
          key={brick.id}
          brick={brick}
          index={i}
          onPlay={onPlay}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
