# Night Runner

Night Runner is a responsive neon endless-runner game built with React and
Three.js. Run through a procedural city, avoid themed obstacles, switch camera
angles, and chase a persistent high score.

## Play

[Play Night Runner on Netlify](https://night-jumper.netlify.app)

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Jump | Click, `Space`, or `↑` | Tap, swipe up, or Jump button |
| Super jump | Double-click or rapidly press `↑` twice | Double-tap, double-swipe up, or Super button |
| Roll | Right-click or `↓` | Swipe down or Roll button |

The game displays a Ready prompt and a `3 → 2 → 1` countdown before every run.

## Runners

- Tron Legend
- Sonic Blue
- Sonic Yellow
- Spider-Man
- Nicky
- Cha Cha
- Diaper Zombie

Runner previews load with the interface. Full animated 3D models load only when
selected. The selection window supports responsive Grid and List layouts.

## Features

- Normal jump, super jump, and one-tap roll
- Side, front, and back camera views with smooth animated transitions
- Night, Day, and Spider-Man visual themes
- Shader-animated sun, moon, corona, craters, and themed sky
- Infinite scrolling image skyline behind camera-aware 3D building rows
- Dense lightweight gradient fog hiding front/back horizon cutoffs
- Building-mounted Spider-Man webs that move with the city
- Procedural wooden hurdles and textured metal boxes
- Instanced floating soccer-goal obstacles with shader-based nets
- Random obstacle selection and adaptive spawn timing
- Low and High graphics modes
- Adaptive pixel ratio, flat buildings, and disabled shadows in Low mode
- GPU-assisted city, particle, and speed-line effects
- Animated character selection with loading overlay
- Pause-aware settings, guide, and About popups
- Persistent high scores using IndexedDB
- Responsive HUD and mobile gameplay controls
- Automatic commit-based version management
- Android APK support through Capacitor

## Run locally

Requirements:

- Node.js
- npm

```bash
git clone https://github.com/soumya-webskitters-pal/night-jumper.git
cd night-jumper
npm install
npm run version:setup
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Android

Synchronize the web build with the Android project:

```bash
npm run android:sync
```

Create a debug APK:

```bash
npm run android:apk
```

## Version management

The current release version is read from `package.json` and displayed in the
About popup.

After running `npm run version:setup`, each commit updates the version and logs
the changed files in `VERSION_HISTORY.md`.

- Normal commits increment the minor version: `1.0.0 → 1.1.0`
- Breaking commits increment the major version: `1.x.x → 2.0.0`

Create a major release with:

```bash
VERSION_BUMP=major git commit -m "feat!: describe the breaking change"
```

Check the next calculated versions with:

```bash
npm run version:status
```

See [VERSIONING.md](./VERSIONING.md) for complete details.

## Architecture

New features are implemented as focused components or modules. The main engine
coordinates them without owning their internal behavior.

```text
src/
├── components/
│   ├── GameCanvas.jsx
│   └── ui/
│       ├── settings and About components
│       ├── runner-selection components
│       └── HUD, guide, loader, and countdown components
├── data/
│   └── runners.js
├── game/
│   ├── audioController.js
│   ├── atmosphereEffects.js
│   ├── buildingSpiderWebs.js
│   ├── cameraController.js
│   ├── cameraViewSky.js
│   ├── celestialShaders.js
│   ├── cityGround.js
│   ├── collisionSystem.js
│   ├── countdownController.js
│   ├── daySun.js
│   ├── directionalCameraFog.js
│   ├── gameState.js
│   ├── inputController.js
│   ├── loopingCityBackground.js
│   ├── nearRoadBuildings.js
│   ├── nightMoon.js
│   ├── obstacleFactory.js
│   ├── obstacleSpawner.js
│   ├── playerMovementController.js
│   ├── runnerAnimationController.js
│   ├── scoreController.js
│   ├── themeTransitionController.js
│   ├── worldGeneration.js
│   └── engine.js
└── styles/
    ├── about.css
    ├── controls.css
    ├── dialogs.css
    ├── hud.css
    ├── responsive.css
    └── themes.css
```

## Technology

- React
- React Three Fiber
- Three.js
- GSAP
- Vite
- IndexedDB
- Capacitor
- Netlify

## Credits

Vibe coder: **Soumya Pal**  
Created with **Codex**

3D models and related assets retain the licensing terms included with their
respective source assets.
