import { useState, useRef, useEffect } from 'react';
import { HourglassIcon, PlusIcon, SparklesIcon } from './Icons';
import { parseTaskInput, formatParsedDuration } from '../utils/timeParser';
import { Clock } from 'lucide-react';

export default function FloatingInput({ onAddManual, onAddAI, isAILoading }) {
  const [mode, setMode] = useState('manual'); // 'manual' | 'ai'
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('');
  const [mins, setMins] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const parsed = parseTaskInput(title);
  const explicitDuration = parseInt(hours || 0) * 60 + parseInt(mins || 0);
  const autoDetectedDuration = explicitDuration === 0 ? parsed.duration : 0;

  const handleManualAdd = () => {
    const finalDuration = explicitDuration > 0 ? explicitDuration : parsed.duration;
    const rawTitle = title.trim();
    if (!rawTitle || finalDuration <= 0) return;

    // Use cleaned title if auto-detected duration was used, else use raw input title
    const finalTitle = explicitDuration > 0 ? rawTitle : (parsed.title || rawTitle);

    onAddManual({ title: finalTitle, duration: finalDuration });
    setTitle('');
    setHours('');
    setMins('');
    inputRef.current?.focus();
  };

  const handleAIGenerate = () => {
    if (!title.trim() || isAILoading) return;
    onAddAI(title.trim());
    setTitle('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (mode === 'manual') handleManualAdd();
      else handleAIGenerate();
    }
  };

  return (
    <div className="floating-input-wrapper">
      <div className="floating-input">
        <div className="input-row">

          <input
            ref={inputRef}
            className="input-field"
            type="text"
            placeholder={
              mode === 'manual'
                ? 'e.g. "Study physics 45min" or "Read 1.5 hr"'
                : 'e.g. "Read Docs: Learn React Hooks in 60 minutes"'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="toggle-and-button">
            <div className="mode-toggle">
              <button
                className={`mode-toggle-btn ${mode === 'manual' ? 'active' : ''}`}
                onClick={() => setMode('manual')}
              >
                Self
              </button>
              <button
                className={`mode-toggle-btn ${mode === 'ai' ? 'active' : ''}`}
                onClick={() => setMode('ai')}
              >
                AI
              </button>
            </div>

            <div className="floating-btn-wrapper">
              {mode === 'manual' && (
                <div className={autoDetectedDuration > 0 ? "duration-input-group" : "none"}>
                  {autoDetectedDuration > 0 ? (
                    <div
                      className="auto-detected-badge"
                      title={`Auto-detected: ${formatParsedDuration(autoDetectedDuration)}. Enter duration manually to override.`}
                    >
                      <Clock />
                      <span style={{ lineHeight: 1 }}> {formatParsedDuration(autoDetectedDuration)}</span>
                    </div>
                  ) : (null)}
                </div>
              )}

              {mode === 'manual' ? (
                <button className="input-btn add-btn" onClick={handleManualAdd}>
                  <PlusIcon />
                  <span>Add Task</span>
                </button>
              ) : (
                <button
                  className={`input-btn ai-btn ${isAILoading ? 'loading' : ''}`}
                  onClick={handleAIGenerate}
                >
                  <SparklesIcon />
                  <span>{isAILoading ? 'Generating...' : 'Generate'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

