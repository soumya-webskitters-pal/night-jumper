import { gsap } from "gsap";
import { runnerById, runnerSources } from "../data/runners";
import { createCameraController } from "./cameraController";
import { bindGameInputs } from "./inputController";
import { createAudioController } from "./audioController";
import { createCollisionSystem } from "./collisionSystem";
import { createElementFactory } from "./elements";
import {
  createGpuMotionMaterial,
  createRoadFoundation,
} from "./worldGeneration";
import { createObstacleFactory } from "./obstacleFactory";
import { createObstacleSpawner } from "./obstacleSpawner";
import { runnerAnimationTimeScale } from "./runnerAnimationController";
import { createGameState, resetGameState } from "./gameState";
import { createScoreController } from "./scoreController";
import { createCountdownController } from "./countdownController";
import { createPlayerMovementController } from "./playerMovementController";
import { createAtmosphereEffects } from "./atmosphereEffects";
import { createDaySun } from "./daySun";
import { createNightMoon } from "./nightMoon";
import { applyThemeTransition } from "./themeTransitionController";
import { createCityGround } from "./cityGround";
import { createLoopingCityBackground } from "./loopingCityBackground";
import { createNearRoadBuildings } from "./nearRoadBuildings";
import { createBuildingSpiderWebs } from "./buildingSpiderWebs";
import { createCameraViewSky } from "./cameraViewSky";
import { createDirectionalCameraFog } from "./directionalCameraFog";

