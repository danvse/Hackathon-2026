/**
 * generate-car-audio.js
 * High-Fidelity Automotive Physical Acoustic Audio Generator
 * Generates authentic 44.1 kHz 16-bit PCM WAV audio files for real-world car failure diagnostics.
 * Powered by DSP physical modeling: resonant bandpass banks, pink/granular contact noise,
 * crankcase impact acoustics, bearing chatter, and combustion harmonic stacks.
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUTPUT_DIR = path.resolve(__dirname, '../public/audio');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ==========================================
// DSP HELPERS & BIQUAD FILTERS
// ==========================================

function createBiquad(type, freq, Q, sampleRate = SAMPLE_RATE) {
  const w0 = (2 * Math.PI * freq) / sampleRate;
  const cosw0 = Math.cos(w0);
  const sinw0 = Math.sin(w0);
  const alpha = sinw0 / (2 * Q);

  let b0 = 0, b1 = 0, b2 = 0, a0 = 1, a1 = 0, a2 = 0;

  switch (type) {
    case 'bandpass':
      b0 = sinw0 / 2;
      b1 = 0;
      b2 = -sinw0 / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'lowpass':
      b0 = (1 - cosw0) / 2;
      b1 = 1 - cosw0;
      b2 = (1 - cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'highpass':
      b0 = (1 + cosw0) / 2;
      b1 = -(1 + cosw0);
      b2 = (1 + cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
    case 'notch':
      b0 = 1;
      b1 = -2 * cosw0;
      b2 = 1;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
      break;
  }

  // Normalize by a0
  const nb0 = b0 / a0;
  const nb1 = b1 / a0;
  const nb2 = b2 / a0;
  const na1 = a1 / a0;
  const na2 = a2 / a0;

  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

  return {
    process(input) {
      const output = nb0 * input + nb1 * x1 + nb2 * x2 - na1 * y1 - na2 * y2;
      x2 = x1;
      x1 = input;
      y2 = y1;
      y1 = output;
      return output;
    }
  };
}

class PinkNoiseGenerator {
  constructor() {
    this.b0 = 0; this.b1 = 0; this.b2 = 0;
    this.b3 = 0; this.b4 = 0; this.b5 = 0; this.b6 = 0;
  }
  next() {
    const white = Math.random() * 2 - 1;
    this.b0 = 0.99886 * this.b0 + white * 0.0555179;
    this.b1 = 0.99332 * this.b1 + white * 0.0750759;
    this.b2 = 0.96900 * this.b2 + white * 0.1538520;
    this.b3 = 0.86650 * this.b3 + white * 0.3104856;
    this.b4 = 0.55000 * this.b4 + white * 0.5329522;
    this.b5 = -0.7616 * this.b5 - white * 0.0168980;
    const pink = this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362;
    this.b6 = white * 0.115926;
    return pink * 0.12;
  }
}

function writeWavFile(filename, samples, sampleRate = SAMPLE_RATE) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Peak normalization with soft limiter
  let maxPeak = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > maxPeak) maxPeak = abs;
  }
  const gain = maxPeak > 0 ? Math.min(1.0, 0.88 / maxPeak) : 1.0;

  for (let i = 0; i < samples.length; i++) {
    let s = samples[i] * gain;
    // Soft knee limiter
    if (s > 0.95) s = 0.95 + (s - 0.95) * 0.2;
    else if (s < -0.95) s = -0.95 + (s + 0.95) * 0.2;
    s = Math.max(-1, Math.min(1, s));

    const intVal = s < 0 ? s * 32768 : s * 32767;
    buffer.writeInt16LE(Math.round(intVal), 44 + i * 2);
  }

  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Generated: ${filename} (${(dataSize / 1024).toFixed(1)} KB, ${(samples.length / sampleRate).toFixed(2)}s)`);
}

// ==========================================
// 1. BRAKES: Wear Tab Screech & Cast Iron Grind
// ==========================================

function generateBrakeFailure() {
  const duration = 3.2;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  // Acoustic resonators for the steel wear tab (3,180 Hz and 3,420 Hz with high Q)
  const squealFilter1 = createBiquad('bandpass', 3180, 22);
  const squealFilter2 = createBiquad('bandpass', 3420, 26);
  // Rotor grinding friction filters (cast iron contact)
  const grindFilter1 = createBiquad('bandpass', 460, 3.5);
  const grindFilter2 = createBiquad('bandpass', 820, 4.0);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Envelope: braking starts, reaches max pressure, gently releases
    const env = Math.min(1, t / 0.2) * Math.min(1, (duration - t) / 0.35);

    // Rotational wobble: 13.5 Hz wheel rotation with micro-jitter
    const rotSpeed = 13.5 * (1 - 0.25 * (t / duration)); // decelerating
    const wobble = 0.65 + 0.35 * Math.sin(2 * Math.PI * rotSpeed * t);

    const noise = pink.next();
    const granularContact = (Math.random() < 0.08 ? (Math.random() * 2 - 1) * 2.2 : 0) + noise;

    // Resonant wear tab squeal
    const squeal1 = squealFilter1.process(noise);
    const squeal2 = squealFilter2.process(noise);
    const squealTotal = (squeal1 * 12.0 + squeal2 * 9.0) * wobble;

    // Grinding cast-iron friction
    const grind1 = grindFilter1.process(granularContact);
    const grind2 = grindFilter2.process(granularContact);
    const grindTotal = (grind1 * 2.2 + grind2 * 1.6) * (0.8 + 0.2 * wobble);

    out[i] = (squealTotal * 0.65 + grindTotal * 0.5) * env;
  }

  writeWavFile('brakes-failure.wav', out);
}

function generateBrakeNormal() {
  const duration = 2.4;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  // Smooth, damped low-pass friction
  const lp1 = createBiquad('lowpass', 580, 0.7);
  const bp1 = createBiquad('bandpass', 240, 1.8);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    // Deceleration curve: friction ramps up smoothly and tapers to complete stop
    const stopFactor = Math.max(0, 1 - Math.pow(t / duration, 1.5));
    const env = Math.min(1, t / 0.3) * stopFactor;

    const noise = pink.next();
    const lowFriction = bp1.process(noise) * 1.5;
    const smoothPadRub = lp1.process(noise) * 0.9;

    out[i] = (lowFriction + smoothPadRub) * env * 0.7;
  }

  writeWavFile('brakes-normal.wav', out);
}

// ==========================================
// 2. ALTERNATOR: Bearing Whine vs Quiet Purr
// ==========================================

function generateAlternatorFailure() {
  const duration = 3.2;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  const bearingRingFilter = createBiquad('bandpass', 1420, 18);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.15) * Math.min(1, (duration - t) / 0.3);

    // RPM sweep: accelerating from idle (~850 Hz) up to high rev (~1650 Hz), then dropping
    const rpmPitch = 850 + 800 * Math.sin(Math.PI * (t / duration));

    // Stator slot electromagnetic whine + high harmonics
    const statorWhine = Math.sin(2 * Math.PI * rpmPitch * t) * 0.5 +
                        Math.sin(2 * Math.PI * (rpmPitch * 2) * t) * 0.25 +
                        Math.sin(2 * Math.PI * (rpmPitch * 3) * t) * 0.12;

    // Bearing race micro-pitting chatter (mechanical rattling at ball-pass frequency ~48 Hz)
    const chatterLfo = 0.7 + 0.3 * Math.sin(2 * Math.PI * 48 * t);
    const noise = pink.next();
    const bearingRing = bearingRingFilter.process(noise) * 3.5;

    out[i] = (statorWhine * chatterLfo * 0.6 + bearingRing * 0.35) * env;
  }

  writeWavFile('alternator-failure.wav', out);
}

function generateAlternatorNormal() {
  const duration = 2.5;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  const humFilter = createBiquad('bandpass', 180, 2.0);
  const airFilter = createBiquad('lowpass', 450, 0.8);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.25) * Math.min(1, (duration - t) / 0.3);

    const noise = pink.next();
    const statorHum = (Math.sin(2 * Math.PI * 180 * t) * 0.3 + Math.sin(2 * Math.PI * 360 * t) * 0.12);
    const airflow = airFilter.process(noise) * 0.35;
    const magneticPurr = humFilter.process(noise) * 0.4;

    out[i] = (statorHum + airflow + magneticPurr) * env * 0.5;
  }

  writeWavFile('alternator-normal.wav', out);
}

// ==========================================
// 3. ENGINE: Rod Knock vs Combustion Purr
// ==========================================

function generateEngineKnock() {
  const duration = 3.2;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  const knockRate = 13.8; // ~14 knocks per second (typical bad rod at idle)
  const knockInterval = 1 / knockRate;

  // Background engine idle base
  const engineBaseFilter = createBiquad('lowpass', 240, 1.2);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.1) * Math.min(1, (duration - t) / 0.25);

    // 1. Heavy Metallic Connecting Rod Strike
    const cycleTime = t % knockInterval;
    let knockPulse = 0;

    // Primary strike on power stroke combustion
    if (cycleTime < 0.045) {
      const strikeT = cycleTime;
      // High-frequency metallic hammer ping (470 Hz decaying fast in 18ms)
      const ping = Math.sin(2 * Math.PI * 470 * strikeT) * Math.exp(-strikeT / 0.015);
      // Low-frequency crankshaft journal shockwave (82 Hz decaying in 35ms)
      const thud = Math.sin(2 * Math.PI * 82 * strikeT) * Math.exp(-strikeT / 0.035);
      // Metallic contact crunch
      const crunch = (Math.random() * 2 - 1) * Math.exp(-strikeT / 0.008);

      knockPulse = ping * 0.65 + thud * 0.55 + crunch * 0.25;
    }
    // Subtle secondary rebound tap (journal slop on stroke reversal)
    else if (cycleTime > 0.035 && cycleTime < 0.065) {
      const revT = cycleTime - 0.035;
      knockPulse = Math.sin(2 * Math.PI * 520 * revT) * Math.exp(-revT / 0.012) * 0.25;
    }

    // 2. Underlying engine idle
    const idleNoise = engineBaseFilter.process(pink.next()) * 0.25;
    const idleCombustion = Math.sin(2 * Math.PI * 27.6 * t) * 0.15;

    out[i] = (knockPulse * 1.1 + idleNoise + idleCombustion) * env;
  }

  writeWavFile('engine-knock.wav', out);
}

function generateEngineNormal() {
  const duration = 3.0;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  const exhaustFilter = createBiquad('bandpass', 78, 2.5);
  const midBlockFilter = createBiquad('bandpass', 156, 3.0);
  const airFilter = createBiquad('lowpass', 280, 0.9);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.2) * Math.min(1, (duration - t) / 0.3);

    // 4-cylinder engine idle (approx 830 RPM = 27.6 Hz fundamental combustion frequency)
    const f0 = 27.6;
    // Harmonic stack designed to be richly audible on laptop speakers!
    const harmonics = (
      Math.sin(2 * Math.PI * f0 * t) * 0.35 +
      Math.sin(2 * Math.PI * (f0 * 2) * t) * 0.45 + // 55.2 Hz
      Math.sin(2 * Math.PI * (f0 * 3) * t) * 0.38 + // 82.8 Hz
      Math.sin(2 * Math.PI * (f0 * 4) * t) * 0.28 + // 110.4 Hz
      Math.sin(2 * Math.PI * (f0 * 6) * t) * 0.20 + // 165.6 Hz
      Math.sin(2 * Math.PI * (f0 * 8) * t) * 0.12   // 220.8 Hz
    );

    // Subtle rhythmic exhaust pulse puff
    const pulseTrain = Math.pow(Math.max(0, Math.sin(2 * Math.PI * f0 * t)), 4) * 0.3;

    // Air draft & engine bay acoustics
    const noise = pink.next();
    const exhaust = exhaustFilter.process(noise) * 0.35;
    const mid = midBlockFilter.process(noise) * 0.25;
    const air = airFilter.process(noise) * 0.2;

    out[i] = (harmonics * 0.45 + pulseTrain + exhaust + mid + air) * env * 0.75;
  }

  writeWavFile('engine-normal.wav', out);
}

// ==========================================
// 4. SPARK PLUGS: Engine Misfire vs Pure Combustion
// ==========================================

function generateSparkFailure() {
  const duration = 3.2;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  const exhaustFilter = createBiquad('bandpass', 92, 2.2);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.15) * Math.min(1, (duration - t) / 0.25);

    // Misfire stumble cadence: missing cylinder combustion drops RPM then surges
    const stumbleRate = 6.9; // 1 in 4 cylinders dead
    const stumbleCycle = (t * stumbleRate) % 1.0;
    const isMisfiring = stumbleCycle < 0.28;

    const currentRPM = isMisfiring ? 22.0 : 27.6;
    const cylinderCut = isMisfiring ? 0.25 : 1.0;

    const harmonics = (
      Math.sin(2 * Math.PI * currentRPM * t) * 0.3 +
      Math.sin(2 * Math.PI * (currentRPM * 2) * t) * 0.42 +
      Math.sin(2 * Math.PI * (currentRPM * 3) * t) * 0.32
    ) * cylinderCut;

    // Raw unburnt exhaust pop / chuff when the misfire strokes into exhaust
    let pop = 0;
    if (stumbleCycle > 0.25 && stumbleCycle < 0.32) {
      const popT = (stumbleCycle - 0.25) / 0.07;
      pop = (Math.random() * 2 - 1) * Math.sin(Math.PI * popT) * 0.55;
    }

    const noise = exhaustFilter.process(pink.next()) * 0.3;

    out[i] = (harmonics * 0.5 + pop + noise) * env * 0.8;
  }

  writeWavFile('spark-failure.wav', out);
}

function generateSparkNormal() {
  // Same as healthy engine purr with crisp ignition sparks
  const duration = 2.8;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  const sparkSnapFilter = createBiquad('highpass', 2400, 1.2);
  const baseFilter = createBiquad('lowpass', 320, 1.0);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.2) * Math.min(1, (duration - t) / 0.25);

    const f0 = 28.0;
    const idleHarmonics = (
      Math.sin(2 * Math.PI * f0 * t) * 0.35 +
      Math.sin(2 * Math.PI * (f0 * 2) * t) * 0.42 +
      Math.sin(2 * Math.PI * (f0 * 4) * t) * 0.25
    );

    // Subtle rhythmic spark snap ticks (56 Hz coil firings)
    const sparkPhase = (t * 56) % 1.0;
    const sparkTick = sparkPhase < 0.04 ? (Math.random() * 2 - 1) * 0.18 : 0;

    const baseNoise = baseFilter.process(pink.next()) * 0.35;

    out[i] = (idleHarmonics * 0.45 + sparkTick + baseNoise) * env * 0.75;
  }

  writeWavFile('spark-normal.wav', out);
}

// ==========================================
// 5. BATTERY & STARTER: Dead Relay Chatter vs Instant Fire
// ==========================================

function generateBatteryFailure() {
  const duration = 3.0;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);

  // Realistic Dead Battery: Rapid Solenoid Relay CLICKS ("click-click-click-click")
  // followed by a sluggish, agonizing voltage-sagging motor groan ("uuuurrrgh")
  const clickRate = 12.0; // 12 Hz relay chatter
  const clickInterval = 1 / clickRate;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.05) * Math.min(1, (duration - t) / 0.3);

    let sample = 0;

    // First 1.4 seconds: Rapid Solenoid Relay Chatter
    if (t < 1.4) {
      const clickT = t % clickInterval;
      if (clickT < 0.02) {
        // Sharp metallic solenoid strike (1,150 Hz impulse + high transient)
        const snap = Math.sin(2 * Math.PI * 1150 * clickT) * Math.exp(-clickT / 0.005);
        const contactClick = (Math.random() * 2 - 1) * Math.exp(-clickT / 0.003) * 0.9;
        sample = snap * 0.7 + contactClick * 0.6;
      }
    }
    // 1.4s to 2.8s: Weak starter motor attempting to turn and stalling under voltage sag
    else if (t < 2.8) {
      const slowT = t - 1.4;
      // Sluggish crank slowing from 42 Hz down to 14 Hz as voltage drops to 7V
      const sagPitch = Math.max(12, 45 - slowT * 26);
      const groan = Math.sin(2 * Math.PI * sagPitch * slowT) * Math.exp(-slowT / 0.9);
      const motorHum = (Math.random() * 2 - 1) * 0.12 * Math.exp(-slowT / 0.8);
      sample = (groan * 0.75 + motorHum) * 0.8;
    }

    out[i] = sample * env;
  }

  writeWavFile('battery-failure.wav', out);
}

function generateBatteryNormal() {
  const duration = 2.4;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  // Crisp fast starter turn (3 rapid compression cycles) catching into instant engine fire
  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.08) * Math.min(1, (duration - t) / 0.25);

    let sample = 0;

    // Starter cranking phase: 0.0 to 0.75 seconds (3 quick turns: "ch-ch-ch")
    if (t < 0.75) {
      const crankPhase = (t * 4.5) % 1.0;
      const compressionStroke = Math.pow(Math.sin(Math.PI * crankPhase), 2);
      const starterWhirr = Math.sin(2 * Math.PI * 88 * t) * 0.35;
      const brushNoise = (Math.random() * 2 - 1) * 0.15;
      sample = (starterWhirr + brushNoise) * compressionStroke * 1.1;
    }
    // Engine catches & fires up: 0.75s to 2.4s (enthusiastic vroom into steady idle)
    else {
      const fireT = t - 0.75;
      // Initial throttle blip up to 55 Hz, settling to 30 Hz idle
      const revPitch = 30 + 35 * Math.exp(-fireT / 0.45);
      const combustion = (
        Math.sin(2 * Math.PI * revPitch * fireT) * 0.4 +
        Math.sin(2 * Math.PI * (revPitch * 2) * fireT) * 0.35 +
        Math.sin(2 * Math.PI * (revPitch * 3) * fireT) * 0.22
      );
      const exhaustRush = pink.next() * 0.35;
      sample = combustion * 0.75 + exhaustRush;
    }

    out[i] = sample * env * 0.85;
  }

  writeWavFile('battery-normal.wav', out);
}

// ==========================================
// 6. SHOCK ABSORBERS: Blown Strut Clunk vs Damped Rebound
// ==========================================

function generateShockFailure() {
  const duration = 2.5;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);

  // 2 harsh bottoming-out metal strikes over rough pavement
  const hits = [0.2, 1.3];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    for (const hitTime of hits) {
      if (t >= hitTime && t < hitTime + 0.35) {
        const dt = t - hitTime;
        // Deep chassis shock impact (62 Hz decaying in 40ms)
        const subThud = Math.sin(2 * Math.PI * 62 * dt) * Math.exp(-dt / 0.04);
        // Harsh metal-on-metal bottoming out (320 Hz metallic smash)
        const metalSmash = Math.sin(2 * Math.PI * 320 * dt) * Math.exp(-dt / 0.02);
        // Loose strut mount rattling spring ring (980 Hz decaying in 80ms)
        const rattle = Math.sin(2 * Math.PI * 980 * dt) * Math.exp(-dt / 0.08) * 0.4;
        const impactCrunch = (Math.random() * 2 - 1) * Math.exp(-dt / 0.012) * 0.6;

        sample += subThud * 0.7 + metalSmash * 0.6 + rattle + impactCrunch;
      }
    }

    out[i] = sample * 0.8;
  }

  writeWavFile('shock-failure.wav', out);
}

function generateShockNormal() {
  const duration = 2.2;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  const damperFilter = createBiquad('lowpass', 380, 0.9);

  // 2 smooth pneumatic hydraulic whooshes ("pssshh-whuff")
  const strokes = [0.2, 1.2];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    for (const strokeTime of strokes) {
      if (t >= strokeTime && t < strokeTime + 0.55) {
        const dt = t - strokeTime;
        const envelope = Math.sin(Math.PI * (dt / 0.55));
        const hydraulicHiss = damperFilter.process(pink.next()) * 0.8;
        const gentleBump = Math.sin(2 * Math.PI * 45 * dt) * Math.exp(-dt / 0.2) * 0.35;
        sample += (hydraulicHiss + gentleBump) * envelope;
      }
    }

    out[i] = sample * 0.7;
  }

  writeWavFile('shock-normal.wav', out);
}

// ==========================================
// 7. FILTERS: Choked Suction vs Clean Airflow
// ==========================================

function generateFilterFailure() {
  const duration = 2.6;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  const whistleFilter = createBiquad('bandpass', 680, 8.5);
  const suctionFilter = createBiquad('bandpass', 310, 3.2);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.2) * Math.min(1, (duration - t) / 0.3);

    // Turbulent wheezing air starvation
    const lfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * 6.5 * t);
    const noise = pink.next();
    const whistle = whistleFilter.process(noise) * 2.5;
    const suction = suctionFilter.process(noise) * 1.8;

    out[i] = (whistle * 0.6 + suction * 0.5) * lfo * env * 0.75;
  }

  writeWavFile('filter-failure.wav', out);
}

function generateFilterNormal() {
  const duration = 2.2;
  const totalSamples = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(totalSamples);
  const pink = new PinkNoiseGenerator();

  const airFilter = createBiquad('bandpass', 420, 1.2);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(1, t / 0.25) * Math.min(1, (duration - t) / 0.3);

    const noise = pink.next();
    const smoothAir = airFilter.process(noise) * 0.8;

    out[i] = smoothAir * env * 0.6;
  }

  writeWavFile('filter-normal.wav', out);
}

// ==========================================
// RUN GENERATION BATCH
// ==========================================

console.log('Generating realistic automotive acoustic WAV files...');
generateBrakeFailure();
generateBrakeNormal();
generateAlternatorFailure();
generateAlternatorNormal();
generateEngineKnock();
generateEngineNormal();
generateSparkFailure();
generateSparkNormal();
generateBatteryFailure();
generateBatteryNormal();
generateShockFailure();
generateShockNormal();
generateFilterFailure();
generateFilterNormal();
console.log('All 14 automotive diagnostic audio files generated successfully in /public/audio!');
