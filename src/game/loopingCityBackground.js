const THEME_STYLE = {
  night: { color: 0x86cda2, opacity: 0.58 },
  day: { color: 0xd8c9a3, opacity: 0.46 },
  spiderman: { color: 0x6f83d9, opacity: 0.56 },
};

export function createLoopingCityBackground(THREE, scene, gsap) {
  const texture = new THREE.TextureLoader().load("/backgound.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(2, 1);
  texture.anisotropy = 4;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: THEME_STYLE.night.color,
    transparent: true,
    opacity: THEME_STYLE.night.opacity,
    depthWrite: false,
    // Scene fog at this depth would erase the supplied image completely.
    // Its theme tint and opacity provide the distant atmospheric fade instead.
    fog: false,
  });

  // Two texture repeats fit this plane at the source image's 3:2 ratio.
  // Moving the texture offset gives an endless skyline with one draw call.
  const skyline = new THREE.Mesh(new THREE.PlaneGeometry(92, 30.67), material);
  skyline.name = "looping-city-background";
  skyline.position.set(0, 6.5, -12.8);
  skyline.renderOrder = -10;
  scene.add(skyline);

  function setTheme(theme, animated = false) {
    const style = THEME_STYLE[theme] || THEME_STYLE.night;
    const targetColor = new THREE.Color(style.color);
    const duration = animated ? 0.85 : 0;
    if (!duration) {
      material.color.copy(targetColor);
      material.opacity = style.opacity;
      return;
    }
    gsap.to(material.color, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration,
      ease: "power2.inOut",
    });
    gsap.to(material, { opacity: style.opacity, duration, ease: "power2.inOut" });
  }

  function update(delta, worldSpeed, running) {
    if (!running) return;
    texture.offset.x = (texture.offset.x + delta * worldSpeed * 0.0125) % 1;
  }

  function setCameraView(view) {
    skyline.visible = view === "side";
  }

  return { skyline, setTheme, setCameraView, update };
}