export function startJumper3D(
  THREE,
  GLTFLoader,
  DRACOLoader,
  runtime = {},
) {
  const canvas = runtime.renderer?.domElement || document.querySelector("#gameCanvas");
  const hud = document.querySelector(".hud");
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
  const cameraToggle = document.querySelector("#cameraToggle");
  const countdownOverlay = document.querySelector("#countdownOverlay");
  const countdownLabel = document.querySelector("#countdownLabel");
  const countdownValue = document.querySelector("#countdownValue");
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
  const cameraController = createCameraController(THREE, camera);

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

  const state = createGameState();
  const atmosphereEffects = createAtmosphereEffects(THREE, scene);
  const daySun = createDaySun(THREE, scene, gsap);
  const nightMoon = createNightMoon(THREE, scene, gsap);
  const cityGround = createCityGround(THREE, scene, gsap);
  const loopingCityBackground = createLoopingCityBackground(THREE, scene, gsap);
  const cameraViewSky = createCameraViewSky(THREE, scene, gsap);
  const directionalCameraFog = createDirectionalCameraFog(THREE, scene, gsap);

  const clock = new THREE.Clock();
  const neonMaterials = [];
  const windowMaterials = [];
  const roadMarkers = [];
  const cityBlocks = [];
  let nearRoadCity = null;
  let buildingSpiderWebs = null;
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
  let aboutWasRunning = false;
  let settingsWasRunning = false;
  let aboutDialogOpen = false;
  let runnerSelectionShown = false;
  let selectedRunner = "tron";
  let playerModel = null;
  let stars = null;
  let roadMaterial = null;
  let curbMaterial = null;
  let laneMaterial = null;
  let lastStatusMessage = "";
  let visualFrame = 0;
  let effectTravel = 0;

  const audio = createAudioController(() => state.running);
  const ensureAudio = audio.ensure;
  const playJumpSound = audio.playJump;
  const playDuckSound = audio.playRoll;
  const playImpactSound = audio.playImpact;
  const playGameOverSound = audio.playGameOver;
  const collisionSystem = createCollisionSystem(THREE);
  const { material, mesh } = createElementFactory(THREE);
  const obstacleFactory = createObstacleFactory(THREE, renderer);
  const obstacleSpawner = createObstacleSpawner({
    scene,
    state,
    factory: obstacleFactory,
    nextSpawnDelay,
    getSpawnX: () => cameraController.getView() === "back" ? 24 : 14,
  });
  const scoreController = createScoreController({
    gsap,
    state,
    scoreValue,
    highScoreValue,
    finalScoreValue,
  });
  const loadHighScore = scoreController.loadHighScore;
  const updateScoreDisplay = scoreController.updateDisplay;
  const animateFinalScore = scoreController.animateFinal;
  const countdownController = createCountdownController({
    state,
    overlay: countdownOverlay,
    label: countdownLabel,
    value: countdownValue,
    isReady: () => state.playerReady && state.obstaclesReady,
    onPause: () => {
      setDuck(false);
      playPlayerAction(idleAction || runAction);
    },
    onStart: () => {
      playPlayerAction(runAction || idleAction);
      clock.getDelta();
    },
  });
  const cancelCountdown = countdownController.cancel;
  const beginCountdown = countdownController.begin;

  function setStatus(message) {
    if (message === lastStatusMessage) return;
    lastStatusMessage = message;
    if (statusText) statusText.textContent = message;
  }

  function openGameGuide() {
    if (!gameGuide.hidden) return;
    cancelCountdown();
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
      beginCountdown();
    }
    guideToggle.focus();
  }

  function openRunnerSelect() {
    if (!runnerSelect.hidden) return;
    cancelCountdown();
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
      beginCountdown();
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
        setStatus("First obstacle in 5 seconds");
        clock.getDelta();
        openGameGuide();
      }
    }, remaining);
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
    if (persist && !spider) {
      localStorage.setItem("night-runner-theme", currentTheme);
    }

    document.documentElement.dataset.theme = currentTheme;
    const themeLabel = themeToggle.querySelector(".hud-action-label");
    if (themeLabel) {
      themeLabel.textContent = spider ? "Spider" : day ? "Day" : "Night";
    }
    themeToggle.setAttribute("aria-pressed", String(day));
    themeToggle.setAttribute(
      "aria-label",
      spider
        ? "Theme locked for Spider-Man"
        : day
          ? "Switch to night mode"
          : "Switch to day mode",
    );

    const animateTheme = loadingCompleteScheduled;
    applyThemeTransition({
      gsap,
      theme: currentTheme,
      animated: animateTheme,
      scene,
      renderer,
      roadMaterial,
      curbMaterial,
      laneMaterial,
      lights: {
        hemisphere: hemisphereLight,
        moon: moonLight,
        rim: rimLight,
        city: cityGlow,
      },
    });
    spiderRedLight.visible = spider;
    spiderBlueLight.visible = spider;
    buildingSpiderWebs?.setVisible(spider);

    atmosphereEffects.setTheme(currentTheme);
    daySun.setTheme(currentTheme, animateTheme);
    nightMoon.setTheme(currentTheme, animateTheme);
    cityGround.setTheme(currentTheme, animateTheme);
    loopingCityBackground.setTheme(currentTheme, animateTheme);
    cameraViewSky.setTheme(currentTheme, animateTheme);
    directionalCameraFog.setTheme(currentTheme, animateTheme);
    obstacleFactory.setTheme(currentTheme);
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
    renderer.shadowMap.enabled = high;
    renderer.shadowMap.autoUpdate = high;
    renderer.shadowMap.needsUpdate = high;
    renderer.shadowMap.type = high
      ? THREE.PCFSoftShadowMap
      : THREE.PCFShadowMap;
    moonLight.castShadow = high;
    moonLight.shadow.mapSize.set(high ? 2048 : 1024, high ? 2048 : 1024);

    if (speedParticles) speedParticles.visible = true;
    if (runnerSpeedLines) runnerSpeedLines.visible = state.running;
    if (superJumpLines) {
      superJumpLines.visible = state.jumping && state.jumpBoosted;
    }
    if (stars) stars.visible = currentTheme !== "day";
    atmosphereEffects.setHighQuality(high);

    cityBlocks.forEach((block) => {
      block.visible = block.userData.cameraManaged
        ? Boolean(block.userData.cameraVisible)
        : true;
      block.traverse((object) => {
        if (object.userData.highQualityOnly) object.visible = high;
        if (object.userData.buildingMesh) {
          object.material = high
            ? object.userData.litMaterial
            : object.userData.flatMaterial;
        }
      });
    });
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

  function createWorld() {
    const roadFoundation = createRoadFoundation(THREE, scene, {
      mesh,
      material,
    });
    roadMaterial = roadFoundation.roadMaterial;
    curbMaterial = roadFoundation.curbMaterial;
    laneMaterial = roadFoundation.laneMaterial;
    roadMarkers.push(...roadFoundation.roadMarkers);

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
      createGpuMotionMaterial(THREE, {
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
      createGpuMotionMaterial(THREE, {
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
      createGpuMotionMaterial(THREE, {
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
    // Keep only the foreground row close to the road. The repeating image
    // provides the distant skyline without additional far-away 3D buildings.
    nearRoadCity = createNearRoadBuildings(THREE, scene);
    buildingSpiderWebs = createBuildingSpiderWebs(THREE, nearRoadCity.blocks);
    cityBlocks.push(...nearRoadCity.blocks);
    windowMaterials.push(...nearRoadCity.windowMaterials);
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
        setStatus("Get ready");
        finishLoadingIfReady();
        onComplete?.(true);
      };
    const handleError = (error) => {
      console.error(`Unable to load ${runnerId} runner`, error);
      setStatus(`Could not load ${runnerId} runner`);
      state.playerReady = true;
      finishLoadingIfReady();
      onComplete?.(false);
    };

    loader.load(source, handleLoad, undefined, handleError);
  }

  async function loadObstacleModels() {
    // Ground obstacles and floating goals are procedural, so no obstacle GLTF
    // downloads are needed.
    state.obstaclesReady = true;
    finishLoadingIfReady();
  }

  function nextSpawnDelay() {
    const factor = Math.max(0.38, 1 - state.survivalTime / 115);
    return Math.max(0.7, (2.2 + Math.random() * 2.7) * factor);
  }

  function gameSpeed() {
    return 5.8 + Math.min(7.5, state.survivalTime * 0.09);
  }

  function spawnObstacle() {
    obstacleSpawner.spawn();
  }

  const player = createPlayer();
  const playerMovement = createPlayerMovementController({
    gsap,
    state,
    player,
    getActions: () => ({
      idle: idleAction,
      run: runAction,
      roll: rollAction,
      jump: jumpAction,
      superJump: superJumpAction,
    }),
    getSelectedRunner: () => selectedRunner,
    playAction: playPlayerAction,
    playJumpSound,
    playRollSound: playDuckSound,
  });
  const jump = playerMovement.jump;
  const superJump = playerMovement.superJump;
  const setDuck = playerMovement.setDuck;
  const roll = playerMovement.roll;
  const killPlayerTweens = playerMovement.killTweens;
  createWorld();
  setGraphicsQuality(initialGraphicsQuality(), false);
  setTheme(initialTheme(), false);
  loadObstacleModels();
  loadPlayerModel();

  function collide() {
    cancelCountdown();
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
    setStatus("Collision — press ↑ or restart");
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
    cancelCountdown();
    killPlayerTweens();
    clearObstacles();
    resetGameState(state);
    effectTravel = 0;
    player.position.y = 0;
    player.scale.set(1, 1, 1);
    restartPanel.hidden = true;
    updateScoreDisplay(0, true);
    setStatus("First obstacle in 5 seconds");
    playPlayerAction(idleAction || runAction);
    beginCountdown();
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
      const jumpHeight = state.jumpBoosted ? 3.05 : 2.1;
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
      const wrapMin = block.userData.wrapMin ?? -34;
      const wrapRange = block.userData.wrapRange ?? 68;
      if (block.position.x < wrapMin) block.position.x += wrapRange;
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

    if (
      collisionSystem.update({
        player,
        obstacles: state.obstacles,
        state,
        selectedRunner,
        worldSpeed,
        delta,
        scene,
        onCollision: collide,
      })
    ) {
      return;
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
    hud?.classList.toggle("is-running", state.running);
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
    atmosphereEffects.update(elapsed);
    daySun.update(elapsed);
    nightMoon.update(elapsed);
    loopingCityBackground.update(delta, gameSpeed(), state.running);
    updateGame(delta, elapsed);

    if (runAction && activePlayerAction === runAction && state.running) {
      runAction.timeScale = Math.min(2.3, gameSpeed() / 5.8);
    }
    if (playerMixer) {
      playerMixer.timeScale = runnerAnimationTimeScale(selectedRunner, state);
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
    cameraController.update(elapsed);
    if (ownsRenderer) renderer.render(scene, camera);
  }

  bindGameInputs({
    canvas,
    controls: {
      jump: jumpControl,
      superJump: superJumpControl,
      roll: rollControl,
    },
    getState: () => state,
    ensureAudio,
    jump,
    superJump,
    roll,
    stopRoll: () => setDuck(false),
    restart,
  });
  window.addEventListener("resize", () => {
    cameraController.resize();
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
  window.addEventListener("night-runner:settings-open", () => {
    settingsWasRunning = state.running;
    cancelCountdown();
    state.running = false;
    setDuck(false);
    playPlayerAction(idleAction || runAction);
  });
  window.addEventListener("night-runner:settings-close", () => {
    window.setTimeout(() => {
      if (aboutDialogOpen) {
        settingsWasRunning = false;
        return;
      }
      const shouldResume =
        settingsWasRunning &&
        !state.gameOver &&
        gameGuide.hidden &&
        runnerSelect.hidden;
      settingsWasRunning = false;
      if (shouldResume) beginCountdown();
    }, 0);
  });
  window.addEventListener("night-runner:about-open", () => {
    aboutDialogOpen = true;
    aboutWasRunning = state.running || settingsWasRunning;
    cancelCountdown();
    state.running = false;
    setDuck(false);
    playPlayerAction(idleAction || runAction);
  });
  window.addEventListener("night-runner:about-close", () => {
    aboutDialogOpen = false;
    const shouldResume = aboutWasRunning && !state.gameOver;
    aboutWasRunning = false;
    if (shouldResume) beginCountdown();
  });
  function applyCameraViewEffects(cameraView) {
    nearRoadCity?.setCameraView(cameraView);
    loopingCityBackground.setCameraView(cameraView);
    atmosphereEffects.setCameraView(cameraView);
    cameraViewSky.setCameraView(cameraView);
    directionalCameraFog.setCameraView(cameraView);
  }

  cameraToggle.addEventListener("click", () => {
    const cameraView = cameraController.cycle();
    applyCameraViewEffects(cameraView);
    const label = `${cameraView[0].toUpperCase()}${cameraView.slice(1)}`;
    cameraToggle.dataset.cameraView = cameraView;
    cameraToggle.title = `Camera: ${label} view`;
    cameraToggle.setAttribute(
      "aria-label",
      `Camera view: ${label}. Change camera angle`,
    );
  });
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
      runnerLoading.classList.add("is-active");
      runnerLoading.textContent = `Loading ${runnerById[runnerId].name}…`;
      const source = runnerSources[runnerId];
      loadPlayerModel(source, runnerId, (loaded) => {
        runnerLoading.classList.remove("is-active");
        runnerOptions.forEach((button) => {
          button.disabled = false;
          const active = button.dataset.runner === selectedRunner;
          button.classList.toggle("is-selected", active);
          button.setAttribute("aria-pressed", String(active));
          button.querySelector(".runner-check").textContent = active
            ? "✓"
            : "";
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
    const soundEnabled = audio.toggle();
    soundToggle.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle.setAttribute(
      "aria-label",
      soundEnabled ? "Mute sound" : "Enable sound",
    );
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
