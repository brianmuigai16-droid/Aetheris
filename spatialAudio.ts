/**
 * Spatial Audio Engine utilizing Web Audio API
 * Generates crystalline glass clicks, resonant chimes, and continuous ambient soundscapes
 */

class SpatialAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private activeSoundscape: string | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private noiseNode: AudioNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  public playGlassChime(freq: number = 1760, duration: number = 0.45) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      // Subtle pitch bend upwards giving that pure glass refraction feel
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);

      // Subtle harmonic overtone
      const overtone = this.ctx.createOscillator();
      const overtoneGain = this.ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2.76, this.ctx.currentTime);
      overtoneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration * 0.6);

      overtone.connect(overtoneGain);
      overtoneGain.connect(this.masterGain);

      overtone.start();
      overtone.stop(this.ctx.currentTime + duration * 0.6);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playSpatialClick() {
    this.playGlassChime(2200, 0.08);
  }

  public playWindowFocus() {
    this.playGlassChime(1320, 0.25);
  }

  public playDockHover() {
    this.playGlassChime(3520, 0.04);
  }

  public startSoundscape(type: 'nebula' | 'fjord' | 'binaural' | 'rain') {
    this.initContext();
    if (!this.ctx || !this.ambientGain) return;
    this.stopSoundscape();
    this.activeSoundscape = type;

    const now = this.ctx.currentTime;

    if (type === 'nebula') {
      // Warm cosmic fifth drone (A2 110Hz and E3 164.8Hz)
      const freqs = [110, 164.8, 330];
      freqs.forEach((f, i) => {
        if (!this.ctx || !this.ambientGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        
        // Subtle LFO drift
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.1 + i * 0.05, now);
        lfoGain.gain.setValueAtTime(2, now);
        lfo.connect(osc.frequency);
        lfo.start();

        gain.gain.setValueAtTime(0.03 / (i + 1), now);
        osc.connect(gain);
        gain.connect(this.ambientGain);
        osc.start();
        this.ambientOscillators.push(osc, lfo);
      });
    } else if (type === 'fjord') {
      // Alpine low mist drone + gentle crystal ring
      const freqs = [82.4, 123.5, 246.9];
      freqs.forEach((f, i) => {
        if (!this.ctx || !this.ambientGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.025 / (i + 1), now);
        osc.connect(gain);
        gain.connect(this.ambientGain);
        osc.start();
        this.ambientOscillators.push(osc);
      });
    } else if (type === 'binaural') {
      // 432 Hz healing harmonic with 4Hz binaural beat difference
      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(216, now);
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(220, now); // 4Hz delta

      gain.gain.setValueAtTime(0.04, now);
      oscL.connect(gain);
      oscR.connect(gain);
      gain.connect(this.ambientGain);

      oscL.start();
      oscR.start();
      this.ambientOscillators.push(oscL, oscR);
    } else if (type === 'rain') {
      // Pinkish noise filtered for rain on glass
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 1.5;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      noise.start();
      this.noiseNode = noise;
    }
  }

  public stopSoundscape() {
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.ambientOscillators = [];
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioScheduledSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
    this.activeSoundscape = null;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getActiveSoundscape(): string | null {
    return this.activeSoundscape;
  }
}

export const spatialAudio = new SpatialAudioEngine();
