import { useEffect, useRef, useState, type FormEvent } from "react";
import type { AudioStatus } from "../hooks/useAudioEngine";
import type { PracticeItem } from "../model/content";
import { isAcceptedAnswer } from "../model/settings";

interface PracticeCardProps {
  item: PracticeItem;
  position: number;
  total: number;
  isRetry: boolean;
  audioStatus: AudioStatus;
  hasPlayed: boolean;
  onPlay: () => void;
  onStop: () => void;
  onGrade: (correct: boolean) => void;
  onNext: () => void;
}

export function PracticeCard({
  item,
  position,
  total,
  isRetry,
  audioStatus,
  hasPlayed,
  onPlay,
  onStop,
  onGrade,
  onNext,
}: PracticeCardProps) {
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setAnswer("");
    setRevealed(false);
    setGraded(null);
  }, [item.id]);

  useEffect(() => {
    if (hasPlayed && item.mode !== "exchanges" && graded === null) inputRef.current?.focus();
  }, [hasPlayed, item.mode, graded]);

  useEffect(() => {
    if (graded !== null) nextRef.current?.focus();
  }, [graded]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!answer.trim() || graded !== null) return;
    const correct = isAcceptedAnswer(answer, item.acceptedAnswers);
    setGraded(correct);
    onGrade(correct);
  };

  const selfGrade = (correct: boolean) => {
    if (graded !== null) return;
    setGraded(correct);
    onGrade(correct);
  };

  const label = item.mode === "characters" ? "Character" : item.mode === "terms" ? "CW term" : "QSO exchange";
  const prompt = item.mode === "exchanges"
    ? "Copy one transmission"
    : item.mode === "characters"
      ? "Which character did you hear?"
      : "Which term did you hear?";

  return (
    <section className="practice-card" aria-labelledby="practice-title">
      <div className="practice-meta">
        <span className="mode-chip">{isRetry ? "Retry" : label}</span>
        <span>Item {Math.min(position, total)} of {total}</span>
      </div>

      <div className="signal-stage">
        <div className={`signal-lines ${audioStatus === "playing" ? "is-playing" : ""}`} aria-hidden="true">
          {[12, 26, 42, 20, 56, 34, 68, 28, 50, 18, 38, 14].map((height, index) => (
            <i key={index} style={{ "--bar-height": `${height}px` } as React.CSSProperties} />
          ))}
        </div>
        <button
          className={`play-button ${audioStatus === "playing" ? "is-playing" : ""}`}
          onClick={audioStatus === "playing" ? onStop : onPlay}
          aria-label={audioStatus === "playing" ? "Stop Morse audio" : hasPlayed ? "Replay Morse audio" : "Play Morse audio"}
        >
          {audioStatus === "playing" ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h8v8H8z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5z" /></svg>
          )}
        </button>
        <div className="signal-lines signal-lines-right" aria-hidden="true">
          {[18, 38, 14, 50, 28, 68, 34, 56, 20, 42, 26, 12].map((height, index) => (
            <i key={index} style={{ "--bar-height": `${height}px` } as React.CSSProperties} />
          ))}
        </div>
      </div>

      <div className="prompt-copy">
        <p className="eyebrow" aria-live="polite">
          {audioStatus === "playing" ? "Transmitting…" : hasPlayed ? "Ready to copy" : "Press play to begin"}
        </p>
        <h1 id="practice-title">{prompt}</h1>
        <p>{item.mode === "exchanges" ? "Listen for the calls, report, and shorthand." : "Type what you copied. Replays are free."}</p>
      </div>

      {item.mode !== "exchanges" ? (
        <form className="answer-form" onSubmit={submit}>
          <label className="sr-only" htmlFor="copy-answer">Your answer</label>
          <input
            ref={inputRef}
            id="copy-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={item.mode === "characters" ? "Type a character" : "Type the term"}
            autoComplete="off"
            spellCheck={false}
            disabled={graded !== null}
          />
          <button className="primary-button" type="submit" disabled={!answer.trim() || graded !== null}>Check copy</button>
        </form>
      ) : !revealed ? (
        <button className="primary-button reveal-button" onClick={() => setRevealed(true)} disabled={!hasPlayed}>
          Reveal transcript
        </button>
      ) : null}

      {(graded !== null || revealed) && (
        <div className={`feedback-panel ${graded === true ? "is-correct" : graded === false ? "is-missed" : ""}`} aria-live="polite">
          {item.mode !== "exchanges" && graded !== null && (
            <div className="feedback-status">
              <span>{graded ? "Solid copy" : "Add to retry"}</span>
              {!graded && answer && <small>You entered {answer.toUpperCase()}</small>}
            </div>
          )}
          <div className="answer-reveal">
            <span className="eyebrow">CW</span>
            <strong>{item.display}</strong>
            {item.meaning && <p>{item.meaning}</p>}
            {item.scenarioTitle && (
              <small>{item.scenarioTitle} · part {item.scenarioPosition} of {item.scenarioLength}</small>
            )}
          </div>

          {item.mode === "exchanges" && graded === null && (
            <div className="self-grade-actions">
              <button className="miss-button" onClick={() => selfGrade(false)}>Missed it</button>
              <button className="got-button" onClick={() => selfGrade(true)}>Got it</button>
            </div>
          )}
          {graded !== null && (
            <button ref={nextRef} className="next-button" onClick={onNext}>
              {item.mode === "exchanges" ? "Next item" : "Next item + play"}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
            </button>
          )}
        </div>
      )}

      <p className="keyboard-hint">
        <kbd>Space</kbd> play / stop
        {item.mode !== "exchanges" && <><span>·</span> <kbd>Enter</kbd> check / next + play</>}
      </p>
    </section>
  );
}
