import { useState } from 'react';

export default function EditModal({ brick, onSave, onCancel }) {
  const [title, setTitle] = useState(brick.title);
  const [hours, setHours] = useState(Math.floor(brick.duration / 60));
  const [mins, setMins] = useState(brick.duration % 60);

  const handleSave = () => {
    const duration = parseInt(hours || 0) * 60 + parseInt(mins || 0);
    if (!title.trim() || duration <= 0) return;
    onSave({ ...brick, title: title.trim(), duration });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="edit-overlay" onClick={onCancel}>
      <div className="edit-card" onClick={(e) => e.stopPropagation()}>
        <h3>Edit Brick</h3>
        <div className="edit-field-group">
          <label className="edit-label">Title</label>
          <input
            className="edit-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="edit-field-group">
          <label className="edit-label">Duration</label>
          <div className="edit-duration-row">
            <input
              className="edit-input"
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              style={{ flex: 1 }}
            />
            <span style={{ color: 'var(--text-muted)', alignSelf: 'center', fontSize: '12px' }}>h</span>
            <input
              className="edit-input"
              type="number"
              min="0"
              max="59"
              value={mins}
              onChange={(e) => setMins(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              style={{ flex: 1 }}
            />
            <span style={{ color: 'var(--text-muted)', alignSelf: 'center', fontSize: '12px' }}>m</span>
          </div>
        </div>
        <div className="edit-actions">
          <button className="edit-cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="edit-save-btn" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
