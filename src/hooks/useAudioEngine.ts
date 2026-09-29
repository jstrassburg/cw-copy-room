import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEngine, type PlaybackRequest } from "../audio/AudioEngine";

export type AudioStatus = "idle" | "playing" | "error";

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [error, setError] = useState("");

  const play = useCallback(async (request: PlaybackRequest, onComplete?: () => void) => {
    try {
      setError("");
      setStatus("playing");
      if (!engineRef.current) engineRef.current = new AudioEngine();
      await engineRef.current.play(request, () => {
        setStatus("idle");
        onComplete?.();
      });
    } catch (reason) {
      setStatus("error");
      setError(reason instanceof Error ? reason.message : "Audio could not start.");
    }
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setStatus("idle");
  }, []);

  useEffect(
    () => () => {
      engineRef.current?.dispose();
    },
    [],
  );

  return { status, error, play, stop };
}
