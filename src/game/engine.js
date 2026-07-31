import { gsap } from "gsap";

export function startJumper3D(
  THREE,
  GLTFLoader,
  DRACOLoader,
  runtime = {},
) {
  const canvas = runtime.renderer?.domElement || document.querySelector("#gameCanvas");
  const scoreValue = document.querySelector("#scoreValue");
  const highScoreValue = document.querySelector("#highScoreValue");
  const statusText = document.querySelector("#statusText");
  const restartPanel = document.querySelector("#restartPanel");
  const restartButton = document.querySelector("#restartButton");
  const finalScoreValue = document.querySelector("#finalScoreValue");
  const soundToggle = document.querySelector("#soundToggle");
  const fpsMeter = document.querySelector("#fpsMeter");
  const lowGraphicsButton = document.querySelector("#lowGraphics");
  const highGraphicsButton = document.querySelector("#highGraphics");
  const themeToggle = document.querySelector("#themeToggle");
  const loaderScreen = document.querySelector("#loaderScreen");
  const guideToggle = document.querySelector("#guideToggle");
  const gameGuide = document.querySelector("#gameGuide");
  const guideClose = document.querySelector("#guideClose");
  const guidePlay = document.querySelector("#guidePlay");
  const runnerSelect = document.querySelector("#runnerSelect");
  const runnerLoading = document.querySelector("#runnerLoading");
  const runnerOptions = [...document.querySelectorAll(".runner-option")];
  const runnerToggle = document.querySelector("#runnerToggle");
  const jumpControl = document.querySelector("#jumpControl");
  const superJumpControl = document.querySelector("#superJumpControl");
  const rollControl = document.querySelector("#rollControl");

  const scene = runtime.scene || new THREE.Scene();
  scene.background = new THREE.Color(0x030706);
  scene.fog = new THREE.FogExp2(0x07100c, 0.028);

  const camera =
    runtime.camera ||
    new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      120,
    );
  camera.fov = 52;
  camera.near = 0.1;
  camera.far = 120;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  let cameraBaseY = 5.1;

  function setCameraView() {
    const portrait = window.innerWidth / window.innerHeight < 0.8;
    cameraBaseY = portrait ? 5.6 : 5.1;
    camera.position.set(
      portrait ? 2.8 : 4.6,
      cameraBaseY,
      portrait ? 15.5 : 13.2,
    );
    camera.lookAt(-0.8, 1.55, -1.2);
    camera.rotation.z = 0;
  }

  setCameraView();

  const ownsRenderer = !runtime.renderer;
  const renderer =
    runtime.renderer ||
    new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
  const renderPixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.25);
  renderer.setPixelRatio(renderPixelRatio());
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const state = {
    running: false,
    playerReady: false,
    obstaclesReady: false,
    gameOver: false,
    score: 0,
    highScore: 0,
    scoreClock: 0,
    survivalTime: 0,
    spawnTimer: 5,
    hasSpawned: false,
    jumping: false,
    jumpTime: 0,
    jumpBoosted: false,
    ducking: false,
    rollTime: 0,
    obstacles: [],
  };

  const clock = new THREE.Clock();
  const playerBox = new THREE.Box3();
  const obstacleBox = new THREE.Box3();
  const neonMaterials = [];
  const windowMaterials = [];
  const roadMarkers = [];
  const cityBlocks = [];
  const obstacleTemplates = [];
  const floatingObstacleTemplates = [];
  let speedParticles = null;
  let runnerSpeedLines = null;
  let superJumpLines = null;
  let playerMixer = null;
  let idleAction = null;
  let runAction = null;
  let rollAction = null;
  let jumpAction = null;
  let superJumpAction = null;
  let activePlayerAction = null;
  let audioContext = null;
  let audioMaster = null;
  let musicTimer = null;
  let musicStep = 0;
  let soundEnabled = false;
  let displayedScore = 0;
  let scoreDatabasePromise = null;
  let highScoreLoaded = false;
  let fpsFrameCount = 0;
  let fpsSampleStarted = performance.now();
  let graphicsQuality = "high";
  let currentTheme = "night";
  let themeBeforeSpider = "night";
  let adaptivePixelRatio = 0.82;
  let lastResolutionAdjustment = 0;
  const loaderStartedAt = performance.now();
  let loadingCompleteScheduled = false;
  let guideWasRunning = false;
  let runnerSelectionShown = false;
  let selectedRunner = "tron";
  let playerModel = null;
  let stars = null;
  let roadMaterial = null;
  let laneMaterial = null;
  let hurdleMaterial = null;
  let boxTrimMaterial = null;
  let fenceMaterial = null;
  let obstacleEdgeMaterial = null;
  let floatingGoalFrameMaterial = null;
  let floatingGoalNetMaterial = null;
  let groundObstacleTexture = null;
  let userObstacleTextures = null;
  const boxTextureMaterials = [];
  const fenceTextureMaterials = [];
  let moon = null;
  let moonHalo = null;
  let lastStatusMessage = "";
  let visualFrame = 0;
  let effectTravel = 0;

  function setStatus(message) {
    if (message === lastStatusMessage) return;
    lastStatusMessage = message;
    statusText.textContent = message;
  }

  function openGameGuide() {
    if (!gameGuide.hidden) return;
    guideWasRunning = state.running;
    state.running = false;
    setDuck(false);
    playPlayerAction(idleAction || runAction);
    gameGuide.hidden = false;
    guideToggle.setAttribute("aria-expanded", "true");
    guidePlay.textContent = guideWasRunning ? "Continue running" : "Start running";
    window.requestAnimationFrame(() => guidePlay.focus());
  }

  function closeGameGuide() {
    if (gameGuide.hidden) return;
    gameGuide.hidden = true;
    guideToggle.setAttribute("aria-expanded", "false");
    if (!runnerSelectionShown && !state.gameOver) {
      runnerSelectionShown = true;
      openRunnerSelect();
      return;
    }
    if (!state.gameOver && state.playerReady && state.obstaclesReady) {
      state.running = true;
      playPlayerAction(runAction || idleAction);
      clock.getDelta();
    }
    guideToggle.focus();
  }

  function openRunnerSelect() {
    if (!runnerSelect.hidden) return;
    state.running = false;
    playPlayerAction(idleAction || runAction);
    runnerSelect.hidden = false;
    runnerToggle.setAttribute("aria-expanded", "true");
    runnerLoading.textContent = "";
    window.requestAnimationFrame(() => {
      runnerOptions.find((option) => option.dataset.runner === selectedRunner)?.focus();
    });
  }

  function closeRunnerSelect() {
    runnerSelect.hidden = true;
    runnerToggle.setAttribute("aria-expanded", "false");
    if (!state.gameOver && state.playerReady && state.obstaclesReady) {
      state.running = true;
      playPlayerAction(runAction || idleAction);
      clock.getDelta();
    }
  }

  function finishLoadingIfReady() {
    if (
      loadingCompleteScheduled ||
      !state.playerReady ||
      !state.obstaclesReady
    ) {
      return;
    }
    loadingCompleteScheduled = true;
    const remaining = Math.max(0, 700 - (performance.now() - loaderStartedAt));
    window.setTimeout(() => {
      loaderScreen.classList.add("is-hidden");
      loaderScreen.setAttribute("aria-hidden", "true");
      if (!state.gameOver) {
        state.running = false;
        playPlayerAction(idleAction || runAction);
        statusText.textContent = "First obstacle in 5 seconds";
        clock.getDelta();
        openGameGuide();
      }
    }, remaining);
  }

  function openScoreDatabase() {
    if (scoreDatabasePromise) return scoreDatabasePromise;
    scoreDatabasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("jumper-game", 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains("scores")) {
          database.createObjectStore("scores");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return scoreDatabasePromise;
  }

  async function loadHighScore() {
    try {
      const database = await openScoreDatabase();
      const value = await new Promise((resolve, reject) => {
        const transaction = database.transaction("scores", "readonly");
        const request = transaction.objectStore("scores").get("highest");
        request.onsuccess = () => resolve(Number(request.result) || 0);
        request.onerror = () => reject(request.error);
      });
      state.highScore = value;
      highScoreLoaded = true;
      highScoreValue.textContent = String(state.highScore);
      if (state.score > value) storeHighScore(state.score);
    } catch (error) {
      console.warn("Unable to load high score from IndexedDB", error);
    }
  }

  async function storeHighScore(value) {
    if (!highScoreLoaded || value <= state.highScore) return;
    state.highScore = value;
    highScoreValue.textContent = String(value);
    try {
      const database = await openScoreDatabase();
      await new Promise((resolve, reject) => {
        const transaction = database.transaction("scores", "readwrite");
        transaction.objectStore("scores").put(value, "highest");
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.warn("Unable to save high score to IndexedDB", error);
    }
  }

  function ensureAudio() {
    if (!soundEnabled) return;
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioMaster = audioContext.createGain();
      audioMaster.gain.value = 0.18;
      audioMaster.connect(audioContext.destination);
      musicTimer = window.setInterval(playMusicStep, 150);
    }
    if (audioContext.state === "suspended") audioContext.resume();
  }

  function synthTone(
    frequency,
    duration,
    volume = 0.12,
    type = "sawtooth",
    endFrequency = frequency,
    delay = 0,
  ) {
    if (!soundEnabled || !audioContext || !audioMaster) return;
    const now = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
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
    gain.connect(audioMaster);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  function noiseBurst(duration = 0.16, volume = 0.16) {
    if (!soundEnabled || !audioContext || !audioMaster) return;
    const frameCount = Math.ceil(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(
      1,
      frameCount,
      audioContext.sampleRate,
    );
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
    }
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    filter.type = "bandpass";
    filter.frequency.value = 440;
    filter.Q.value = 0.8;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioMaster);
    source.start();
  }

  function playMusicStep() {
    if (!soundEnabled || !audioContext || !state.running) return;
    const bassPattern = [55, 55, 65.41, 55, 73.42, 65.41, 82.41, 73.42];
    const leadPattern = [220, 261.63, 329.63, 293.66, 220, 329.63, 392, 329.63];
    const step = musicStep % bassPattern.length;
    synthTone(bassPattern[step], 0.13, 0.095, "sawtooth");
    if (step % 2 === 0) {
      synthTone(leadPattern[step], 0.1, 0.035, "square", leadPattern[step] * 1.01);
    }
    if (step === 0 || step === 4) {
      synthTone(42, 0.1, 0.13, "sine", 28);
    }
    musicStep += 1;
  }

  function playJumpSound(boosted = false) {
    synthTone(boosted ? 420 : 310, 0.18, 0.16, "square", boosted ? 880 : 620);
  }

  function playDuckSound() {
    synthTone(240, 0.14, 0.13, "sawtooth", 75);
  }

  function playImpactSound() {
    noiseBurst(0.22, 0.28);
    synthTone(105, 0.28, 0.2, "square", 38);
  }

  function playGameOverSound() {
    [330, 247, 196, 123].forEach((frequency, index) => {
      synthTone(frequency, 0.28, 0.11, "triangle", frequency * 0.72, index * 0.13);
    });
  }

  function updateScoreDisplay(value, force = false) {
    if (!force && value === displayedScore) return;
    displayedScore = value;
    scoreValue.textContent = String(value);
    scoreValue.classList.remove("score-spin");
    void scoreValue.offsetWidth;
    scoreValue.classList.add("score-spin");
    storeHighScore(value);
  }

  function animateFinalScore(target) {
    const counter = { value: 0 };
    finalScoreValue.textContent = "0";
    gsap.to(counter, {
      value: target,
      duration: Math.min(2.2, 0.8 + target * 0.018),
      ease: "power3.out",
      onUpdate: () => {
        finalScoreValue.textContent = String(Math.round(counter.value));
      },
    });
  }

  const hemisphereLight = new THREE.HemisphereLight(
    0x7ac69a,
    0x050807,
    1.15,
  );
  scene.add(hemisphereLight);

  const moonLight = new THREE.DirectionalLight(0xb8ffd5, 2.4);
  moonLight.position.set(-7, 12, 8);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.left = -18;
  moonLight.shadow.camera.right = 18;
  moonLight.shadow.camera.top = 16;
  moonLight.shadow.camera.bottom = -8;
  scene.add(moonLight);

  const rimLight = new THREE.PointLight(0x32d976, 20, 18, 2);
  rimLight.position.set(-4.5, 3.5, 4);
  scene.add(rimLight);

  const cityGlow = new THREE.PointLight(0x32a967, 25, 36, 2);
  cityGlow.position.set(5, 6, -10);
  scene.add(cityGlow);

  // Spider-Man gets a close red/blue night-light pair so his suit remains
  // readable against the dark city without changing the other runners.
  const spiderRedLight = new THREE.PointLight(0xff1538, 8, 9, 2);
  spiderRedLight.position.set(-5.4, 3.1, 3.6);
  spiderRedLight.visible = false;
  scene.add(spiderRedLight);

  const spiderBlueLight = new THREE.PointLight(0x145cff, 7, 9, 2);
  spiderBlueLight.position.set(-3.1, 2.2, 2.4);
  spiderBlueLight.visible = false;
  scene.add(spiderBlueLight);

  const spiderCityWebs = new THREE.Group();
  spiderCityWebs.name = "spider-city-webs";
  spiderCityWebs.visible = false;
  scene.add(spiderCityWebs);

  function createSpiderWeb(x, y, z, radius, color) {
    const points = [];
    const spokes = 10;
    for (let spoke = 0; spoke < spokes; spoke += 1) {
      const angle = (spoke / spokes) * Math.PI * 2;
      points.push(0, 0, 0, Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    }
    for (let ring = 1; ring <= 4; ring += 1) {
      const ringRadius = radius * (ring / 4);
      for (let segment = 0; segment < spokes; segment += 1) {
        const angleA = (segment / spokes) * Math.PI * 2;
        const angleB = ((segment + 1) / spokes) * Math.PI * 2;
        points.push(
          Math.cos(angleA) * ringRadius, Math.sin(angleA) * ringRadius, 0,
          Math.cos(angleB) * ringRadius, Math.sin(angleB) * ringRadius, 0,
        );
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    const web = new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    web.position.set(x, y, z);
    spiderCityWebs.add(web);
  }

  createSpiderWeb(-16, 7.5, -17, 3.7, 0x8fb3ff);
  createSpiderWeb(-1, 9, -23, 4.6, 0xe4edff);
  createSpiderWeb(15, 7, -18, 3.9, 0xff7184);

  function initialGraphicsQuality() {
    const saved = localStorage.getItem("night-runner-graphics");
    if (saved === "low" || saved === "high") return saved;
    return window.matchMedia("(max-width: 680px), (pointer: coarse)").matches
      ? "low"
      : "high";
  }

  function initialTheme() {
    return localStorage.getItem("night-runner-theme") === "day"
      ? "day"
      : "night";
  }

  function setTheme(mode, persist = true) {
    currentTheme =
      mode === "spiderman" ? "spiderman" : mode === "day" ? "day" : "night";
    const day = currentTheme === "day";
    const spider = currentTheme === "spiderman";
    const obstacleGlow = spider ? 0xff3048 : day ? 0xffb52e : 0x00ff66;
    if (persist && !spider) {
      localStorage.setItem("night-runner-theme", currentTheme);
    }

    document.documentElement.dataset.theme = currentTheme;
    themeToggle.textContent = spider ? "Spider" : day ? "Day" : "Night";
    themeToggle.setAttribute("aria-pressed", String(day));
    themeToggle.setAttribute(
      "aria-label",
      spider
        ? "Theme locked for Spider-Man"
        : day
          ? "Switch to night mode"
          : "Switch to day mode",
    );

    scene.background.set(spider ? 0x030716 : day ? 0xaec9c6 : 0x030706);
    scene.fog.color.set(spider ? 0x07142c : day ? 0xc3d2ce : 0x07100c);
    scene.fog.density = spider ? 0.027 : day ? 0.024 : 0.028;
    renderer.toneMappingExposure = day ? 1.08 : 1.15;

    if (roadMaterial) {
      roadMaterial.color.set(spider ? 0x070b1b : day ? 0xc7d0cc : 0x070d0a);
      roadMaterial.roughness = day ? 0.88 : 0.72;
      roadMaterial.metalness = day ? 0.06 : 0.35;
      roadMaterial.needsUpdate = true;
    }

    hemisphereLight.color.set(
      spider ? 0x4169ff : day ? 0xe4fff2 : 0x7ac69a,
    );
    hemisphereLight.groundColor.set(
      spider ? 0x160208 : day ? 0x52645c : 0x050807,
    );
    hemisphereLight.intensity = spider ? 1.5 : day ? 2.2 : 1.15;
    moonLight.color.set(spider ? 0x7da6ff : day ? 0xfff0c4 : 0xb8ffd5);
    moonLight.intensity = spider ? 2.1 : day ? 1.8 : 3.2;
    rimLight.color.set(spider ? 0xff2438 : day ? 0xffb52e : 0x32d976);
    rimLight.intensity = spider ? 18 : day ? 8 : 20;
    cityGlow.color.set(spider ? 0x2266ff : day ? 0xe6a128 : 0x32a967);
    cityGlow.intensity = spider ? 22 : day ? 7 : 25;
    spiderRedLight.visible = spider;
    spiderBlueLight.visible = spider;
    spiderCityWebs.visible = spider;

    if (laneMaterial) {
      laneMaterial.color.set(spider ? 0xff263d : day ? 0xd69b2d : 0x63c98c);
    }
    [hurdleMaterial].filter(Boolean).forEach((material) => {
      material.color.set(day ? 0x050706 : 0x00ff66);
      material.emissive.set(day ? 0x000000 : 0x00cc55);
      material.emissiveIntensity = day ? 0 : 0.7;
      material.metalness = 0.82;
      material.roughness = day ? 0.42 : 0.3;
    });
    boxTextureMaterials.forEach((material) => {
      material.color.set(0xffffff);
      material.emissive.set(obstacleGlow);
      material.emissiveIntensity = day ? 0.12 : 0.2;
      material.metalness = 0.82;
      material.roughness = 0.34;
    });
    if (boxTrimMaterial) {
      boxTrimMaterial.color.set(0xc7ccc9);
      boxTrimMaterial.emissive.set(0x000000);
      boxTrimMaterial.emissiveIntensity = 0;
    }
    [fenceMaterial].filter(Boolean).forEach((material) => {
      material.color.set(day ? 0x050706 : 0x00ff66);
      material.emissive.set(day ? 0x000000 : 0x00993f);
      material.emissiveIntensity = day ? 0 : 1.2;
      material.roughness = day ? 0.94 : 0.76;
    });
    fenceTextureMaterials.forEach((material) => {
      material.color.set(0xffffff);
      material.emissive.set(obstacleGlow);
      material.emissiveIntensity = day ? 0.1 : 0.18;
      material.roughness = 0.82;
    });
    if (obstacleEdgeMaterial) {
      obstacleEdgeMaterial.color.set(obstacleGlow);
      obstacleEdgeMaterial.opacity = day ? 0.72 : 0.96;
    }
    if (floatingGoalFrameMaterial) {
      floatingGoalFrameMaterial.color.set(obstacleGlow);
      floatingGoalFrameMaterial.emissive.set(obstacleGlow);
      floatingGoalFrameMaterial.emissiveIntensity = day ? 0.28 : 0.75;
    }
    if (floatingGoalNetMaterial) {
      floatingGoalNetMaterial.uniforms.uColor.value.set(obstacleGlow);
      floatingGoalNetMaterial.uniforms.uOpacity.value = day ? 0.42 : 0.68;
    }
    if (speedParticles) {
      speedParticles.material.color.set(
        spider ? 0x4488ff : day ? 0xffc247 : 0x9effbd,
      );
    }
    if (runnerSpeedLines) {
      runnerSpeedLines.material.color.set(
        spider ? 0xff3048 : day ? 0xffb52e : 0x8effb4,
      );
    }
    if (superJumpLines) {
      superJumpLines.material.color.set(
        spider ? 0x4d88ff : day ? 0xffdd76 : 0xb6ffcc,
      );
    }
    windowMaterials.forEach((windowMaterial) => {
      windowMaterial.color.copy(
        spider
          ? windowMaterial.userData.spiderColor
          : day
            ? windowMaterial.userData.dayColor
            : windowMaterial.userData.nightColor,
      );
    });

    if (stars) stars.visible = !day;
    if (moon) moon.visible = currentTheme === "night";
    if (moonHalo) moonHalo.visible = currentTheme === "night";

    cityBlocks.forEach((block) => {
      block.traverse((object) => {
        if (!object.userData.buildingMesh) return;
        const target = spider
          ? object.userData.spiderColor
          : day
            ? object.userData.dayColor
            : object.userData.nightColor;
        object.userData.litMaterial.color.copy(target);
        object.userData.flatMaterial.color.copy(target);
      });
    });
  }

  function applyRunnerTheme(runnerId) {
    if (runnerId === "spiderman") {
      if (currentTheme !== "spiderman") themeBeforeSpider = currentTheme;
      themeToggle.disabled = true;
      setTheme("spiderman", false);
      return;
    }

    themeToggle.disabled = false;
    if (currentTheme === "spiderman") {
      setTheme(themeBeforeSpider, false);
    }
  }

  function setGraphicsQuality(mode, persist = true) {
    graphicsQuality = mode === "low" ? "low" : "high";
    const high = graphicsQuality === "high";
    if (persist) localStorage.setItem("night-runner-graphics", graphicsQuality);

    lowGraphicsButton.setAttribute("aria-pressed", String(!high));
    highGraphicsButton.setAttribute("aria-pressed", String(high));

    adaptivePixelRatio = 0.82;
    lastResolutionAdjustment = performance.now();
    renderer.setPixelRatio(
      high
        ? Math.min(window.devicePixelRatio || 1, 1.5)
        : Math.min(window.devicePixelRatio || 1, adaptivePixelRatio),
    );
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = high
      ? THREE.PCFSoftShadowMap
      : THREE.PCFShadowMap;
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.set(high ? 2048 : 1024, high ? 2048 : 1024);

    if (speedParticles) speedParticles.visible = true;
    if (runnerSpeedLines) runnerSpeedLines.visible = state.running;
    if (superJumpLines) {
      superJumpLines.visible = state.jumping && state.jumpBoosted;
    }
    if (stars) stars.visible = currentTheme !== "day";

    cityBlocks.forEach((block) => {
      block.visible = true;
      block.traverse((object) => {
        if (object.userData.highQualityOnly) object.visible = high;
        if (object.userData.buildingMesh) {
          object.material = high
            ? object.userData.litMaterial
            : object.userData.flatMaterial;
        }
      });
    });
    applyObstacleTextureQuality(high);
  }

  function applyAdaptiveResolution(fps, now) {
    if (
      graphicsQuality !== "low" ||
      now - lastResolutionAdjustment < 1500
    ) {
      return;
    }
    const previousRatio = adaptivePixelRatio;
    if (fps < 54) {
      adaptivePixelRatio = Math.max(0.55, adaptivePixelRatio - 0.08);
    } else if (fps >= 59) {
      adaptivePixelRatio = Math.min(0.9, adaptivePixelRatio + 0.04);
    }
    if (adaptivePixelRatio !== previousRatio) {
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, adaptivePixelRatio),
      );
      renderer.setSize(window.innerWidth, window.innerHeight);
      lastResolutionAdjustment = now;
    }
  }

  function prepareObstacleTextures(root) {
    const textureSlots = [
      "map",
      "normalMap",
      "roughnessMap",
      "metalnessMap",
      "emissiveMap",
    ];
    const visited = new Set();
    root.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((objectMaterial) => {
        textureSlots.forEach((slot) => {
          const texture = objectMaterial?.[slot];
          const image = texture?.image;
          if (!texture || !image || visited.has(texture)) return;
          visited.add(texture);
          texture.userData.fullImage = image;
          const width = image.naturalWidth || image.videoWidth || image.width;
          const height =
            image.naturalHeight || image.videoHeight || image.height;
          if (!width || !height || Math.max(width, height) <= 512) return;
          const scale = 512 / Math.max(width, height);
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));
          canvas
            .getContext("2d", { alpha: true })
            .drawImage(image, 0, 0, canvas.width, canvas.height);
          texture.userData.lowImage = canvas;
        });
      });
    });
  }

  function applyObstacleTextureQuality(high) {
    obstacleTemplates.forEach((template) => {
      template.scene.traverse((object) => {
        if (!object.isMesh) return;
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((objectMaterial) => {
          [
            "map",
            "normalMap",
            "roughnessMap",
            "metalnessMap",
            "emissiveMap",
          ].forEach((slot) => {
            const texture = objectMaterial?.[slot];
            if (!texture?.userData.fullImage) return;
            texture.image =
              high || !texture.userData.lowImage
                ? texture.userData.fullImage
                : texture.userData.lowImage;
            texture.needsUpdate = true;
          });
        });
      });
    });
  }

  function material(color, roughness = 0.35, metalness = 0.4) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  function mesh(geometry, meshMaterial, cast = true, receive = true) {
    const object = new THREE.Mesh(geometry, meshMaterial);
    object.castShadow = cast;
    object.receiveShadow = receive;
    return object;
  }

  function createWorld() {
    const motionVertexShader = `
      uniform float uTravel;
      uniform float uWrapMin;
      uniform float uWrapRange;
      attribute float aSpeed;
      void main() {
        vec3 animated = position;
        animated.x = uWrapMin + mod(
          position.x - uWrapMin - uTravel * aSpeed,
          uWrapRange
        );
        gl_Position = projectionMatrix * modelViewMatrix * vec4(animated, 1.0);
      }
    `;
    const motionFragmentShader = `
      uniform vec3 uColor;
      uniform float uOpacity;
      void main() {
        gl_FragColor = vec4(uColor, uOpacity);
      }
    `;
    const particleVertexShader = `
      uniform float uTravel;
      attribute float aSpeed;
      void main() {
        vec3 animated = position;
        animated.x = -38.0 + mod(position.x + 38.0 - uTravel * aSpeed, 76.0);
        vec4 viewPosition = modelViewMatrix * vec4(animated, 1.0);
        gl_Position = projectionMatrix * viewPosition;
        gl_PointSize = clamp(34.0 / max(1.0, -viewPosition.z), 1.0, 3.2);
      }
    `;
    const particleFragmentShader = `
      uniform vec3 uColor;
      uniform float uOpacity;
      void main() {
        vec2 point = gl_PointCoord - vec2(0.5);
        float alpha = smoothstep(0.5, 0.08, length(point));
        gl_FragColor = vec4(uColor, uOpacity * alpha);
      }
    `;
    const createGpuMotionMaterial = ({
      color,
      opacity,
      wrapMin,
      wrapRange,
      particles = false,
    }) => {
      const uniforms = {
        uTravel: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
        uWrapMin: { value: wrapMin },
        uWrapRange: { value: wrapRange },
      };
      const shaderMaterial = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: particles ? particleVertexShader : motionVertexShader,
        fragmentShader: particles ? particleFragmentShader : motionFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      });
      // Preserve the existing theme API while the shader consumes the uniform.
      shaderMaterial.color = uniforms.uColor.value;
      return shaderMaterial;
    };

    roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x070d0a,
      roughness: 0.72,
      metalness: 0.35,
    });
    const road = mesh(new THREE.PlaneGeometry(90, 20), roadMaterial, false, true);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.02, 0);
    scene.add(road);

    const curbMaterial = material(0x123326, 0.48, 0.58);
    [-2.4, 2.4].forEach((z) => {
      const curb = mesh(new THREE.BoxGeometry(90, 0.16, 0.16), curbMaterial);
      curb.position.set(0, 0.05, z);
      scene.add(curb);
    });

    laneMaterial = new THREE.MeshBasicMaterial({ color: 0x63c98c });
    for (let x = -42; x < 43; x += 3.2) {
      const lane = mesh(
        new THREE.BoxGeometry(1.45, 0.025, 0.035),
        laneMaterial,
        false,
        false,
      );
      lane.position.set(x, 0.018, 1.35);
      scene.add(lane);
      roadMarkers.push(lane);
    }

    const particleCount = 220;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocity = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index += 1) {
      particlePositions[index * 3] = -38 + Math.random() * 76;
      particlePositions[index * 3 + 1] = 0.25 + Math.random() * 6.5;
      particlePositions[index * 3 + 2] = 1.5 - Math.random() * 8;
      particleVelocity[index] = 0.55 + Math.random() * 0.85;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    particleGeometry.setAttribute(
      "aSpeed",
      new THREE.BufferAttribute(particleVelocity, 1),
    );
    speedParticles = new THREE.Points(
      particleGeometry,
      createGpuMotionMaterial({
        color: 0x9effbd,
        opacity: 0.14,
        particles: true,
      }),
    );
    scene.add(speedParticles);

    const runnerLinePositions = new Float32Array(28 * 6);
    const runnerLineSpeeds = new Float32Array(28 * 2);
    for (let index = 0; index < 28; index += 1) {
      const offset = index * 6;
      const startX = -11 + Math.random() * 5.5;
      const lineLength = 0.35 + Math.random() * 0.9;
      const y = 0.35 + Math.random() * 2.45;
      const z = -0.9 + Math.random() * 1.8;
      runnerLinePositions.set(
        [startX, y, z, startX + lineLength, y, z],
        offset,
      );
      const speed = 1.15 + Math.random() * 0.4;
      runnerLineSpeeds.set([speed, speed], index * 2);
    }
    const runnerLineGeometry = new THREE.BufferGeometry();
    runnerLineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(runnerLinePositions, 3),
    );
    runnerLineGeometry.setAttribute(
      "aSpeed",
      new THREE.BufferAttribute(runnerLineSpeeds, 1),
    );
    runnerSpeedLines = new THREE.LineSegments(
      runnerLineGeometry,
      createGpuMotionMaterial({
        color: 0x8effb4,
        opacity: 0.34,
        wrapMin: -12,
        wrapRange: 7,
      }),
    );
    runnerSpeedLines.visible = false;
    scene.add(runnerSpeedLines);

    const jumpLinePositions = new Float32Array(18 * 6);
    const jumpLineSpeeds = new Float32Array(18 * 2);
    for (let index = 0; index < 18; index += 1) {
      const offset = index * 6;
      const startX = -9.5 + Math.random() * 6.5;
      const lineLength = 0.5 + Math.random() * 1.4;
      const z = -2 + Math.random() * 4;
      jumpLinePositions.set(
        [startX, 0.045, z, startX + lineLength, 0.045, z],
        offset,
      );
      const speed = 1.8 + Math.random() * 0.65;
      jumpLineSpeeds.set([speed, speed], index * 2);
    }
    const jumpLineGeometry = new THREE.BufferGeometry();
    jumpLineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(jumpLinePositions, 3),
    );
    jumpLineGeometry.setAttribute(
      "aSpeed",
      new THREE.BufferAttribute(jumpLineSpeeds, 1),
    );
    superJumpLines = new THREE.LineSegments(
      jumpLineGeometry,
      createGpuMotionMaterial({
        color: 0xb6ffcc,
        opacity: 0.72,
        wrapMin: -10,
        wrapRange: 8,
      }),
    );
    superJumpLines.visible = false;
    scene.add(superJumpLines);

    const starCount = 320;
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      starPositions[index * 3] = (Math.random() - 0.5) * 95;
      starPositions[index * 3 + 1] = 5 + Math.random() * 34;
      starPositions[index * 3 + 2] = -12 - Math.random() * 55;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );
    stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xa8ffd0,
        size: 0.095,
        transparent: true,
        opacity: 0.9,
      }),
    );
    stars.name = "stars";
    scene.add(stars);

    moon = mesh(
      new THREE.SphereGeometry(1.7, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xf0fff6,
        toneMapped: false,
      }),
      false,
      false,
    );
    moon.position.set(-13, 12, -28);
    scene.add(moon);

    moonHalo = mesh(
      new THREE.SphereGeometry(2.2, 20, 20),
      new THREE.MeshBasicMaterial({
        color: 0x8effb4,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      false,
      false,
    );
    moonHalo.position.copy(moon.position);
    scene.add(moonHalo);

    createCity();
  }

  function createCity() {
    const windowGeometry = new THREE.PlaneGeometry(0.2, 0.3);
    const windowColors = [0x43c878, 0x82d9a3, 0x35ad76, 0xb1dfc2];

    for (let index = 0; index < 24; index += 1) {
      const width = 1.2 + Math.random() * 2.6;
      const depth = 1.4 + Math.random() * 2.8;
      const height = 3 + Math.random() * 11;
      const x = -31 + index * 2.7 + (Math.random() - 0.5) * 1.2;
      const z = -11 - Math.random() * 15;
      const cityBlock = new THREE.Group();
      cityBlock.position.set(x, 0, z);
      cityBlock.userData.parallax = THREE.MathUtils.mapLinear(
        z,
        -26,
        -11,
        0.48,
        0.95,
      );
      scene.add(cityBlock);
      cityBlocks.push(cityBlock);

      const buildingMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(
          0.39 + Math.random() * 0.05,
          0.08,
          0.012 + Math.random() * 0.018,
        ),
        roughness: 0.96,
        metalness: 0.04,
      });
      const building = mesh(
        new THREE.BoxGeometry(width, height, depth),
        buildingMaterial,
        false,
        false,
      );
      building.userData.buildingMesh = true;
      building.userData.nightColor = buildingMaterial.color.clone();
      building.userData.dayColor = new THREE.Color().setHSL(
        0.42,
        0.08,
        0.13 + Math.random() * 0.05,
      );
      building.userData.spiderColor = new THREE.Color(
        index % 2 === 0 ? 0x090f2b : 0x25060d,
      );
      building.userData.litMaterial = buildingMaterial;
      building.userData.flatMaterial = new THREE.MeshBasicMaterial({
        color: buildingMaterial.color.clone(),
      });
      building.position.set(0, height / 2, 0);
      cityBlock.add(building);

      const windowColor =
        windowColors[Math.floor(Math.random() * windowColors.length)];
      const windowMaterial = new THREE.MeshBasicMaterial({
        color: windowColor,
        transparent: true,
        opacity: 0.5 + Math.random() * 0.28,
      });
      windowMaterial.userData.nightColor = new THREE.Color(windowColor);
      windowMaterial.userData.dayColor = new THREE.Color(0xf3b83f);
      windowMaterial.userData.spiderColor = new THREE.Color(
        index % 2 === 0 ? 0x3d7dff : 0xff3048,
      );
      windowMaterials.push(windowMaterial);
      if (index % 4 === 0) neonMaterials.push(windowMaterial);

      const columns = Math.max(1, Math.floor(width / 0.7));
      const rows = Math.max(2, Math.floor(height / 1.05));
      const windowTransforms = [];
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          if (Math.random() < 0.48) continue;
          windowTransforms.push([
            -width * 0.34 + column * 0.45,
            0.55 + row * 0.68,
            depth / 2 + 0.011,
          ]);
        }
      }
      if (windowTransforms.length) {
        const windowPanes = new THREE.InstancedMesh(
          windowGeometry,
          windowMaterial,
          windowTransforms.length,
        );
        const transform = new THREE.Object3D();
        windowTransforms.forEach(([windowX, windowY, windowZ], paneIndex) => {
          transform.position.set(windowX, windowY, windowZ);
          transform.updateMatrix();
          windowPanes.setMatrixAt(paneIndex, transform.matrix);
        });
        windowPanes.instanceMatrix.needsUpdate = true;
        // Instancing keeps the window grid inexpensive enough for both modes.
        windowPanes.userData.highQualityOnly = false;
        windowPanes.frustumCulled = false;
        cityBlock.add(windowPanes);
      }

      if (index % 8 === 0) {
        const antenna = mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 1.8, 6),
          material(0x16804a, 0.4, 0.7),
        );
        antenna.userData.highQualityOnly = true;
        antenna.position.set(0, height + 0.9, 0);
        cityBlock.add(antenna);
        const beacon = new THREE.PointLight(0x00ff66, 2.8, 6);
        beacon.userData.highQualityOnly = true;
        beacon.position.set(0, height + 1.8, 0);
        cityBlock.add(beacon);
      }
    }
  }

  function createPlayer() {
    const root = new THREE.Group();
    root.position.set(-4.2, 0, 0);
    root.rotation.y = Math.PI / 2;
    root.name = "player";
    scene.add(root);
    return root;
  }

  function playPlayerAction(action, fade = 0.22) {
    if (!action || action === activePlayerAction) return;
    action.reset().fadeIn(fade).play();
    activePlayerAction?.fadeOut(fade);
    activePlayerAction = action;
  }

  function loadPlayerModel(
    source = "players/neon_runner_animations_set/scene.gltf",
    runnerId = "tron",
    onComplete = null,
  ) {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/libs/draco/",
    );
    loader.setDRACOLoader(dracoLoader);
    const handleLoad = (gltf) => {
        const model = gltf.scene;
        if (runnerId === "nicky") model.rotation.y += Math.PI;
        if (runnerId === "spiderman") model.rotation.y -= Math.PI / 2;
        model.traverse((object) => {
          if (!object.isMesh) return;
          object.castShadow = true;
          object.receiveShadow = true;
          if (runnerId === "spiderman") {
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];
            materials.filter(Boolean).forEach((suitMaterial) => {
              // Preserve the authored red/blue diffuse texture. A subtle dark-blue
              // emissive lift keeps it readable at night without washing it white.
              suitMaterial.color?.set(0xffffff);
              if ("emissive" in suitMaterial) {
                suitMaterial.emissive.set(0x050b22);
                suitMaterial.emissiveMap = suitMaterial.map || null;
                suitMaterial.emissiveIntensity = 0.2;
              }
              suitMaterial.needsUpdate = true;
            });
          }
        });

        const rawBounds = new THREE.Box3().setFromObject(model);
        const rawHeight = Math.max(rawBounds.max.y - rawBounds.min.y, 0.01);
        const modelScale = 3 / rawHeight;
        model.scale.setScalar(modelScale);
        model.updateMatrixWorld(true);
        const scaledBounds = new THREE.Box3().setFromObject(model);
        model.position.y -= scaledBounds.min.y;

        playerMixer?.stopAllAction();
        if (playerModel) player.remove(playerModel);
        playerModel = model;
        player.add(model);
        player.updateMatrixWorld(true);
        const playerWorldBounds = new THREE.Box3().setFromObject(player);
        player.userData.localBounds = playerWorldBounds.applyMatrix4(
          player.matrixWorld.clone().invert(),
        );

        playerMixer = new THREE.AnimationMixer(model);
        const findClip = (...names) =>
          gltf.animations.find(
            (clip) =>
              names.some((name) =>
                clip.name.toLowerCase().includes(name.toLowerCase()),
              ),
          );
        let idleClip;
        let runClip;
        let rollClip;
        let jumpClip;
        let superJumpClip = null;
        if (runnerId === "spiderman") {
          idleClip = findClip("idle");
          runClip = findClip("run");
          rollClip = findClip("power_6");
          jumpClip = findClip("jump_start");
          superJumpClip = findClip("attack_popup1");
        } else if (["nicky", "chacha", "zombie"].includes(runnerId)) {
          idleClip = null;
          runClip = gltf.animations[0] || null;
          rollClip = null;
          jumpClip = null;
        } else if (runnerId === "tails") {
          idleClip = null;
          runClip = findClip("tl_run_loop", "tl_boost_loop");
          rollClip = findClip("tl_jump_cannonball_loop");
          jumpClip = findClip("tl_jump_fall_loop");
        } else if (runnerId === "sonic") {
          idleClip = null;
          runClip = findClip("sn_run_loop", "sn_boost_loop");
          rollClip = findClip("sn_ball_loop", "sn_ph_spin_start");
          jumpClip = findClip(
            "sn_springjump_loop",
            "sn_jump_fall_loop",
            "sn_jump",
          );
        } else {
          idleClip = findClip("Idle");
          runClip = findClip("Sprint", "Run", "Walk");
          rollClip = findClip("Roll");
          jumpClip = findClip("Jump");
        }
        activePlayerAction = null;
        idleAction = idleClip ? playerMixer.clipAction(idleClip) : null;
        runAction = runClip ? playerMixer.clipAction(runClip) : null;
        rollAction = rollClip ? playerMixer.clipAction(rollClip) : null;
        jumpAction = jumpClip ? playerMixer.clipAction(jumpClip) : null;
        superJumpAction = superJumpClip
          ? playerMixer.clipAction(superJumpClip)
          : null;
        [jumpAction, superJumpAction].forEach((action) => {
          if (!action) return;
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
        });

        playPlayerAction(idleAction || runAction, 0);
        selectedRunner = runnerId;
        applyRunnerTheme(runnerId);
        state.playerReady = true;
        statusText.textContent = "Get ready";
        finishLoadingIfReady();
        onComplete?.(true);
      };
    const handleError = (error) => {
      console.error(`Unable to load ${runnerId} runner`, error);
      statusText.textContent = `Could not load ${runnerId} runner`;
      state.playerReady = true;
      finishLoadingIfReady();
      onComplete?.(false);
    };

    loader.load(source, handleLoad, undefined, handleError);
  }

  async function loadObstacleModels() {
    // Ground obstacles and floating goals are procedural, so no obstacle GLTF
    // downloads are needed.
    obstacleTemplates.length = 0;
    floatingObstacleTemplates.length = 0;
    state.obstaclesReady = true;
    finishLoadingIfReady();
  }

  function getUserObstacleTextures() {
    if (userObstacleTextures) return userObstacleTextures;
    const loader = new THREE.TextureLoader();
    userObstacleTextures = [
      "texture/image1.jpg",
      "texture/image2.jpg",
      "texture/image3.jpg",
      "texture/image4.jpg",
      "texture/texture1.jpg",
    ].map((source) => {
      const texture = loader.load(source);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1.6, 1.6);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy(),
      );
      return texture;
    });
    return userObstacleTextures;
  }

  function randomMaterial(materials) {
    return materials[Math.floor(Math.random() * materials.length)];
  }

  function getObstacleEdgeMaterial() {
    if (obstacleEdgeMaterial) return obstacleEdgeMaterial;
    const color =
      currentTheme === "spiderman"
        ? 0xff3048
        : currentTheme === "day"
          ? 0xffb52e
          : 0x00ff66;
    obstacleEdgeMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: currentTheme === "day" ? 0.72 : 0.96,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return obstacleEdgeMaterial;
  }

  function addGlowingEdges(mesh) {
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 25),
      getObstacleEdgeMaterial(),
    );
    edges.renderOrder = 2;
    mesh.add(edges);
  }

  function getGroundObstacleMaterial() {
    if (hurdleMaterial) {
      return randomMaterial(boxTextureMaterials);
    }

    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 256;
    textureCanvas.height = 256;
    const context = textureCanvas.getContext("2d");
    const textureImage = context.createImageData(256, 256);

    for (let index = 0; index < textureImage.data.length; index += 4) {
      const grain = 150 + Math.floor(Math.random() * 76);
      textureImage.data[index] = grain;
      textureImage.data[index + 1] = grain;
      textureImage.data[index + 2] = grain;
      textureImage.data[index + 3] = 255;
    }
    context.putImageData(textureImage, 0, 0);

    context.globalAlpha = 0.3;
    context.strokeStyle = "#202020";
    context.lineWidth = 2;
    for (let line = 0; line < 34; line += 1) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + 12 + Math.random() * 58, y + (Math.random() - 0.5) * 8);
      context.stroke();
    }

    context.globalAlpha = 0.22;
    context.strokeStyle = "#ffffff";
    context.lineWidth = 1;
    for (let seam = 32; seam < 256; seam += 64) {
      context.beginPath();
      context.moveTo(seam, 0);
      context.lineTo(seam, 256);
      context.stroke();
    }

    groundObstacleTexture = new THREE.CanvasTexture(textureCanvas);
    groundObstacleTexture.wrapS = THREE.RepeatWrapping;
    groundObstacleTexture.wrapT = THREE.RepeatWrapping;
    groundObstacleTexture.repeat.set(2.5, 2.5);
    groundObstacleTexture.colorSpace = THREE.SRGBColorSpace;
    groundObstacleTexture.anisotropy = Math.min(
      8,
      renderer.capabilities.getMaxAnisotropy(),
    );

    const day = currentTheme === "day";
    hurdleMaterial = new THREE.MeshStandardMaterial({
      color: day ? 0x050706 : 0x00ff66,
      emissive: day ? 0x000000 : 0x00cc55,
      emissiveIntensity: day ? 0 : 0.7,
      map: groundObstacleTexture,
      bumpMap: groundObstacleTexture,
      bumpScale: 0.075,
      metalness: 0.82,
      roughness: day ? 0.42 : 0.3,
    });
    boxTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0xc7ccc9,
      emissive: 0x000000,
      emissiveIntensity: 0,
      metalness: 0.95,
      roughness: 0.22,
    });
    getUserObstacleTextures().forEach((texture) => {
      const material = hurdleMaterial.clone();
      const glow =
        currentTheme === "spiderman"
          ? 0xff3048
          : currentTheme === "day"
            ? 0xffb52e
            : 0x00ff66;
      material.color.set(0xffffff);
      material.emissive.set(glow);
      material.emissiveIntensity = currentTheme === "day" ? 0.12 : 0.2;
      material.map = texture;
      material.bumpMap = texture;
      material.bumpScale = 0.06;
      material.needsUpdate = true;
      boxTextureMaterials.push(material);
    });
    return randomMaterial(boxTextureMaterials);
  }

  function getFenceMaterial() {
    if (fenceMaterial) {
      return randomMaterial(fenceTextureMaterials);
    }

    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 256;
    textureCanvas.height = 256;
    const context = textureCanvas.getContext("2d");
    const woodImage = context.createImageData(256, 256);

    for (let y = 0; y < 256; y += 1) {
      for (let x = 0; x < 256; x += 1) {
        const index = (y * 256 + x) * 4;
        const grain =
          Math.sin(y * 0.18 + Math.sin(x * 0.035) * 4) * 21 +
          Math.sin(y * 0.055 + x * 0.014) * 13 +
          (Math.random() - 0.5) * 18;
        const shade = Math.max(72, Math.min(218, Math.round(148 + grain)));
        woodImage.data[index] = shade;
        woodImage.data[index + 1] = shade;
        woodImage.data[index + 2] = shade;
        woodImage.data[index + 3] = 255;
      }
    }
    context.putImageData(woodImage, 0, 0);

    // Dark, irregular rings make the procedural surface read as timber.
    context.globalAlpha = 0.42;
    context.strokeStyle = "#282828";
    context.lineWidth = 3;
    [
      [58, 78, 19, 8],
      [177, 166, 27, 11],
      [218, 43, 13, 6],
    ].forEach(([x, y, radiusX, radiusY]) => {
      context.beginPath();
      context.ellipse(x, y, radiusX, radiusY, -0.12, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.ellipse(x, y, radiusX * 0.45, radiusY * 0.45, -0.12, 0, Math.PI * 2);
      context.stroke();
    });

    const woodTexture = new THREE.CanvasTexture(textureCanvas);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(1.2, 2.8);
    woodTexture.colorSpace = THREE.SRGBColorSpace;
    woodTexture.anisotropy = Math.min(
      8,
      renderer.capabilities.getMaxAnisotropy(),
    );

    const day = currentTheme === "day";
    fenceMaterial = new THREE.MeshStandardMaterial({
      color: day ? 0x050706 : 0x00ff66,
      emissive: day ? 0x000000 : 0x00993f,
      emissiveIntensity: day ? 0 : 1.2,
      map: woodTexture,
      bumpMap: woodTexture,
      bumpScale: 0.11,
      metalness: 0,
      roughness: day ? 0.94 : 0.76,
    });
    getUserObstacleTextures().forEach((texture) => {
      const material = fenceMaterial.clone();
      const glow =
        currentTheme === "spiderman"
          ? 0xff3048
          : currentTheme === "day"
            ? 0xffb52e
            : 0x00ff66;
      material.color.set(0xffffff);
      material.emissive.set(glow);
      material.emissiveIntensity = currentTheme === "day" ? 0.1 : 0.18;
      material.map = texture;
      material.bumpMap = texture;
      material.bumpScale = 0.09;
      material.needsUpdate = true;
      fenceTextureMaterials.push(material);
    });
    return randomMaterial(fenceTextureMaterials);
  }

  function createHurdleObstacle() {
    const group = new THREE.Group();
    const obstacleMaterial = getFenceMaterial();

    const addBar = (width, height, depth, x, y, z) => {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        obstacleMaterial,
      );
      bar.position.set(x, y, z);
      bar.castShadow = true;
      bar.receiveShadow = true;
      addGlowingEdges(bar);
      group.add(bar);
    };

    // The runner travels along X, so the hurdle spans the lane along Z.
    addBar(0.14, 1.35, 0.14, 0, 0.675, -1.25);
    addBar(0.14, 1.35, 0.14, 0, 0.675, 1.25);
    addBar(0.12, 0.14, 2.72, 0, 0.48, 0);
    addBar(0.12, 0.14, 2.72, 0, 1.04, 0);

    group.userData.type = "ground";
    group.userData.modelName = "mesh_hurdle";
    group.updateMatrixWorld(true);
    group.userData.localBounds = new THREE.Box3()
      .setFromObject(group)
      .applyMatrix4(group.matrixWorld.clone().invert());
    return group;
  }

  function createBoxObstacle() {
    const group = new THREE.Group();
    const obstacleMaterial = getGroundObstacleMaterial();

    const boxCount = Math.random() < 0.45 ? 2 : 1;
    for (let index = 0; index < boxCount; index += 1) {
      const width = 0.85 + Math.random() * 0.25;
      const height = 0.8 + Math.random() * 0.28;
      const depth = 0.9 + Math.random() * 0.3;
      const assembly = new THREE.Group();
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        obstacleMaterial,
      );
      box.castShadow = true;
      box.receiveShadow = true;
      addGlowingEdges(box);
      assembly.add(box);

      // Raised bands and corner rails give the obstacle a fabricated crate form.
      const addTrim = (trimWidth, trimHeight, trimDepth, x, y, z) => {
        const trim = new THREE.Mesh(
          new THREE.BoxGeometry(trimWidth, trimHeight, trimDepth),
          boxTrimMaterial,
        );
        trim.position.set(x, y, z);
        trim.castShadow = true;
        assembly.add(trim);
      };
      [-1, 1].forEach((side) => {
        addTrim(0.045, height * 0.92, 0.09, width / 2 + 0.026, 0, side * depth * 0.36);
        addTrim(0.045, 0.09, depth * 0.92, width / 2 + 0.026, side * height * 0.36, 0);
        addTrim(width * 0.92, height * 0.92, 0.045, 0, 0, side * (depth / 2 + 0.026));
      });

      assembly.position.set(
        index * 0.12,
        height / 2 + index * 0.64,
        index === 0 ? 0 : 0.08,
      );
      assembly.rotation.y = (Math.random() - 0.5) * 0.18;
      group.add(assembly);
    }

    group.userData.type = "ground";
    group.userData.modelName = "mesh_boxes";
    group.updateMatrixWorld(true);
    group.userData.localBounds = new THREE.Box3()
      .setFromObject(group)
      .applyMatrix4(group.matrixWorld.clone().invert());
    return group;
  }

  function getFloatingGoalMaterials() {
    const color =
      currentTheme === "spiderman"
        ? 0xff3048
        : currentTheme === "day"
          ? 0xffb52e
          : 0x00ff66;
    if (!floatingGoalFrameMaterial) {
      floatingGoalFrameMaterial = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: currentTheme === "day" ? 0.28 : 0.75,
        metalness: 0.72,
        roughness: 0.25,
      });
    }
    if (!floatingGoalNetMaterial) {
      floatingGoalNetMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: currentTheme === "day" ? 0.42 : 0.68 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            vec2 grid = abs(fract(vUv * vec2(12.0, 7.0)) - 0.5);
            float wires = smoothstep(0.42, 0.49, max(grid.x, grid.y));
            if (wires < 0.04) discard;
            gl_FragColor = vec4(uColor, wires * uOpacity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
    }
    return {
      frame: floatingGoalFrameMaterial,
      net: floatingGoalNetMaterial,
    };
  }

  function createFloatingGoalObstacle() {
    const group = new THREE.Group();
    const goalWidth = 3.1;
    const goalHeight = 1.45;
    const barThickness = 0.13;
    const floatingHeight = 1.82 + Math.random() * 0.16;
    const materials = getFloatingGoalMaterials();
    const barGeometry = new THREE.BoxGeometry(1, 1, 1);
    const frame = new THREE.InstancedMesh(
      barGeometry,
      materials.frame,
      5,
    );
    const transform = new THREE.Object3D();
    const bars = [
      {
        position: [0, goalHeight / 2, -goalWidth / 2],
        scale: [barThickness, goalHeight, barThickness],
      },
      {
        position: [0, goalHeight / 2, goalWidth / 2],
        scale: [barThickness, goalHeight, barThickness],
      },
      {
        position: [0, goalHeight, 0],
        scale: [barThickness, barThickness, goalWidth + barThickness],
      },
      {
        position: [0, -floatingHeight / 2, -goalWidth / 2],
        scale: [barThickness, floatingHeight, barThickness],
      },
      {
        position: [0, -floatingHeight / 2, goalWidth / 2],
        scale: [barThickness, floatingHeight, barThickness],
      },
    ];
    bars.forEach((bar, index) => {
      transform.position.set(...bar.position);
      transform.scale.set(...bar.scale);
      transform.rotation.set(0, 0, 0);
      transform.updateMatrix();
      frame.setMatrixAt(index, transform.matrix);
    });
    frame.instanceMatrix.needsUpdate = true;
    frame.castShadow = true;
    group.add(frame);

    const net = new THREE.Mesh(
      new THREE.PlaneGeometry(goalWidth, goalHeight),
      materials.net,
    );
    net.rotation.y = Math.PI / 2;
    net.position.set(0.06, goalHeight / 2, 0);
    group.add(net);

    group.position.y = floatingHeight;
    group.userData.type = "overhead";
    group.userData.modelName = "floating_soccer_goal";
    // Only the floating goal section blocks the runner. The two ground
    // supports sit outside the lane opening and are visual structure.
    group.userData.localBounds = new THREE.Box3(
      new THREE.Vector3(-barThickness, 0, -goalWidth / 2),
      new THREE.Vector3(barThickness, goalHeight, goalWidth / 2),
    );
    return group;
  }

  function createModelObstacle() {
    const raised = Math.random() < 0.28;
    if (!raised) {
      return Math.random() < 0.5
        ? createHurdleObstacle()
        : createBoxObstacle();
    }
    return createFloatingGoalObstacle();
  }

  function nextSpawnDelay() {
    const factor = Math.max(0.38, 1 - state.survivalTime / 115);
    return Math.max(0.7, (2.2 + Math.random() * 2.7) * factor);
  }

  function gameSpeed() {
    return 5.8 + Math.min(7.5, state.survivalTime * 0.09);
  }

  function spawnObstacle() {
    const object = createModelObstacle();
    object.position.x = 14;
    object.position.z = 0;
    object.userData.speedVariance = Math.random() * 1.2;
    object.userData.scored = false;
    scene.add(object);
    state.obstacles.push(object);
    state.hasSpawned = true;
    state.spawnTimer = nextSpawnDelay();
  }

  const player = createPlayer();
  createWorld();
  setGraphicsQuality(initialGraphicsQuality(), false);
  setTheme(initialTheme(), false);
  loadObstacleModels();
  loadPlayerModel();

  function killPlayerTweens() {
    gsap.killTweensOf(player.position);
    gsap.killTweensOf(player.scale);
  }

  function jump() {
    if (!state.running) return;
    if (state.jumping) {
      if (!state.jumpBoosted && state.jumpTime <= 0.28) {
        state.jumpBoosted = true;
        playPlayerAction(
          superJumpAction || jumpAction || runAction || idleAction,
          0.08,
        );
        playJumpSound(true);
      }
      return;
    }
    killPlayerTweens();
    state.ducking = false;
    state.jumping = true;
    state.jumpTime = 0;
    state.jumpBoosted = false;
    playJumpSound(false);
    playPlayerAction(jumpAction || runAction || idleAction, 0.1);
    player.scale.y = 1;
    player.position.y = 0.08;
    gsap
      .timeline()
      .to(player.scale, {
        x: 0.96,
        y: 1.06,
        z: 0.96,
        duration: 0.11,
        ease: "power2.out",
      })
      .to(player.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.16,
        ease: "power2.inOut",
      });
  }

  function superJump() {
    if (!state.running) return;
    if (!state.jumping) jump();
    if (!state.jumpBoosted) {
      state.jumpBoosted = true;
      playPlayerAction(
        superJumpAction || jumpAction || runAction || idleAction,
        0.08,
      );
      playJumpSound(true);
    }
  }

  function setDuck(pressed) {
    if (!state.running || state.jumping) return;
    if (pressed === state.ducking) return;
    state.ducking = pressed;
    if (pressed) playDuckSound();
    playPlayerAction(
      pressed ? rollAction || runAction || idleAction : runAction || idleAction,
      0.12,
    );
    const preserveAnimatedRollShape =
      selectedRunner === "tron" || selectedRunner === "spiderman";
    gsap.to(player.scale, {
      x: pressed && !preserveAnimatedRollShape ? 1.12 : 1,
      y: pressed && !preserveAnimatedRollShape ? 0.5 : 1,
      z: pressed && !preserveAnimatedRollShape ? 1.12 : 1,
      duration: pressed ? 0.16 : 0.24,
      ease: pressed ? "power3.out" : "back.out(1.8)",
      overwrite: "auto",
    });
  }

  function roll() {
    if (!state.running || state.jumping) return;
    state.rollTime = 0.72;
    setDuck(true);
  }

  function collide() {
    state.running = false;
    state.gameOver = true;
    state.jumping = false;
    state.jumpTime = 0;
    state.jumpBoosted = false;
    state.ducking = false;
    if (runnerSpeedLines) runnerSpeedLines.visible = false;
    if (superJumpLines) superJumpLines.visible = false;
    playImpactSound();
    window.setTimeout(playGameOverSound, 170);
    killPlayerTweens();
    playPlayerAction(idleAction || runAction);
    gsap.to(player.scale, {
      x: 0.94,
      y: 0.94,
      z: 0.94,
      duration: 0.14,
      ease: "power2.out",
    });
    animateFinalScore(state.score);
    restartPanel.hidden = false;
    statusText.textContent = "Collision — press ↑ or restart";
    gsap.fromTo(
      restartButton,
      { opacity: 0, scale: 0.78, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.8)" },
    );
  }

  function clearObstacles() {
    state.obstacles.forEach((obstacle) => scene.remove(obstacle));
    state.obstacles.length = 0;
  }

  function restart() {
    killPlayerTweens();
    clearObstacles();
    Object.assign(state, {
      running: true,
      playerReady: true,
      gameOver: false,
      score: 0,
      scoreClock: 0,
      survivalTime: 0,
      spawnTimer: 5,
      hasSpawned: false,
      jumping: false,
      jumpTime: 0,
      jumpBoosted: false,
      ducking: false,
      rollTime: 0,
    });
    effectTravel = 0;
    player.position.y = 0;
    player.scale.set(1, 1, 1);
    restartPanel.hidden = true;
    updateScoreDisplay(0, true);
    statusText.textContent = "First obstacle in 5 seconds";
    playPlayerAction(runAction || idleAction);
    clock.getDelta();
  }

  function updateGame(delta, elapsed) {
    if (!state.running) return;

    state.survivalTime += delta;
    state.scoreClock += delta;

    if (state.ducking) {
      state.rollTime -= delta;
      if (state.rollTime <= 0) setDuck(false);
    }

    if (state.jumping) {
      const ascentDuration = state.jumpBoosted ? 0.39 : 0.28;
      const fallDuration = state.jumpBoosted ? 0.58 : 0.46;
      const jumpHeight = state.jumpBoosted ? 3.05 : 1.85;
      state.jumpTime += delta;

      if (state.jumpTime <= ascentDuration) {
        const progress = state.jumpTime / ascentDuration;
        player.position.y =
          jumpHeight * (1 - Math.pow(1 - progress, 2.35));
      } else {
        const progress = Math.min(
          1,
          (state.jumpTime - ascentDuration) / fallDuration,
        );
        player.position.y = jumpHeight * (1 - progress * progress);
        if (progress >= 1) {
          state.jumping = false;
          state.jumpTime = 0;
          state.jumpBoosted = false;
          player.position.y = 0;
          playPlayerAction(runAction || idleAction, 0.12);
          gsap
            .timeline()
            .to(player.scale, {
              x: 1.07,
              y: 0.91,
              z: 1.07,
              duration: 0.09,
              ease: "power2.out",
            })
            .to(player.scale, {
              x: 1,
              y: 1,
              z: 1,
              duration: 0.18,
              ease: "back.out(1.5)",
            });
        }
      }
    }

    while (state.scoreClock >= 1) {
      state.score += 1;
      state.scoreClock -= 1;
    }

    state.spawnTimer -= delta;
    if (state.spawnTimer <= 0) spawnObstacle();

    const worldSpeed = gameSpeed();
    effectTravel += worldSpeed * delta;
    roadMarkers.forEach((marker) => {
      marker.position.x -= worldSpeed * delta;
      if (marker.position.x < -44) marker.position.x += 88;
    });
    cityBlocks.forEach((block) => {
      block.position.x -= worldSpeed * block.userData.parallax * delta;
      if (block.position.x < -34) block.position.x += 68;
    });
    if (speedParticles) {
      speedParticles.material.uniforms.uTravel.value = effectTravel;
    }
    if (runnerSpeedLines) {
      runnerSpeedLines.visible = state.running;
      runnerSpeedLines.material.uniforms.uTravel.value = effectTravel;
    }
    if (superJumpLines) {
      superJumpLines.visible = state.jumping && state.jumpBoosted;
      if (superJumpLines.visible) {
        superJumpLines.material.uniforms.uTravel.value = effectTravel;
      }
    }

    player.updateMatrixWorld(true);
    if (player.userData.localBounds) {
      playerBox.copy(player.userData.localBounds).applyMatrix4(player.matrixWorld);
    } else {
      playerBox.setFromObject(player);
    }
    // Tron and Spider-Man already crouch through their authored roll clips.
    // Keep their meshes undistorted while retaining the shorter duck hitbox.
    if (
      state.ducking &&
      (selectedRunner === "tron" || selectedRunner === "spiderman")
    ) {
      playerBox.max.y = playerBox.min.y + (playerBox.max.y - playerBox.min.y) * 0.5;
    }

    for (let index = state.obstacles.length - 1; index >= 0; index -= 1) {
      const obstacle = state.obstacles[index];
      obstacle.userData.speed =
        worldSpeed + obstacle.userData.speedVariance;
      obstacle.position.x -= obstacle.userData.speed * delta;
      obstacle.userData.mixer?.update(delta);
      obstacle.userData.rotors?.forEach((rotor, rotorIndex) => {
        rotor.rotation.y += delta * (rotorIndex ? -15 : 15);
      });
      obstacle.updateMatrixWorld(true);
      if (obstacle.userData.localBounds) {
        obstacleBox
          .copy(obstacle.userData.localBounds)
          .applyMatrix4(obstacle.matrixWorld);
      } else {
        obstacleBox.setFromObject(obstacle);
      }

      if (playerBox.intersectsBox(obstacleBox)) {
        collide();
        return;
      }

      if (!obstacle.userData.scored && obstacleBox.max.x < playerBox.min.x) {
        obstacle.userData.scored = true;
        state.score += 10;
      }

      if (obstacle.position.x < -13) {
        scene.remove(obstacle);
        state.obstacles.splice(index, 1);
      }
    }

    updateScoreDisplay(state.score);
    if (state.jumping) {
      setStatus("Jump");
    } else if (state.ducking) {
      setStatus("Roll");
    } else if (!state.hasSpawned) {
      setStatus(`First obstacle in ${Math.max(
        0,
        Math.ceil(state.spawnTimer),
      )} seconds`);
    } else {
      setStatus("Keep moving");
    }
  }

  function animate() {
    visualFrame += 1;
    fpsFrameCount += 1;
    const fpsNow = performance.now();
    const fpsSampleDuration = fpsNow - fpsSampleStarted;
    if (fpsSampleDuration >= 500) {
      const measuredFps = Math.round(
        (fpsFrameCount * 1000) / fpsSampleDuration,
      );
      fpsMeter.textContent = `FPS ${measuredFps}`;
      applyAdaptiveResolution(measuredFps, fpsNow);
      fpsFrameCount = 0;
      fpsSampleStarted = fpsNow;
    }

    const delta = Math.min(clock.getDelta(), 0.04);
    const elapsed = clock.elapsedTime;
    updateGame(delta, elapsed);

    if (runAction && activePlayerAction === runAction && state.running) {
      runAction.timeScale = Math.min(2.3, gameSpeed() / 5.8);
    }
    if (playerMixer) {
      playerMixer.timeScale = 1;
      playerMixer.update(delta);
    }

    if (stars?.visible) stars.rotation.y = elapsed * 0.003;
    if (visualFrame % 2 === 0) {
      const baseOpacity = currentTheme === "day" ? 0.18 : 0.42;
      const pulseOpacity = currentTheme === "day" ? 0.04 : 0.12;
      neonMaterials.forEach((neon, index) => {
        neon.opacity =
          baseOpacity + Math.sin(elapsed * 1.5 + index) * pulseOpacity;
      });
    }
    const rimBase = currentTheme === "spiderman" ? 18 : currentTheme === "day" ? 6 : 16;
    rimLight.intensity = rimBase + Math.sin(elapsed * 1.7) * 2;
    camera.position.y = cameraBaseY + Math.sin(elapsed * 0.45) * 0.06;
    camera.lookAt(-0.8, 1.55, -1.2);
    camera.rotation.z = 0;
    if (ownsRenderer) renderer.render(scene, camera);
  }

  document.addEventListener(
    "keydown",
    (event) => {
      ensureAudio();
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (event.repeat) return;
        if (state.gameOver) restart();
        else if (state.running) jump();
      }
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        if (event.repeat) return;
        if (state.gameOver) restart();
        else if (state.running) jump();
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!event.repeat) roll();
      }
    },
    true,
  );

  window.addEventListener("blur", () => setDuck(false));

  let pointerStart = null;
  let lastUpActionAt = 0;
  const activateJump = () => {
    const now = performance.now();
    if (now - lastUpActionAt <= 320) superJump();
    else jump();
    lastUpActionAt = now;
  };

  canvas.addEventListener("pointerdown", (event) => {
    ensureAudio();
    pointerStart = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      button: event.button,
    };
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const start = pointerStart;
    pointerStart = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const isSwipe = Math.abs(dy) >= 42 && Math.abs(dy) > Math.abs(dx);

    if (start.button === 2 || (isSwipe && dy > 0)) {
      roll();
    } else if (isSwipe && dy < 0) {
      activateJump();
    } else if (start.button === 0 && Math.hypot(dx, dy) < 18) {
      activateJump();
    }
  });
  canvas.addEventListener("pointercancel", () => {
    pointerStart = null;
  });
  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    ensureAudio();
    roll();
  });
  jumpControl.addEventListener("click", () => {
    ensureAudio();
    jump();
  });
  superJumpControl.addEventListener("click", () => {
    ensureAudio();
    superJump();
  });
  rollControl.addEventListener("click", () => {
    ensureAudio();
    roll();
  });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    setCameraView();
    renderer.setPixelRatio(
      graphicsQuality === "high"
        ? Math.min(window.devicePixelRatio || 1, 1.5)
        : Math.min(window.devicePixelRatio || 1, adaptivePixelRatio),
    );
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  restartButton.addEventListener("click", () => {
    ensureAudio();
    restart();
  });
  guideToggle.addEventListener("click", () => {
    if (gameGuide.hidden) openGameGuide();
    else closeGameGuide();
  });
  guideClose.addEventListener("click", closeGameGuide);
  guidePlay.addEventListener("click", closeGameGuide);
  gameGuide.addEventListener("click", (event) => {
    if (event.target === gameGuide) closeGameGuide();
  });
  runnerToggle.addEventListener("click", openRunnerSelect);
  runnerOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const runnerId = option.dataset.runner;
      if (runnerId === selectedRunner) {
        closeRunnerSelect();
        return;
      }

      runnerOptions.forEach((button) => {
        button.disabled = true;
      });
      const runnerNames = {
        tron: "Tron Legend",
        sonic: "Sonic Blue",
        tails: "Sonic Yellow",
        nicky: "Nicky",
        chacha: "Cha Cha",
        zombie: "Diaper Zombie",
        spiderman: "Spider-Man",
      };
      const runnerSources = {
        tron: "players/neon_runner_animations_set/scene.gltf",
        sonic:
          "players/animations_sonic_-_sonic_runners_adventure_model/scene.gltf",
        tails: "players/animations_tails_-_sonic_runners_adventure/scene.gltf",
        nicky: "players/nicky/scene.gltf",
        chacha: "players/cha_cha/scene.gltf",
        zombie: "players/diaper_zombie/scene.gltf",
        spiderman: "players/spider-man/scene.gltf",
      };
      runnerLoading.textContent = `Loading ${runnerNames[runnerId]}…`;
      const source = runnerSources[runnerId];
      loadPlayerModel(source, runnerId, (loaded) => {
        runnerOptions.forEach((button) => {
          button.disabled = false;
          const active = button.dataset.runner === selectedRunner;
          button.classList.toggle("is-selected", active);
          button.setAttribute("aria-pressed", String(active));
          button.querySelector(".runner-check").textContent = active
            ? "Selected"
            : "Select";
        });
        if (loaded) {
          runnerLoading.textContent = "";
          closeRunnerSelect();
        } else {
          runnerLoading.textContent = "Runner could not be loaded. Choose another.";
        }
      });
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !gameGuide.hidden) {
      event.preventDefault();
      closeGameGuide();
    }
  });
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.setAttribute(
      "aria-label",
      soundEnabled ? "Mute sound" : "Enable sound",
    );
    if (soundEnabled) {
      ensureAudio();
      if (audioMaster) audioMaster.gain.setTargetAtTime(0.18, audioContext.currentTime, 0.03);
      synthTone(440, 0.09, 0.1, "sine", 660);
    } else if (audioMaster && audioContext) {
      audioMaster.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.03);
    }
  });
  lowGraphicsButton.addEventListener("click", () => {
    setGraphicsQuality("low");
  });
  highGraphicsButton.addEventListener("click", () => {
    setGraphicsQuality("high");
  });
  themeToggle.addEventListener("click", () => {
    if (currentTheme === "spiderman") return;
    setTheme(currentTheme === "night" ? "day" : "night");
  });

  loadHighScore();
  if (ownsRenderer) renderer.setAnimationLoop(animate);
  return { animate, state };
}
