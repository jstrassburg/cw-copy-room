import { useEffect, useRef } from "react";
import type { AudioStatus } from "../hooks/useAudioEngine";
import type { AppSettings } from "../model/settings";

interface SettingsDialogProps {
  settings: AppSettings;
  audioStatus: AudioStatus;
  onChange: (change: Partial<AppSettings>) => void;
  onClose: () => void;
  onTestTone: () => void;
  onStop: () => void;
}

interface RangeControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint: string;
  onChange: (value: number) => void;
}

function RangeControl({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
}: RangeControlProps) {
  return (
    <div className="range-control">
      <div className="range-heading">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>
          {value} {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <p>{hint}</p>
    </div>
  );
}

export function SettingsDialog({
  settings,
  audioStatus,
  onChange,
  onClose,
  onTestTone,
  onStop,
}: SettingsDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Receiver setup</p>
            <h2 id="settings-title">Practice settings</h2>
          </div>
          <button ref={closeRef} className="icon-button" onClick={onClose} aria-label="Close settings">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <RangeControl
          id="character-speed"
          label="Character speed"
          value={settings.characterWpm}
          min={5}
          max={40}
          step={1}
          unit="WPM"
          hint="Sets the rhythm inside each character."
          onChange={(characterWpm) => onChange({ characterWpm })}
        />
        <RangeControl
          id="effective-speed"
          label="Effective speed"
          value={settings.effectiveWpm}
          min={5}
          max={settings.characterWpm}
          step={1}
          unit="WPM"
          hint="A lower value adds Farnsworth spacing between characters and words."
          onChange={(effectiveWpm) => onChange({ effectiveWpm })}
        />
        <RangeControl
          id="tone-frequency"
          label="Tone frequency"
          value={settings.frequency}
          min={300}
          max={1000}
          step={10}
          unit="Hz"
          hint="Choose a pitch that is comfortable to copy."
          onChange={(frequency) => onChange({ frequency })}
        />

        <div className="timing-readout" aria-label="Current timing">
          <div><span>Character</span><strong>{settings.characterWpm}</strong></div>
          <div><span>Effective</span><strong>{settings.effectiveWpm}</strong></div>
          <div><span>Pitch</span><strong>{settings.frequency}</strong></div>
        </div>

        <button className="secondary-button full-width" onClick={audioStatus === "playing" ? onStop : onTestTone}>
          {audioStatus === "playing" ? "Stop tone" : "Test with VVV"}
        </button>
      </section>
    </div>
  );
}
