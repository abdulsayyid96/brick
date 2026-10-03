import { useState } from 'react';
import { PlayIcon, EditIcon, TrashIcon } from './Icons';

export default function BrickItem({ brick, onPlay, onEdit, onDelete, index }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`;
    return `${m} minutes`;
  };

  // Min height 48px, scales with duration (1 min = 1.5px extra height beyond base)
  const height = Math.max(48, 48 + brick.duration * 1.5);

  return (
    <div
      className={`brick ${brick.isSubTask ? 'sub-brick' : ''}`}
      style={{
        minHeight: `${height}px`,
        animationDelay: `${index * 0.05}s`,
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="brick-content" style={{ width: '100%' }}>
        <div className="brick-info">
          <div className="brick-title">{brick.title}</div>
          <div className="brick-time-duration">
            {/* <div className={`brick-label ${brick.isSubTask ? 'sub-brick' : ''}`}>{brick.isSubTask ? "Generated" : "Created"}</div> */}
            <div className={`brick-label`}>
              <div className="">{formatDuration(brick.duration)}</div>
            </div>
            {/* <div className="brick-duration">{formatDuration(brick.duration)}</div> */}
          </div>
        </div>
        <div className="brick-actions" style={{ opacity: isHovered ? 1 : undefined }}>
          <button
            className="brick-action-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(brick); }}
            title="Edit task"
          >
            <EditIcon />
          </button>
          <button
            className="brick-action-btn delete-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(brick.id); }}
            title="Delete task"
          >
            <TrashIcon />
          </button>
          <button
            className="brick-action-btn play-btn"
            onClick={(e) => { e.stopPropagation(); onPlay(brick); }}
            title="Start focus timer"
          >
            <PlayIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
