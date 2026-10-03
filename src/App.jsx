import { useState, useEffect, useCallback, useRef, } from 'react';
import './App.css';
import BrickStack from './components/BrickStack';
import FloatingInput from './components/FloatingInput';
import FocusMode from './components/FocusMode';
import CompletionAlert from './components/CompletionAlert';
import EditModal from './components/EditModal';
import History from './components/History';
import SyncModal from './components/SyncModal';
import { BrickIcon, HistoryIcon, RefreshIcon, SunIcon, MoonIcon } from './components/Icons';
import { breakdownTask } from './services/ai';
import { loadBricks, saveBricks, loadHistory, saveHistory } from './services/storage';
import {
  supabase,
  generateSyncCode,
  fetchRemoteState,
  pushRemoteState,
  subscribeToRealtime,
} from './services/supabase';

let idCounter = Date.now();
const genId = () => `brick_${idCounter++}_${Math.random().toString(36).substring(2, 7)}`;

export default function App() {
  const [bricks, setBricks] = useState(() => loadBricks());
  const [history, setHistory] = useState(() => loadHistory());
  const [view, setView] = useState('stack'); // 'stack' | 'history'
  const [focusBrick, setFocusBrick] = useState(null);
  const [completedBrick, setCompletedBrick] = useState(null);
  const [editBrick, setEditBrick] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('brick_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('brick_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Sync state
  const [syncCode, setSyncCode] = useState(() => {
    let saved = localStorage.getItem('brick_sync_code');
    if (!saved) {
      saved = generateSyncCode();
      localStorage.setItem('brick_sync_code', saved);
    }
    return saved;
  });
  const [showSyncModal, setShowSyncModal] = useState(false);
  const isRemoteUpdatingRef = useRef(false);

  // Initial remote fetch on mount or syncCode change
  useEffect(() => {
    if (!syncCode || !supabase) return;
    let isMounted = true;

    fetchRemoteState(syncCode).then((remoteData) => {
      if (!isMounted || !remoteData) return;
      isRemoteUpdatingRef.current = true;

      if (remoteData.bricks && Array.isArray(remoteData.bricks)) {
        setBricks(remoteData.bricks);
      }
      if (remoteData.history && Array.isArray(remoteData.history)) {
        setHistory(remoteData.history);
      }

      setTimeout(() => {
        isRemoteUpdatingRef.current = false;
      }, 500);
    });

    return () => {
      isMounted = false;
    };
  }, [syncCode]);

  // Subscribe to Realtime push updates
  useEffect(() => {
    if (!syncCode || !supabase) return;

    const unsubscribe = subscribeToRealtime(syncCode, ({ bricks: remoteBricks, history: remoteHistory }) => {
      isRemoteUpdatingRef.current = true;
      if (remoteBricks) setBricks(remoteBricks);
      if (remoteHistory) setHistory(remoteHistory);

      setTimeout(() => {
        isRemoteUpdatingRef.current = false;
      }, 500);
    });

    return () => {
      unsubscribe();
    };
  }, [syncCode]);

  // Persist local state and push to remote
  useEffect(() => {
    saveBricks(bricks);
    if (!isRemoteUpdatingRef.current && syncCode && supabase) {
      pushRemoteState(syncCode, bricks, history);
    }
  }, [bricks, history, syncCode]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const handleSaveSyncCode = useCallback((newCode) => {
    setSyncCode(newCode);
    localStorage.setItem('brick_sync_code', newCode);
  }, []);

  // --- Brick CRUD ---
  const addBrick = useCallback((task) => {
    setBricks((prev) => [...prev, { id: genId(), ...task }]);
  }, []);

  const addBricks = useCallback((tasks) => {
    const newBricks = tasks.map((t) => ({
      id: genId(),
      title: t.title,
      duration: t.duration,
      isSubTask: t.isSubTask || false,
    }));
    setBricks((prev) => [...prev, ...newBricks]);
  }, []);


  const deleteBrick = useCallback((id) => {
    setBricks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const updateBrick = useCallback((updated) => {
    setBricks((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    setEditBrick(null);
  }, []);

  // --- AI Generate ---
  const handleAIGenerate = useCallback(async (prompt) => {
    setIsAILoading(true);
    try {
      const tasks = await breakdownTask(prompt);
      const newBricks = tasks.map((t) => ({
        id: genId(),
        title: t.title,
        duration: t.duration,
        isSubTask: true,
      }));
      setBricks((prev) => [...prev, ...newBricks]);
    } catch (err) {
      console.error('AI generation failed:', err);
    }
    setIsAILoading(false);
  }, []);

  // --- Focus Mode ---
  const handlePlay = useCallback((brick) => {
    setFocusBrick(brick);
  }, []);

  const handleFocusComplete = useCallback((brick) => {
    setFocusBrick(null);
    setCompletedBrick(brick);
    const now = Date.now();
    // Move to history and remove from stack
    setHistory((prev) => {
      const isDuplicate = prev.some(
        (h) => h.id === brick.id && Math.abs((h.completedAt || 0) - now) < 2000
      );
      if (isDuplicate) return prev;
      return [
        {
          ...brick,
          historyId: `hist_${now}_${Math.random().toString(36).substring(2, 7)}`,
          completedAt: now,
        },
        ...prev,
      ];
    });
    setBricks((prev) => prev.filter((b) => b.id !== brick.id));
  }, []);

  const handleFocusCancel = useCallback(() => {
    setFocusBrick(null);
  }, []);

  // --- History ---
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px ' }}>
            <div className="header-logo"></div>
            <div className="header-logo"></div>
          </div>
          <h1 className="header-title">Brick</h1>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${view === 'stack' ? 'active' : ''}`}
            onClick={() => setView('stack')}
          >
            <BrickIcon />
            {/* <span>Stack</span> */}
          </button>
          <button
            className={`nav-btn ${view === 'history' ? 'active' : ''}`}
            onClick={() => setView('history')}
          >
            <HistoryIcon />
            {/* <span>History</span> */}
          </button>
          <button
            className="nav-btn theme-nav-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className="nav-btn sync-nav-btn"
            onClick={() => setShowSyncModal(true)}
            title={`Sync Code: ${syncCode}`}
          >
            <RefreshIcon />
            {/* <span className="sync-dot-indicator" /> */}
            {/* <span className="sync-nav-text">Sync</span> */}
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="main-content">
        {view === 'stack' ? (
          <BrickStack
            bricks={bricks}
            onPlay={handlePlay}
            onEdit={(brick) => setEditBrick(brick)}
            onDelete={deleteBrick}
          />
        ) : (
          <History history={history} onClear={clearHistory} />
        )}

        {/* AI Loading indicator */}
        {isAILoading && (
          <div className="ai-loading">
            <div className="ai-loading-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="ai-loading-text">Breaking down your task...</div>
          </div>
        )}
      </main>

      {/* Floating Input (only on stack view) */}
      {view === 'stack' && (
        <FloatingInput
          onAddManual={addBrick}
          onAddBatch={addBricks}
          onAddAI={handleAIGenerate}
          isAILoading={isAILoading}
        />
      )}

      {/* Focus Mode */}
      {focusBrick && (
        <FocusMode
          brick={focusBrick}
          onComplete={handleFocusComplete}
          onCancel={handleFocusCancel}
        />
      )}

      {/* Completion Alert */}
      {!focusBrick && completedBrick && (
        <CompletionAlert
          brick={completedBrick}
          onDismiss={() => setCompletedBrick(null)}
        />
      )}

      {/* Edit Modal */}
      {editBrick && (
        <EditModal
          brick={editBrick}
          onSave={updateBrick}
          onCancel={() => setEditBrick(null)}
        />
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <SyncModal
          syncCode={syncCode}
          onSaveSyncCode={handleSaveSyncCode}
          onClose={() => setShowSyncModal(false)}
          isConnected={Boolean(supabase)}
        />
      )}
    </div>
  );
}
