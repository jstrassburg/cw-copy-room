import { useCallback, useEffect, useState } from "react";
import {
  loadSettings,
  saveSettings,
  type AppSettings,
} from "../model/settings";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => saveSettings(settings), [settings]);

  const update = useCallback((change: Partial<AppSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...change };
      if (next.effectiveWpm > next.characterWpm) {
        next.effectiveWpm = next.characterWpm;
      }
      return next;
    });
  }, []);

  return { settings, update };
}
