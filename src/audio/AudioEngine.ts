import { buildSemanticPlan } from "./morse";
import { applyTiming, totalDuration, type TimingSettings } from "./timing";

export interface PlaybackRequest extends TimingSettings {
  text: string;
  explicitPattern?: string;
  frequency: number;
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private finishTimer: number | null = null;
  private playbackToken = 0;

  private async ensureReady() {
    if (!this.context) {
      this.context = new AudioContext();
      this.oscillator = this.context.createOscillator();
      this.gain = this.context.createGain();
      this.oscillator.type = "sine";
      this.gain.gain.value = 0;
      this.oscillator.connect(this.gain);
      this.gain.connect(this.context.destination);
      this.oscillator.start();
    }
    if (this.context.state === "suspended") await this.context.resume();
  }

  async play(request: PlaybackRequest, onComplete: () => void): Promise<number> {
    await this.ensureReady();
    this.stop();

    const context = this.context!;
    const oscillator = this.oscillator!;
    const gain = this.gain!;
    const events = applyTiming(
      buildSemanticPlan(request.text, request.explicitPattern),
      request,
    );
    const duration = totalDuration(events);
    const startAt = context.currentTime + 0.045;
    const level = 0.2;
    const attack = Math.min(0.004, 0.18 * (1.2 / request.characterWpm));
    const token = ++this.playbackToken;
    let cursor = startAt;

    oscillator.frequency.cancelScheduledValues(context.currentTime);
    oscillator.frequency.setValueAtTime(request.frequency, context.currentTime);
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.setValueAtTime(0, context.currentTime);

    for (const event of events) {
      if (event.kind === "tone") {
        const end = cursor + event.duration;
        gain.gain.setValueAtTime(0, cursor);
        gain.gain.linearRampToValueAtTime(level, cursor + attack);
        gain.gain.setValueAtTime(level, Math.max(cursor + attack, end - attack));
        gain.gain.linearRampToValueAtTime(0, end);
      }
      cursor += event.duration;
    }

    this.finishTimer = window.setTimeout(() => {
      if (token === this.playbackToken) onComplete();
      this.finishTimer = null;
    }, (duration + 0.08) * 1000);

    return duration;
  }

  stop() {
    this.playbackToken += 1;
    if (this.finishTimer !== null) {
      window.clearTimeout(this.finishTimer);
      this.finishTimer = null;
    }
    if (this.context && this.gain) {
      this.gain.gain.cancelScheduledValues(this.context.currentTime);
      this.gain.gain.setValueAtTime(0, this.context.currentTime);
    }
  }

  dispose() {
    this.stop();
    this.oscillator?.stop();
    this.oscillator?.disconnect();
    this.gain?.disconnect();
    void this.context?.close();
    this.context = null;
    this.oscillator = null;
    this.gain = null;
  }
}
