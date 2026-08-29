import { useState, useEffect, useRef } from 'react';
import { XIcon, PauseIcon, PlayIcon, StopIcon } from './Icons';

export default function FocusMode({ brick, onComplete, onCancel }) {
  const totalSeconds = brick.duration * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (remaining <= 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete(brick);
    }
  }, [remaining, brick, onComplete]);

  useEffect(() => {
    if (isPaused || remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, remaining]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
      if (e.code === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const elapsed = totalSeconds - remaining;
  const progressPct = (elapsed / totalSeconds) * 100;

  const formatTime = (m, s) =>
    `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  return (
    <div className="focus-overlay">
      <div className="focus-backdrop" />
      <div className="focus-content">
        <div className="focus-task-name">{brick.title}</div>
        <div className="focus-timer">{formatTime(mins, secs)}</div>
        <div className="focus-progress">
          <div
            className="focus-progress-bar"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <button
          className="focus-btn stop-btn"
          onClick={onCancel}
          title="Stop & return (Esc)"
        >
          <XIcon />
        </button>
        <div className="focus-controls">
          <button
            className="focus-btn pause-btn"
            onClick={() => setIsPaused((p) => !p)}
            title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}
