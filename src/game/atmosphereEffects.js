function createSoftTexture(THREE, stops) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 5, 64, 64, 62);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createPointLayer(THREE, count, positionFactory, material) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const [x, y, z] = positionFactory();
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, material);
}

export function createAtmosphereEffects(THREE, scene) {
  let highQuality = true;
  let theme = "night";
  let cameraView = "side";

  const cloudTexture = createSoftTexture(THREE, [
    [0, "rgba(255,255,255,0.9)"],
    [0.45, "rgba(255,255,255,0.38)"],
    [1, "rgba(255,255,255,0)"],
  ]);
  const fogTexture = createSoftTexture(THREE, [
    [0, "rgba(255,255,255,0.5)"],
    [0.55, "rgba(255,255,255,0.16)"],
    [1, "rgba(255,255,255,0)"],
  ]);

  const cloudMaterial = new THREE.PointsMaterial({
    map: cloudTexture,
    color: 0xb9d9c6,
    size: 5.8,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const fogMaterial = new THREE.PointsMaterial({
    map: fogTexture,
    color: 0x7fae91,
    size: 4.2,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const clouds = createPointLayer(
    THREE,
    34,
    () => [
      -34 + Math.random() * 68,
      7 + Math.random() * 8,
      -13 + Math.random() * 9,
    ],
    cloudMaterial,
  );
  const fogWisps = createPointLayer(
    THREE,
    46,
    () => [
      -36 + Math.random() * 72,
      0.15 + Math.random() * 2.2,
      -5 + Math.random() * 10,
    ],
    fogMaterial,
  );
  clouds.frustumCulled = false;
  fogWisps.frustumCulled = false;
  clouds.renderOrder = -1;
  fogWisps.renderOrder = 1;
  scene.add(clouds, fogWisps);

  function applyFogDensity() {
    if (!scene.fog) return;
    const densities = {
      night: highQuality ? 0.034 : 0.026,
      day: highQuality ? 0.03 : 0.02,
      spiderman: highQuality ? 0.033 : 0.025,
    };
    const viewMultiplier = cameraView === "back" ? 0.72 : cameraView === "front" ? 0.85 : 1;
    scene.fog.density = densities[theme] * viewMultiplier;
  }

  function setTheme(nextTheme) {
    theme = nextTheme;
    const day = theme === "day";
    const spider = theme === "spiderman";
    cloudMaterial.color.set(spider ? 0x637caf : day ? 0xd8e0df : 0x789988);
    cloudMaterial.opacity = day ? 0.24 : spider ? 0.13 : 0.15;
    fogMaterial.color.set(spider ? 0x334d86 : day ? 0x9ba9a6 : 0x527462);
    fogMaterial.opacity = day ? 0.16 : 0.12;
    applyFogDensity();
  }

  function setHighQuality(enabled) {
    highQuality = enabled;
    clouds.visible = highQuality;
    fogWisps.visible = highQuality;
    applyFogDensity();
  }

  function setCameraView(view) {
    cameraView = view;
    applyFogDensity();
  }

  function update(elapsed) {
    if (!highQuality) return;
    clouds.position.x = Math.sin(elapsed * 0.035) * 4;
    fogWisps.position.x = Math.sin(elapsed * 0.08) * 2.2;
    fogWisps.material.opacity =
      (theme === "day" ? 0.16 : 0.12) + Math.sin(elapsed * 0.35) * 0.025;
  }

  return { setTheme, setHighQuality, setCameraView, update };
}
