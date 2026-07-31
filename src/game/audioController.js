export function createAudioController(isRunning) {
  let context = null;
  let master = null;
  let musicTimer = null;
  let musicStep = 0;
  let enabled = false;

  function ensure() {
    if (!enabled) return;
    if (!context) {
      context = new (window.AudioContext || window.webkitAudioContext)();
      master = context.createGain();
      master.gain.value = 0.18;
      master.connect(context.destination);
      musicTimer = window.setInterval(playMusicStep, 150);
    }
    if (context.state === "suspended") context.resume();
  }

  function synthTone(
    frequency,
    duration,
    volume = 0.12,
    type = "sawtooth",
    endFrequency = frequency,
    delay = 0,
  ) {
    if (!enabled || !context || !master) return;
    const now = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), now);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      now + duration,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  function noiseBurst(duration = 0.16, volume = 0.16) {
    if (!enabled || !context || !master) return;
    const frameCount = Math.ceil(context.sampleRate * duration);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = "bandpass";
    filter.frequency.value = 440;
    filter.Q.value = 0.8;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start();
  }

  function playMusicStep() {
    if (!enabled || !context || !isRunning()) return;
    const bass = [55, 55, 65.41, 55, 73.42, 65.41, 82.41, 73.42];
    const lead = [220, 261.63, 329.63, 293.66, 220, 329.63, 392, 329.63];
    const step = musicStep % bass.length;
    synthTone(bass[step], 0.13, 0.095, "sawtooth");
    if (step % 2 === 0) {
      synthTone(lead[step], 0.1, 0.035, "square", lead[step] * 1.01);
    }
    if (step === 0 || step === 4) synthTone(42, 0.1, 0.13, "sine", 28);
    musicStep += 1;
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);
    if (enabled) {
      ensure();
      if (master) master.gain.setTargetAtTime(0.18, context.currentTime, 0.03);
      synthTone(440, 0.09, 0.1, "sine", 660);
    } else if (master && context) {
      master.gain.setTargetAtTime(0.0001, context.currentTime, 0.03);
    }
    return enabled;
  }

  return {
    ensure,
    isEnabled: () => enabled,
    toggle: () => setEnabled(!enabled),
    playJump: (boosted = false) =>
      synthTone(boosted ? 420 : 310, 0.18, 0.16, "square", boosted ? 880 : 620),
    playRoll: () => synthTone(240, 0.14, 0.13, "sawtooth", 75),
    playImpact: () => {
      noiseBurst(0.22, 0.28);
      synthTone(105, 0.28, 0.2, "square", 38);
    },
    playGameOver: () => {
      [330, 247, 196, 123].forEach((frequency, index) => {
        synthTone(
          frequency,
          0.28,
          0.11,
          "triangle",
          frequency * 0.72,
          index * 0.13,
        );
      });
    },
    destroy: () => {
      if (musicTimer) window.clearInterval(musicTimer);
      context?.close();
    },
  };
}
