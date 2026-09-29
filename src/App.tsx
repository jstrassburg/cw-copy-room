import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { sessionReducer, createSession } from "./app/sessionReducer";
import { buildSemanticPlan } from "./audio/morse";
import { PracticeCard } from "./components/PracticeCard";
import { SessionSummary } from "./components/SessionSummary";
import { SettingsDialog } from "./components/SettingsDialog";
import { useAudioEngine } from "./hooks/useAudioEngine";
import { useSettings } from "./hooks/useSettings";
import {
  itemsByMode,
  validateContent,
  type PracticeMode,
} from "./model/content";

const modes: { id: PracticeMode; label: string; shortLabel: string }[] = [
  { id: "characters", label: "Characters", shortLabel: "A" },
  { id: "terms", label: "CW terms", shortLabel: "Q" },
  { id: "exchanges", label: "Exchanges", shortLabel: "RX" },
];

function idsForMode(mode: PracticeMode) {
  return itemsByMode[mode].map((item) => item.id);
}

function validatePlayableContent() {
  const errors = validateContent();
  for (const mode of Object.keys(itemsByMode) as PracticeMode[]) {
    for (const item of itemsByMode[mode]) {
      try {
        buildSemanticPlan(item.cw, item.pattern);
      } catch (error) {
        errors.push(`${item.id}: ${error instanceof Error ? error.message : "invalid CW"}`);
      }
    }
  }
  return errors;
}

const contentErrors = validatePlayableContent();

