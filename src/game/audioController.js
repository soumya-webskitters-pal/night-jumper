export function createAudioController(isRunning) {
  let context = null;
  let master = null;
  let enabled = true; // Sound starts enabled by default

  let currentAudio = null;
  let currentTrackUrl = null;
  let fadeInterval = null;
  let activeRunnerId = "tron";
  let isInitialLoad = true;
  const runnerMusic = {};
  const activeAudios = [];
  let lastHoverTime = 0;

  const MUSIC_TRACKS = [
    "/music/alexgrohl-midnight-streetlight-synthwave-tune-192768.mp3",
    "/music/backgroundmusicmaster-neon-arcade-runner-431354.mp3",
    "/music/bombinsound-football-football-soccer-game-music-08-second-490554.mp3",
    "/music/hauntsync-i-got-this-instrumental-rock-song-213093.mp3",
    "/music/octosound-speed-of-light-173725.mp3",
    "/music/psychronic-darkstream-runner-301774.mp3"
  ];

  // Volume management
  let musicVolume = parseFloat(localStorage.getItem("night-runner-volume-music") ?? "0.5");
  let sfxVolume = parseFloat(localStorage.getItem("night-runner-volume-sfx") ?? "1.0");

  const baseMaxVolume = 0.25;
  const baseDuckedVolume = 0.05;
  let isDucked = false;

  function getTargetVolume() {
    const base = isDucked ? baseDuckedVolume : baseMaxVolume;
    return musicVolume * base;
  }

  function getRunnerMusic(runnerId) {
    if (!runnerMusic[runnerId]) {
      const randomIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);
      runnerMusic[runnerId] = MUSIC_TRACKS[randomIndex];
    }
    return runnerMusic[runnerId];
  }

  function fadeVolumeTo(targetVal, duration = 500) {
    if (!currentAudio || !enabled) return;
    const startVal = currentAudio.volume;
    const diff = targetVal - startVal;
    const steps = 15;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      currentAudio.volume = startVal + (step / steps) * diff;
      if (step >= steps) {
        clearInterval(timer);
        currentAudio.volume = targetVal;
      }
    }, stepTime);
  }

  function duckVolume() {
    isDucked = true;
    fadeVolumeTo(getTargetVolume());
  }

  function restoreVolume() {
    isDucked = false;
    fadeVolumeTo(getTargetVolume());
  }

  function stopAllExcept(keep1, keep2) {
    activeAudios.forEach((audioEl) => {
      if (audioEl !== keep1 && audioEl !== keep2) {
        audioEl.pause();
        audioEl.src = "";
      }
    });

    const kept = [];
    if (keep1) kept.push(keep1);
    if (keep2 && keep2 !== keep1) kept.push(keep2);

    activeAudios.length = 0;
    activeAudios.push(...kept);
  }

  function playTrackWithCrossfade(src) {
    if (currentTrackUrl === src && currentAudio && !currentAudio.paused) {
      return;
    }

    const oldAudio = currentAudio;
    const newAudio = new Audio(src);
    newAudio.loop = false;

    activeAudios.push(newAudio);
    currentAudio = newAudio;
    currentTrackUrl = src;
    newAudio.volume = 0;

    newAudio.addEventListener("ended", () => {
      const nextRandomTrack = MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];
      playTrackWithCrossfade(nextRandomTrack);
    });

    if (enabled) {
      newAudio.play().then(() => {
        crossFade(oldAudio, newAudio);
      }).catch(err => {
        console.warn("Music play failed (usually due to browser autoplay restrictions):", err);
      });
    } else {
      if (oldAudio) {
        oldAudio.pause();
        oldAudio.src = "";
      }
    }
  }

  function crossFade(oldAudio, newAudio) {
    if (fadeInterval) {
      clearInterval(fadeInterval);
    }

    stopAllExcept(oldAudio, newAudio);

    const duration = 2000;
    const steps = 20;
    const stepTime = duration / steps;
    let currentStep = 0;

    const targetVolume = getTargetVolume();
    newAudio.volume = 0;

    fadeInterval = setInterval(() => {
      currentStep++;
      const ratio = currentStep / steps;

      if (newAudio && enabled) {
        newAudio.volume = ratio * targetVolume;
      }
      if (oldAudio) {
        oldAudio.volume = (1 - ratio) * oldAudio.volume;
      }

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        fadeInterval = null;
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.src = "";
          const idx = activeAudios.indexOf(oldAudio);
          if (idx > -1) activeAudios.splice(idx, 1);
        }
      }
    }, stepTime);
  }

  function ensure() {
    if (!enabled) return;
    if (!context) {
      context = new (window.AudioContext || window.webkitAudioContext)();
      master = context.createGain();
      master.gain.value = 0.18;
      master.connect(context.destination);
    }
    if (context.state === "suspended") context.resume();

    if (currentAudio && currentAudio.paused) {
      currentAudio.play().catch(e => console.warn("Failed to resume music on ensure:", e));
    }
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
    const scaledVolume = volume * sfxVolume;
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
    gain.gain.exponentialRampToValueAtTime(scaledVolume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  function noiseBurst(duration = 0.16, volume = 0.16) {
    if (!enabled || !context || !master) return;
    const scaledVolume = volume * sfxVolume;
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
    gain.gain.value = scaledVolume;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start();
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);
    if (enabled) {
      ensure();
      if (master) master.gain.setTargetAtTime(0.18, context.currentTime, 0.03);
      synthTone(440, 0.09, 0.1, "sine", 660);

      if (currentAudio) {
        currentAudio.volume = getTargetVolume();
        currentAudio.play().catch(e => console.warn("Failed to resume music:", e));
      } else {
        const nextTrack = MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];
        isInitialLoad = false;
        playTrackWithCrossfade(nextTrack);
      }
    } else {
      if (master && context) {
        master.gain.setTargetAtTime(0.0001, context.currentTime, 0.03);
      }
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }
      if (currentAudio) {
        currentAudio.pause();
      }
    }
    return enabled;
  }

  return {
    ensure,
    isEnabled: () => enabled,
    toggle: () => setEnabled(!enabled),
    getMusicVolume: () => musicVolume,
    getSfxVolume: () => sfxVolume,
    setMusicVolume: (val) => {
      musicVolume = parseFloat(val);
      localStorage.setItem("night-runner-volume-music", String(val));
      if (currentAudio && enabled) {
        currentAudio.volume = getTargetVolume();
      }
    },
    setSfxVolume: (val) => {
      sfxVolume = parseFloat(val);
      localStorage.setItem("night-runner-volume-sfx", String(val));
    },
    setRunner: (runnerId) => {
      activeRunnerId = runnerId;
      if (enabled) {
        let nextTrack;
        if (isInitialLoad) {
          isInitialLoad = false;
          nextTrack = MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];
        } else {
          nextTrack = getRunnerMusic(runnerId);
        }
        playTrackWithCrossfade(nextTrack);
      }
    },
    playClick: () => {
      if (!enabled) return;
      const audio = new Audio("/sfx/click.mp3");
      audio.volume = 0.22 * sfxVolume;
      audio.play().catch(e => console.warn("Failed to play click SFX:", e));
    },
    playHover: () => {
      if (!enabled) return;
      const now = performance.now();
      if (now - lastHoverTime < 50) return;
      lastHoverTime = now;
      const audio = new Audio("/sfx/click.mp3");
      audio.volume = 0.12 * sfxVolume;
      audio.playbackRate = 1.35;
      audio.play().catch(e => console.warn("Failed to play hover SFX:", e));
    },
    playCountdownTick: (nextValue) => {
      ensure();
      if (!enabled) return;
      if (nextValue === "1") {
        synthTone(1050, 0.08, 0.2, "sine", 1400);
      } else {
        synthTone(750, 0.06, 0.16, "sine", 950);
      }
    },
    playJump: (boosted = false) =>
      synthTone(boosted ? 420 : 310, 0.18, 0.16, "square", boosted ? 880 : 620),
    playRoll: () => synthTone(240, 0.14, 0.13, "sawtooth", 75),
    playImpact: () => {
      noiseBurst(0.22, 0.28);
      synthTone(105, 0.28, 0.2, "square", 38);
    },
    playGameOver: () => {
      duckVolume();
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
    playRestart: () => {
      restoreVolume();
    },
    destroy: () => {
      if (fadeInterval) clearInterval(fadeInterval);
      stopAllExcept(null, null);
      context?.close();
    },
  };
}
