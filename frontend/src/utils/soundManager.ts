// Synthesized sound effects using Web Audio API — no external files needed.
// Each sound is defined as a sequence of tones/noise bursts.

type SoundName =
  | "gameMusic"
  | "countdown"
  | "optionsReveal"
  | "correct"
  | "incorrect"
  | "streak"
  | "podiumFanfare"
  | "podiumReveal";

interface ToneStep {
  freq: number;
  duration: number;
  type: OscillatorType;
  gain?: number;
  delay?: number;
}

// Note frequencies
const N = {
  C2: 65,
  D2: 73,
  Eb2: 78,
  F2: 87,
  G2: 98,
  Ab2: 104,
  A2: 110,
  Bb2: 117,
  C3: 131,
  D3: 147,
  Eb3: 156,
  E3: 165,
  F3: 175,
  G3: 196,
  Ab3: 208,
  A3: 220,
  Bb3: 233,
  B3: 247,
  C4: 262,
  D4: 294,
  Eb4: 311,
  E4: 330,
  F4: 349,
  G4: 392,
  Ab4: 415,
  A4: 440,
  Bb4: 466,
  B4: 494,
  C5: 523,
  D5: 587,
  Eb5: 622,
  E5: 659,
  F5: 698,
  G5: 784,
  Ab5: 831,
  A5: 880,
  Bb5: 932,
  B5: 988,
  C6: 1047,
};

// Helpers
const b = 0.5; // beat = 0.5s at 120 BPM (Kahoot tempo)
const melody = (freq: number, delay: number, dur = 0.18): ToneStep => ({
  freq,
  duration: dur,
  type: "triangle",
  gain: 0.11,
  delay,
});
const bass = (freq: number, delay: number, dur = 0.4): ToneStep => ({
  freq,
  duration: dur,
  type: "sine",
  gain: 0.14,
  delay,
});
const chord = (freq: number, delay: number, dur = 0.12): ToneStep => ({
  freq,
  duration: dur,
  type: "square",
  gain: 0.04,
  delay,
});
const chordAt = (freqs: number[], delay: number, dur = 0.12): ToneStep[] =>
  freqs.map((f) => chord(f, delay, dur));
// Chord stab: short square wave hit
const stab = (freq: number, delay: number, dur = 0.15): ToneStep => ({
  freq,
  duration: dur,
  type: "square",
  gain: 0.05,
  delay,
});
// Chord hit helpers — original progression: Gm → Bb → Eb → F
const gmHit = (t: number): ToneStep[] => [
  stab(N.G3, t),
  stab(N.Bb3, t),
  stab(N.D4, t),
];
const bbHit = (t: number): ToneStep[] => [
  stab(N.Bb3, t),
  stab(N.D4, t),
  stab(N.F4, t),
];
const ebHit = (t: number): ToneStep[] => [
  stab(N.Eb4, t),
  stab(N.G4, t),
  stab(N.Bb4, t),
];
const fHit = (t: number): ToneStep[] => [
  stab(N.F3, t),
  stab(N.A3, t),
  stab(N.C4, t),
];

// 8th note = 0.25s at 120 BPM. Bar = 2s.
// Stab rhythm per bar: rest-CHORD-CHORD-rest | rest-CHORD-CHORD-rest
// Positions: 0.25, 0.50, 1.25, 1.50 (in seconds from bar start)
const barStabs = (
  hit: (t: number) => ToneStep[],
  barStart: number,
): ToneStep[] => [
  ...hit(barStart + 0.25),
  ...hit(barStart + 0.5),
  ...hit(barStart + 1.25),
  ...hit(barStart + 1.5),
];