export default function App() {
  const [session, dispatch] = useReducer(
    sessionReducer,
    undefined,
    () => createSession("characters", idsForMode("characters")),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const autoPlayNextRef = useRef(false);
  const { settings, update: updateSettings } = useSettings();
  const audio = useAudioEngine();
  const stopAudio = audio.stop;
  const webMcpState = useRef({ mode: session.mode, settings });
  webMcpState.current = { mode: session.mode, settings };

  const itemMap = useMemo(
    () => new Map(itemsByMode[session.mode].map((item) => [item.id, item])),
    [session.mode],
  );
  const currentId = session.queue[session.index];
  const currentItem = currentId ? itemMap.get(currentId) : undefined;

  const playCurrent = useCallback(() => {
    if (!currentItem) return;
    void audio.play(
      {
        text: currentItem.cw,
        explicitPattern: currentItem.pattern,
        ...settings,
      },
      () => setHasPlayed(true),
    );
  }, [audio, currentItem, settings]);

  useEffect(() => {
    setHasPlayed(false);
    audio.stop();
    const shouldAutoPlay = autoPlayNextRef.current;
    autoPlayNextRef.current = false;
    if (shouldAutoPlay && currentItem) playCurrent();
    // The item id is the intentional reset boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, runKey]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.code !== "Space" || settingsOpen || !currentItem) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, button, textarea, select")) return;
      event.preventDefault();
      if (audio.status === "playing") audio.stop();
      else playCurrent();
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [audio, currentItem, playCurrent, settingsOpen]);

  const changeMode = (mode: PracticeMode) => {
    if (mode === session.mode) return;
    if (session.attempts > 0 && !window.confirm("Switch modes and start a new session?")) return;
    audio.stop();
    dispatch({ type: "RESET", mode, itemIds: idsForMode(mode) });
    setRunKey((key) => key + 1);
  };

  const resetSession = () => {
    if (session.attempts > 0 && !window.confirm("Clear this session and start again?")) return;
    audio.stop();
    dispatch({ type: "RESET", mode: session.mode, itemIds: idsForMode(session.mode) });
    setRunKey((key) => key + 1);
  };

  const retryMissed = () => {
    if (session.missed.length === 0) return;
    audio.stop();
    dispatch({ type: "RETRY_MISSED" });
    setRunKey((key) => key + 1);
  };

  const newRound = () => {
    audio.stop();
    dispatch({ type: "NEW_ROUND", itemIds: idsForMode(session.mode) });
    setRunKey((key) => key + 1);
  };

  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();

    const registration = context.registerTool(
      {
        name: "configure_cw_practice",
        title: "Configure CW practice",
        description: "Set the CW practice mode and audio speeds, then start a fresh visible session.",
        inputSchema: {
          type: "object",
          properties: {
            mode: { type: "string", enum: ["characters", "terms", "exchanges"] },
            characterWpm: { type: "integer", minimum: 5, maximum: 40 },
            effectiveWpm: { type: "integer", minimum: 5, maximum: 40 },
            frequency: { type: "integer", minimum: 300, maximum: 1000, multipleOf: 10 },
          },
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          if (!input || typeof input !== "object" || Array.isArray(input)) {
            throw new Error("Practice configuration must be an object.");
          }
          const value = input as Record<string, unknown>;
          const mode = value.mode ?? webMcpState.current.mode;
          if (!modes.some((candidate) => candidate.id === mode)) throw new Error("Invalid practice mode.");

          const characterWpm = value.characterWpm ?? webMcpState.current.settings.characterWpm;
          const effectiveWpm = value.effectiveWpm ?? webMcpState.current.settings.effectiveWpm;
          const frequency = value.frequency ?? webMcpState.current.settings.frequency;
          if (!Number.isInteger(characterWpm) || Number(characterWpm) < 5 || Number(characterWpm) > 40) {
            throw new Error("Character speed must be an integer from 5 to 40 WPM.");
          }
          if (!Number.isInteger(effectiveWpm) || Number(effectiveWpm) < 5 || Number(effectiveWpm) > Number(characterWpm)) {
            throw new Error("Effective speed must be an integer from 5 WPM through character speed.");
          }
          if (!Number.isInteger(frequency) || Number(frequency) < 300 || Number(frequency) > 1000 || Number(frequency) % 10 !== 0) {
            throw new Error("Frequency must be a multiple of 10 from 300 to 1000 Hz.");
          }

          const selectedMode = mode as PracticeMode;
          stopAudio();
          updateSettings({
            characterWpm: Number(characterWpm),
            effectiveWpm: Number(effectiveWpm),
            frequency: Number(frequency),
          });
          dispatch({ type: "RESET", mode: selectedMode, itemIds: idsForMode(selectedMode) });
          setRunKey((key) => key + 1);
          return { mode: selectedMode, characterWpm, effectiveWpm, frequency, session: "new" };
        },
      },
      { signal: lifecycle.signal },
    );
    void Promise.resolve(registration).catch(() => undefined);
    return () => lifecycle.abort();
  }, [stopAudio, updateSettings]);

  if (contentErrors.length > 0) {
    return (
      <main className="fatal-error">
        <p className="eyebrow">Content check failed</p>
        <h1>The practice library could not be loaded.</h1>
        <ul>{contentErrors.map((error) => <li key={error}>{error}</li>)}</ul>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="./" aria-label="CW Copy Room home">
          <span className="brand-mark" aria-hidden="true"><i /><b /><i /></span>
          <span><strong>CW</strong> Copy Room</span>
        </a>
        <div className="header-readout" aria-label="Current audio settings">
          <span><i aria-hidden="true" /> {settings.characterWpm} / {settings.effectiveWpm} WPM</span>
          <span>{settings.frequency} Hz</span>
        </div>
        <button className="settings-button" onClick={() => { audio.stop(); setSettingsOpen(true); }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M10 14v6" /></svg>
          Settings
        </button>
      </header>

      <nav className="mode-tabs" aria-label="Practice mode" role="tablist">
        {modes.map((mode) => (
          <button
            key={mode.id}
            role="tab"
            aria-selected={session.mode === mode.id}
            className={session.mode === mode.id ? "active" : ""}
            onClick={() => changeMode(mode.id)}
          >
            <span aria-hidden="true">{mode.shortLabel}</span>
            {mode.label}
            <small>{itemsByMode[mode.id].length}</small>
          </button>
        ))}
      </nav>

      <main className="workspace">
        <div className="practice-column">
          {audio.error && <div className="audio-error" role="alert">Audio could not start: {audio.error}</div>}
          {currentItem ? (
            <PracticeCard
              key={`${runKey}-${session.index}-${currentItem.id}`}
              item={currentItem}
              position={session.index + 1}
              total={session.queue.length}
              isRetry={session.isRetry}
              audioStatus={audio.status}
              hasPlayed={hasPlayed}
              onPlay={playCurrent}
              onStop={audio.stop}
              onGrade={(correct) => dispatch({ type: "GRADE", itemId: currentItem.id, correct })}
              onNext={() => {
                autoPlayNextRef.current = currentItem.mode !== "exchanges";
                dispatch({ type: "NEXT" });
              }}
            />
          ) : (
            <section className="round-complete">
              <span className="completion-mark" aria-hidden="true">✓</span>
              <p className="eyebrow">Round complete</p>
              <h1>{session.isRetry ? "Focused pass finished" : "You copied the full set"}</h1>
              <p>
                {session.missed.length === 0
                  ? "Clean copy. Nothing is waiting in the missed list."
                  : `${session.missed.length} ${session.missed.length === 1 ? "item is" : "items are"} ready for another pass.`}
              </p>
              <div className="completion-actions">
                <button className="primary-button" onClick={newRound}>Start another round</button>
                <button className="secondary-button" onClick={retryMissed} disabled={session.missed.length === 0}>Retry missed</button>
              </div>
            </section>
          )}
        </div>

        <SessionSummary
          correct={session.correct}
          attempts={session.attempts}
          missed={session.missed.length}
          isRetry={session.isRetry}
          onRetry={retryMissed}
          onReset={resetSession}
        />
      </main>

      <footer className="app-footer">
        <span>International Morse · PARIS timing</span>
        <span className="footer-signal" aria-hidden="true">· · · &nbsp; − − − &nbsp; · · ·</span>
        <span>Runs entirely in your browser</span>
      </footer>

      {settingsOpen && (
        <SettingsDialog
          settings={settings}
          audioStatus={audio.status}
          onChange={updateSettings}
          onClose={closeSettings}
          onTestTone={() => void audio.play({ text: "VVV", ...settings }, () => undefined)}
          onStop={audio.stop}
        />
      )}
    </div>
  );
}
