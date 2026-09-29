interface SessionSummaryProps {
  correct: number;
  attempts: number;
  missed: number;
  isRetry: boolean;
  onRetry: () => void;
  onReset: () => void;
}

export function SessionSummary({
  correct,
  attempts,
  missed,
  isRetry,
  onRetry,
  onReset,
}: SessionSummaryProps) {
  const ratio = attempts === 0 ? "—" : `${Math.round((correct / attempts) * 100)}%`;

  return (
    <aside className="session-panel" aria-labelledby="session-title">
      <div className="session-heading">
        <div>
          <p className="eyebrow">{isRetry ? "Focused pass" : "Current run"}</p>
          <h2 id="session-title">Session</h2>
        </div>
        <span className="live-indicator"><i aria-hidden="true" /> Live</span>
      </div>

      <div className="score-grid">
        <div className="score-cell score-primary">
          <span>Copy rate</span>
          <strong>{ratio}</strong>
        </div>
        <div className="score-cell">
          <span>Correct</span>
          <strong>{correct}</strong>
        </div>
        <div className="score-cell">
          <span>Attempts</span>
          <strong>{attempts}</strong>
        </div>
        <div className="score-cell">
          <span>Missed</span>
          <strong>{missed}</strong>
        </div>
      </div>

      <div className="session-actions">
        <button className="secondary-button" onClick={onRetry} disabled={missed === 0}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.34-5.66L4 8.7M4 4v4.7h4.7" /></svg>
          Retry missed
          <span className="button-count">{missed}</span>
        </button>
        <button className="text-button" onClick={onReset}>Start a new session</button>
      </div>

      <div className="offline-note">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10V8a4 4 0 0 1 8 0v2M6 10h12v10H6z" /></svg>
        <span><strong>Local practice</strong>No audio or answers leave this device.</span>
      </div>
    </aside>
  );
}