const SOUND_DEFS: Record<SoundName, ToneStep[]> = {
  // Original quiz lobby groove — q=120, G minor, 4/4
  // "t-t ... t-t" offbeat chord stab pairs + walking bass
  // Progression: Gm → Bb → Eb → F (i → III → VI → VII in G minor)
  // 4 bars = 8 seconds loop
  gameMusic: [
    // Bass — G minor walking pattern
    bass(N.G2, 0, 0.45),
    bass(N.G2, 0.5, 0.2),
    bass(N.Bb2, 0.75, 0.15),
    bass(N.D3, 1.0, 0.4),
    bass(N.G2, 1.5, 0.2),
    bass(N.Bb2, 2.0, 0.45),
    bass(N.Bb2, 2.5, 0.2),
    bass(N.D3, 2.75, 0.15),
    bass(N.F3, 3.0, 0.4),
    bass(N.Bb2, 3.5, 0.2),
    bass(N.Eb3, 4.0, 0.45),
    bass(N.Eb3, 4.5, 0.2),
    bass(N.G3, 4.75, 0.15),
    bass(N.Bb3, 5.0, 0.4),
    bass(N.Eb3, 5.5, 0.2),
    bass(N.F2, 6.0, 0.45),
    bass(N.F2, 6.5, 0.2),
    bass(N.A2, 6.75, 0.15),
    bass(N.C3, 7.0, 0.4),
    bass(N.D3, 7.5, 0.2),

    // Gm chord stabs — bar 1 (0s-2s)
    ...barStabs(gmHit, 0),
    // Bb chord stabs — bar 2 (2s-4s)
    ...barStabs(bbHit, 2),
    // Eb chord stabs — bar 3 (4s-6s)
    ...barStabs(ebHit, 4),
    // F chord stabs — bar 4 (6s-8s)
    ...barStabs(fHit, 6),
  ],

  countdown: [
    { freq: 880, duration: 0.1, type: "square", gain: 0.1 },
    { freq: 440, duration: 0.06, type: "square", gain: 0.06, delay: 0.1 },
  ],

  optionsReveal: [
    { freq: 523, duration: 0.06, type: "triangle", gain: 0.15 },
    { freq: 784, duration: 0.08, type: "triangle", gain: 0.12, delay: 0.05 },
    { freq: 1047, duration: 0.1, type: "triangle", gain: 0.08, delay: 0.1 },
  ],

  correct: [
    // Quick rising triad with layered harmonics
    { freq: N.C5, duration: 0.1, type: "sine", gain: 0.2 },
    { freq: N.E4, duration: 0.1, type: "triangle", gain: 0.08 },
    { freq: N.E5, duration: 0.1, type: "sine", gain: 0.2, delay: 0.08 },
    { freq: N.G4, duration: 0.1, type: "triangle", gain: 0.08, delay: 0.08 },
    { freq: N.G5, duration: 0.15, type: "sine", gain: 0.22, delay: 0.16 },
    { freq: N.C5, duration: 0.15, type: "triangle", gain: 0.1, delay: 0.16 },
    { freq: N.C6, duration: 0.25, type: "sine", gain: 0.18, delay: 0.26 },
    { freq: N.E5, duration: 0.25, type: "triangle", gain: 0.08, delay: 0.26 },
  ],

  incorrect: [
    { freq: 330, duration: 0.15, type: "sawtooth", gain: 0.12 },
    { freq: 165, duration: 0.12, type: "sine", gain: 0.1 },
    { freq: 277, duration: 0.2, type: "sawtooth", gain: 0.1, delay: 0.12 },
    { freq: 139, duration: 0.2, type: "sine", gain: 0.08, delay: 0.12 },
  ],

  streak: [
    // Fast ascending arpeggio with octave doubling
    { freq: N.C5, duration: 0.07, type: "sine", gain: 0.18 },
    { freq: N.C4, duration: 0.07, type: "triangle", gain: 0.06 },
    { freq: N.E5, duration: 0.07, type: "sine", gain: 0.18, delay: 0.06 },
    { freq: N.G5, duration: 0.07, type: "sine", gain: 0.2, delay: 0.12 },
    { freq: N.C6, duration: 0.15, type: "sine", gain: 0.22, delay: 0.18 },
    { freq: N.E5, duration: 0.15, type: "triangle", gain: 0.08, delay: 0.18 },
    { freq: N.G5, duration: 0.15, type: "triangle", gain: 0.06, delay: 0.18 },
  ],

  // Triumphant fanfare — layered chords building to climax (~2.5s)
  podiumFanfare: [
    // Staccato build
    ...chordAt([N.C4, N.E4, N.G4], 0, 0.15),
    bass(N.C3, 0, 0.15),
    ...chordAt([N.C4, N.E4, N.G4], 0.2, 0.15),
    bass(N.C3, 0.2, 0.15),
    ...chordAt([N.C4, N.E4, N.G4], 0.4, 0.15),
    bass(N.C3, 0.4, 0.15),
    // Rise
    ...chordAt([N.F4, N.A4, N.C5], 0.65, 0.2),
    bass(N.F2, 0.65, 0.2),
    melody(N.C5, 0.65, 0.2),
    // Bigger
    ...chordAt([N.G4, N.B4, N.D5], 0.9, 0.25),
    bass(N.G2, 0.9, 0.25),
    melody(N.D5, 0.9, 0.25),
    // Climax — big C major chord with octave doubling
    ...chordAt([N.C4, N.E4, N.G4], 1.25, 0.5),
    ...chordAt([N.C5, N.E5, N.G5], 1.25, 0.5),
    bass(N.C3, 1.25, 0.5),
    bass(N.C2, 1.25, 0.5),
    melody(N.C6, 1.25, 0.5),
    melody(N.G5, 1.25, 0.5),
  ],

  // Podium reveal — dramatic rising drumroll build (~4.5s)
  // Accelerating snare-like hits with rising chord stabs, ending in a big hit
  podiumReveal: [
    // Phase 1: Slow hits — 3rd place build (0–1.5s)
    bass(N.C3, 0, 0.2),
    ...chordAt([N.C4, N.Eb4, N.G4], 0, 0.15), // C minor — tension
    bass(N.C3, 0.5, 0.2),
    ...chordAt([N.C4, N.Eb4, N.G4], 0.5, 0.15),
    bass(N.C3, 1.0, 0.2),
    ...chordAt([N.C4, N.Eb4, N.G4], 1.0, 0.15),

    // Phase 2: Faster hits — 2nd place build (1.5–3.0s)
    bass(N.Eb3, 1.5, 0.15),
    ...chordAt([N.Eb4, N.G4, N.Bb4], 1.5, 0.12), // Eb major — lifting
    bass(N.Eb3, 1.85, 0.15),
    ...chordAt([N.Eb4, N.G4, N.Bb4], 1.85, 0.12),
    bass(N.F3, 2.2, 0.15),
    ...chordAt([N.F4, N.A4, N.C5], 2.2, 0.12), // F major — rising
    bass(N.F3, 2.5, 0.15),
    ...chordAt([N.F4, N.A4, N.C5], 2.5, 0.12),
    bass(N.G3, 2.75, 0.15),
    ...chordAt([N.G4, N.B4, N.D5], 2.75, 0.12), // G major — dominant

    // Phase 3: Rapid fire — 1st place build (3.0–4.2s)
    melody(N.G5, 3.0, 0.08),
    bass(N.G3, 3.0, 0.12),
    melody(N.A5, 3.15, 0.08),
    melody(N.B5, 3.3, 0.08),
    bass(N.G3, 3.3, 0.12),
    melody(N.C6, 3.45, 0.08),
    melody(N.C6, 3.55, 0.08),
    bass(N.G3, 3.55, 0.12),
    melody(N.C6, 3.65, 0.08),
    melody(N.C6, 3.72, 0.08),
    melody(N.C6, 3.79, 0.08),
    melody(N.C6, 3.86, 0.08),
    bass(N.G3, 3.86, 0.12),
    melody(N.C6, 3.93, 0.08),
    melody(N.C6, 4.0, 0.08),

    // Climax — big C major resolution (4.1s)
    ...chordAt([N.C4, N.E4, N.G4], 4.1, 0.6),
    ...chordAt([N.C5, N.E5, N.G5], 4.1, 0.6),
    bass(N.C3, 4.1, 0.6),
    bass(N.C2, 4.1, 0.6),
    melody(N.C6, 4.1, 0.6),
    melody(N.G5, 4.1, 0.6),
    melody(N.E5, 4.1, 0.6),
  ],
};

