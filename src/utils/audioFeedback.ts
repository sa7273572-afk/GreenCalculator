/**
 * Lightweight Web Audio synthesizer for tactile calculator click feedback.
 * Works 100% offline, zero assets or external requests.
 */

let audioCtx: AudioContext | null = null;
let isAudioMuted = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playKeySound(type: 'number' | 'operator' | 'action' | 'clear' | 'error' = 'number') {
  if (isAudioMuted) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'operator':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
        break;

      case 'action': // e.g. Equals, Check
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.06); // E5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
        break;

      case 'clear':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
        break;

      case 'number':
      default:
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.03);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
    }
  } catch {
    // Graceful fallback if audio is disallowed
  }
}

export function toggleAudioMute(): boolean {
  isAudioMuted = !isAudioMuted;
  return isAudioMuted;
}

export function getIsAudioMuted(): boolean {
  return isAudioMuted;
}
