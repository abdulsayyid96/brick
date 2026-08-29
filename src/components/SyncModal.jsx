import { useState } from 'react';

export default function SyncModal({ syncCode, onSaveSyncCode, onClose, isConnected }) {
  const [inputCode, setInputCode] = useState(syncCode || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = (e) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (clean) {
      onSaveSyncCode(clean);
      onClose();
    }
  };

  return (
    <div className="completion-overlay" onClick={onClose}>
      <div className="completion-card sync-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="sync-modal-header">
          <h2>Cross-Device Sync</h2>
          <button className="sync-close-btn" onClick={onClose}>✕</button>
        </div>

        <p className="sync-modal-desc">
          Enter your 6-character Sync Code on another phone or browser to keep your tasks in real-time sync across devices.
        </p>

        {/* Current Code Section */}
        <div className="sync-code-box">
          <span className="sync-box-label">Your Sync Code</span>
          <div className="sync-code-display">
            <strong className="sync-code-text">{syncCode || '------'}</strong>
            <button className="sync-copy-btn" onClick={handleCopy} disabled={!syncCode}>
              {copied ? 'Copied! ✓' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Join / Enter Code Section */}
        <form onSubmit={handleConnect} className="sync-join-form">
          <label className="sync-box-label">Connect Another Device Code</label>
          <div className="sync-input-group">
            <input
              type="text"
              className="sync-input"
              maxLength={6}
              placeholder="e.g. A9B2X7"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            />
            <button type="submit" className="sync-connect-btn">
              Link Device
            </button>
          </div>
        </form>

        <div className="sync-status-footer">
          <span className={`sync-status-dot ${isConnected ? 'online' : 'offline'}`} />
          <span className="sync-status-text">
            {isConnected ? 'Realtime Sync Active' : 'Supabase Config Required'}
          </span>
        </div>
      </div>
    </div>
  );
}