interface TrackedNode {
  osc: OscillatorNode;
  gain: GainNode;
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;
  private activeNodes: Set<TrackedNode> = new Set();
  private loopNodes: Set<TrackedNode> = new Set();
  private loopTimers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private activeLoops: Map<string, { name: SoundName; intervalMs: number }> =
    new Map();

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopAll();
      for (const [key, timer] of this.loopTimers) {
        clearInterval(timer);
        this.loopTimers.delete(key);
      }
    } else {
      // Restart any loops that were active before muting
      const loopsToRestart = [...this.activeLoops.values()];
      for (const loop of loopsToRestart) {
        this.playLoop(loop.name, loop.intervalMs);
      }
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  play(name: SoundName) {
    if (this.muted) return;
    this.scheduleAt(name, this.getContext().currentTime, this.activeNodes);
  }

  // Schedule a sound at a specific audio-clock time into a given node set
  private scheduleAt(
    name: SoundName,
    baseTime: number,
    nodeSet: Set<TrackedNode>,
  ) {
    const steps = SOUND_DEFS[name];
    if (!steps) return;

    const ctx = this.getContext();

    for (const step of steps) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = step.type;
      osc.frequency.value = step.freq;

      const volume = step.gain ?? 0.2;
      const startTime = baseTime + (step.delay ?? 0);
      const endTime = startTime + step.duration;

      gainNode.gain.setValueAtTime(volume, startTime);
      // Fade out to avoid clicks
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(endTime + 0.05);

      const tracked: TrackedNode = { osc, gain: gainNode };
      nodeSet.add(tracked);
      osc.onended = () => {
        nodeSet.delete(tracked);
        gainNode.disconnect();
        osc.disconnect();
      };
    }
  }

  // Play a sound in a seamless loop using the audio clock for scheduling.
  // The JS timer only drives a look-ahead scheduler — actual note times are
  // computed from AudioContext.currentTime so loop boundaries are sample-accurate.
  playLoop(name: SoundName, intervalMs: number) {
    this.stopLoop(name);
    this.activeLoops.set(name, { name, intervalMs });
    if (this.muted) return;

    const ctx = this.getContext();
    const loopDuration = intervalMs / 1000;
    let nextLoopTime = ctx.currentTime;

    // Schedule first iteration immediately
    this.scheduleAt(name, nextLoopTime, this.loopNodes);
    nextLoopTime += loopDuration;

    // Look-ahead scheduler: check frequently, pre-schedule next iteration
    // before the current one ends so there's never a gap.
    const LOOK_AHEAD_S = 0.5;
    const CHECK_MS = 200;

    const timer = setInterval(() => {
      if (this.muted) {
        const t = this.loopTimers.get(name);
        if (t) {
          clearInterval(t);
          this.loopTimers.delete(name);
        }
        return;
      }
      const now = this.getContext().currentTime;
      while (nextLoopTime < now + LOOK_AHEAD_S) {
        this.scheduleAt(name, nextLoopTime, this.loopNodes);
        nextLoopTime += loopDuration;
      }
    }, CHECK_MS);
    this.loopTimers.set(name, timer);
  }

  private killNodes(nodeSet: Set<TrackedNode>) {
    for (const { osc, gain } of nodeSet) {
      try {
        osc.stop(0);
      } catch {
        /* already stopped */
      }
      try {
        osc.disconnect();
      } catch {
        /* already disconnected */
      }
      try {
        gain.disconnect();
      } catch {
        /* already disconnected */
      }
    }
    nodeSet.clear();
  }

  stopLoop(name: SoundName) {
    this.activeLoops.delete(name);
    const timer = this.loopTimers.get(name);
    if (timer) {
      clearInterval(timer);
      this.loopTimers.delete(name);
    }
    this.killNodes(this.loopNodes);
  }

  stopAll() {
    this.killNodes(this.activeNodes);
    this.killNodes(this.loopNodes);
  }
}

export const soundManager = new SoundManager();
export type { SoundName };
