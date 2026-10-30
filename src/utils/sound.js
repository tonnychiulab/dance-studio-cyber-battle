// Web Audio API 即時合成音效引擎（具備全面容錯與防崩潰機制）

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // 靜默處理瀏覽器音訊限制
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  _connectAndAutoCleanup(osc, gain) {
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };
  }

  playCard() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      this._connectAndAutoCleanup(osc, gain);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  playAttack() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      this._connectAndAutoCleanup(osc, gain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  playDefense() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.3);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      this._connectAndAutoCleanup(osc, gain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  playAlarm() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'square';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.15);
      osc.frequency.linearRampToValueAtTime(580, now + 0.3);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      this._connectAndAutoCleanup(osc, gain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  playDanceBeat() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [130.81, 146.83, 164.81, 196.00];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.18;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

        this._connectAndAutoCleanup(osc, gain);

        osc.start(startTime);
        osc.stop(startTime + 0.15);
      });
    } catch {}
  }

  playVictory() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50];

      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.15;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        this._connectAndAutoCleanup(osc, gain);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();
