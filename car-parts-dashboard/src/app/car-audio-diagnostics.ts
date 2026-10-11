/**
 * CarAudioDiagnosticsEngine
 * Native browser Web Audio API synthesizer for automotive mechanical diagnostics.
 * Synthesizes realistic mechanical operation & component failure sounds in real-time.
 * 100% offline, zero external audio asset dependencies.
 */
export class CarAudioDiagnosticsEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: { stop: () => void }[] = [];
  private currentPartId: string | null = null;
  private currentType: 'normal' | 'failure' | null = null;

  private initCtx(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  stopAll(): void {
    for (const node of this.activeNodes) {
      try {
        node.stop();
      } catch {
        // node already stopped
      }
    }
    this.activeNodes = [];
    this.currentPartId = null;
    this.currentType = null;
  }

  isPlaying(): boolean {
    return this.activeNodes.length > 0;
  }

  getCurrentAudio(): { partId: string | null; type: 'normal' | 'failure' | null } {
    return { partId: this.currentPartId, type: this.currentType };
  }

  play(partId: string, type: 'normal' | 'failure'): void {
    this.stopAll();
    const ctx = this.initCtx();
    this.currentPartId = partId;
    this.currentType = type;

    switch (partId) {
      case 'Brake Rotors':
      case 'Brake Pads':
        type === 'failure' ? this.synthBrakeFailure(ctx) : this.synthBrakeNormal(ctx);
        break;
      case 'Alternator':
        type === 'failure' ? this.synthAlternatorFailure(ctx) : this.synthAlternatorNormal(ctx);
        break;
      case 'Shock Absorbers':
        type === 'failure' ? this.synthShockFailure(ctx) : this.synthShockNormal(ctx);
        break;
      case 'Spark Plugs':
        type === 'failure' ? this.synthSparkFailure(ctx) : this.synthSparkNormal(ctx);
        break;
      case 'Battery':
        type === 'failure' ? this.synthBatteryFailure(ctx) : this.synthBatteryNormal(ctx);
        break;
      case 'Engine Block':
        type === 'failure' ? this.synthEngineKnock(ctx) : this.synthEngineNormal(ctx);
        break;
      case 'Air Filter':
      case 'Cabin Air Filter':
      case 'Oil Filter':
        type === 'failure' ? this.synthChokedFilter(ctx) : this.synthNormalAirflow(ctx);
        break;
      default:
        type === 'failure' ? this.synthBeltSqueal(ctx) : this.synthBeltNormal(ctx);
        break;
    }
  }

  // ==========================================
  // BRAKES: Squeal vs Smooth
  // ==========================================
  private synthBrakeFailure(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 2.8;

    // 1. High frequency wear tab squeal (3,200 Hz with FM jitter)
    const squealOsc = ctx.createOscillator();
    squealOsc.type = 'sawtooth';
    squealOsc.frequency.setValueAtTime(3200, now);
    squealOsc.frequency.linearRampToValueAtTime(3450, now + 0.4);
    squealOsc.frequency.linearRampToValueAtTime(3120, now + 1.6);
    squealOsc.frequency.linearRampToValueAtTime(2950, now + duration);

    const squealLfo = ctx.createOscillator();
    squealLfo.frequency.setValueAtTime(22, now);
    const squealLfoGain = ctx.createGain();
    squealLfoGain.gain.setValueAtTime(140, now);
    squealLfo.connect(squealOsc.frequency);

    const squealGain = ctx.createGain();
    squealGain.gain.setValueAtTime(0, now);
    squealGain.gain.linearRampToValueAtTime(0.18, now + 0.1);
    squealGain.gain.setValueAtTime(0.18, now + duration - 0.4);
    squealGain.gain.linearRampToValueAtTime(0, now + duration);

    squealOsc.connect(squealGain);
    squealGain.connect(ctx.destination);

    // 2. Grinding metal-on-metal noise buffer
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(450, now);
    noiseFilter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.22, now + 0.15);
    noiseGain.gain.linearRampToValueAtTime(0, now + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    squealOsc.start(now);
    squealLfo.start(now);
    noise.start(now);

    squealOsc.stop(now + duration);
    squealLfo.stop(now + duration);
    noise.stop(now + duration);

    this.registerNode(squealOsc, noise);
  }

  private synthBrakeNormal(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 2.0;

    // Smooth friction whoosh with gentle deceleration
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
    this.registerNode(noise);
  }

  // ==========================================
  // ALTERNATOR: Bearing Whine vs Quiet Stator
  // ==========================================
  private synthAlternatorFailure(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 3.0;

    // High-pitched needle bearing whine tracking RPM acceleration
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(1750, now + 1.6);
    osc.frequency.exponentialRampToValueAtTime(920, now + duration);

    // Diode rectification 12-pulse harmonic buzz
    const buzz = ctx.createOscillator();
    buzz.type = 'sawtooth';
    buzz.frequency.setValueAtTime(180, now);
    buzz.frequency.exponentialRampToValueAtTime(380, now + 1.6);

    const buzzGain = ctx.createGain();
    buzzGain.gain.setValueAtTime(0.05, now);

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.01, now);
    mainGain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    mainGain.gain.setValueAtTime(0.2, now + duration - 0.4);
    mainGain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(mainGain);
    buzz.connect(buzzGain);
    buzzGain.connect(mainGain);
    mainGain.connect(ctx.destination);

    osc.start(now);
    buzz.start(now);
    osc.stop(now + duration);
    buzz.stop(now + duration);

    this.registerNode(osc, buzz);
  }

  private synthAlternatorNormal(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 2.5;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.3);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
    this.registerNode(osc);
  }

  // ==========================================
  // SHOCK ABSORBERS: Hydraulic Thud vs Soft Rebound
  // ==========================================
  private synthShockFailure(ctx: AudioContext): void {
    const now = ctx.currentTime;
    // Series of 2 harsh bottoming-out thuds over bumps
    [0.1, 1.2].forEach((offset) => {
      const hitTime = now + offset;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(85, hitTime);
      osc.frequency.exponentialRampToValueAtTime(32, hitTime + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, hitTime);
      gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(hitTime);
      osc.stop(hitTime + 0.4);
      this.registerNode(osc);
    });
  }

  private synthShockNormal(ctx: AudioContext): void {
    const now = ctx.currentTime;
    // Smooth, damped hydraulic compression & slow rebound
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 1.5);
    this.registerNode(noise);
  }

  // ==========================================
  // SPARK PLUGS: Engine Misfire vs Smooth Purr
  // ==========================================
  private synthSparkFailure(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 3.0;

    // Stumbling 4-stroke cycle with missing cylinder combustion strokes
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(32, now);

    const stutterLfo = ctx.createOscillator();
    stutterLfo.type = 'square';
    stutterLfo.frequency.setValueAtTime(5.5, now); // 5.5 Hz stutter

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.5, now);
    stutterLfo.connect(lfoGain);

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.2, now);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);

    osc.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(ctx.destination);

    osc.start(now);
    stutterLfo.start(now);
    osc.stop(now + duration);
    stutterLfo.stop(now + duration);
    this.registerNode(osc, stutterLfo);
  }

  private synthSparkNormal(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 2.5;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(30, now); // smooth ~850 RPM idle

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(110, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
    this.registerNode(osc);
  }

  // ==========================================
  // BATTERY: Sluggish Weak Crank vs Instant Fire
  // ==========================================
  private synthBatteryFailure(ctx: AudioContext): void {
    const now = ctx.currentTime;
    // 3 sluggish slow-cranks that sag in pitch as voltage drops to 9V
    [0.1, 0.9, 1.8].forEach((offset, idx) => {
      const crankTime = now + offset;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65 - idx * 12, crankTime);
      osc.frequency.linearRampToValueAtTime(38 - idx * 10, crankTime + 0.45);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25 - idx * 0.04, crankTime);
      gain.gain.linearRampToValueAtTime(0.001, crankTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(crankTime);
      osc.stop(crankTime + 0.52);
      this.registerNode(osc);
    });
  }

  private synthBatteryNormal(ctx: AudioContext): void {
    const now = ctx.currentTime;
    // Crisp fast starter turn (180 RPM) into instant engine firing
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.linearRampToValueAtTime(45, now + 0.35);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
    this.registerNode(osc);
  }

  // ==========================================
  // ENGINE BLOCK: Rod Knock vs Smooth Idle
  // ==========================================
  private synthEngineKnock(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 2.6;
    const interval = 0.18; // ~14 Hz double-stroke knock
    const count = Math.floor(duration / interval);

    for (let i = 0; i < count; i++) {
      const hitTime = now + i * interval;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, hitTime);
      osc.frequency.exponentialRampToValueAtTime(70, hitTime + 0.06);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35, hitTime);
      gain.gain.exponentialRampToValueAtTime(0.001, hitTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(hitTime);
      osc.stop(hitTime + 0.09);
      this.registerNode(osc);
    }
  }

  private synthEngineNormal(ctx: AudioContext): void {
    this.synthSparkNormal(ctx);
  }

  // ==========================================
  // FILTERS: Choked Suction vs Smooth Airflow
  // ==========================================
  private synthChokedFilter(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 2.4;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.linearRampToValueAtTime(840, now + 1.2);
    osc.frequency.linearRampToValueAtTime(560, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
    this.registerNode(osc);
  }

  private synthNormalAirflow(ctx: AudioContext): void {
    this.synthShockNormal(ctx);
  }

  // ==========================================
  // BELT: High-pitch Screech vs Smooth Grip
  // ==========================================
  private synthBeltSqueal(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 2.2;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.linearRampToValueAtTime(2700, now + 0.8);
    osc.frequency.linearRampToValueAtTime(2100, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
    this.registerNode(osc);
  }

  private synthBeltNormal(ctx: AudioContext): void {
    this.synthAlternatorNormal(ctx);
  }

  private registerNode(...nodes: { stop: (time?: number) => void }[]): void {
    for (const n of nodes) {
      this.activeNodes.push({
        stop: () => {
          try {
            n.stop();
          } catch {
            // ignore
          }
        },
      });
    }
  }
}
