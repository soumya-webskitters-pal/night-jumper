# Night Runner

A neon endless runner built with Three.js. Run through a dark futuristic city, jump over barriers, roll beneath flying obstacles, and chase your highest score.

## Play

[Play Night Runner on Netlify](night-jumper.netlify.app)

## Game controls

| Action | Control |
| --- | --- |
| Jump | Click, tap, swipe up, or press `Space` / `↑` |
| Super jump | Double-click, double-tap, double-swipe up, or rapidly press `↑` twice |
| Roll | Right-click, swipe down, press `↓`, or tap the Roll button |

## Runners

Choose a runner before starting or change characters during the game:

- Tron Legend — default neon runner
- Sonic Blue
- Sonic Yellow
- Nicky
- Cha Cha
- Diaper Zombie

Only the default runner model loads during startup. Other 3D character models load when selected, while their lightweight preview images load with the page.

## Features

- Animated 3D runner models
- Increasing game speed and difficulty
- Normal and super jumps
- Ground and flying obstacles
- Character-selection menu
- Low and High graphics modes
- Adaptive resolution in Low graphics mode
- Background music and gameplay sound effects
- Sound toggle
- Current and highest scores
- Highest-score persistence with IndexedDB
- Live FPS meter
- Responsive controls and menus
- Neon particles, speed lines, shadows, and visual effects

## Run locally

```bash
cd /path/to/night_runner
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Technology

- React
- React Three Fiber
- Three.js
- GSAP
- HTML5
- CSS3
- JavaScript
- IndexedDB
- Netlify

## Project structure

```text
.
├── src/
│   ├── components/
│   ├── game/
│   ├── App.jsx
│   ├── main.jsx
│   └── style.css
├── public/
│   ├── players/
│   └── obstacles/
├── index.html
├── package.json
└── vite.config.js
```

## Credits

Created by ChatGPT.  
Hosted by Netlify. 
Vibe coder: **Soumya Pal**.

3D models and related assets retain the licensing terms included in their respective asset folders.
