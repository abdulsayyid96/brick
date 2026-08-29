import { CheckIcon, TrashIcon } from './Icons';

export default function History({ history, onClear }) {
  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`;
    return `${m}m`;
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group by date
  const grouped = history.reduce((acc, item) => {
    const date = new Date(item.completedAt).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  if (history.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <CheckIcon />
        </div>
        <h3>No completed bricks</h3>
        <p>Finished tasks will appear here. Start a timer and complete it to track your progress.</p>
      </div>
    );
  }

  return (
    <div className="history-section">
      <div className="brick-stack-header">
        <span className="brick-stack-label">
          {history.length} completed
        </span>
        <button className="history-clear-btn" onClick={onClear}>
          <TrashIcon />
          <span>Clear All</span>
        </button>
      </div>

      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="history-date-group">
          <div className="history-date">{date}</div>
          {items.map((item, i) => (
            <div
              key={item.historyId || `${item.id}_${item.completedAt || i}_${i}`}
              className="history-item"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="history-check">
                <CheckIcon />
              </div>
              <div className="history-info">
                <div className="history-title">{item.title}</div>
                <div className="history-meta">
                  Completed at {formatTime(item.completedAt)}
                </div>
              </div>
              <div className="history-duration">
                {formatDuration(item.duration)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
