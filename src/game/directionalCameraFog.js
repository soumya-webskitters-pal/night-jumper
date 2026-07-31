const FOG_COLORS = {
  night: 0x12251f,
  day: 0x9eb5b1,
  spiderman: 0x111d43,
};

function createGradientTexture(THREE) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  const vertical = context.createLinearGradient(0, 128, 0, 0);
  vertical.addColorStop(0, "rgba(255,255,255,0.72)");
  vertical.addColorStop(0.45, "rgba(255,255,255,0.88)");
  vertical.addColorStop(1, "rgba(255,255,255,1)");
  context.fillStyle = vertical;
  context.fillRect(0, 0, 128, 128);

  context.globalCompositeOperation = "destination-in";
  const horizontal = context.createLinearGradient(0, 0, 128, 0);
  horizontal.addColorStop(0, "rgba(255,255,255,0)");
  horizontal.addColorStop(0.08, "rgba(255,255,255,1)");
  horizontal.addColorStop(0.92, "rgba(255,255,255,1)");
  horizontal.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = horizontal;
  context.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createDirectionalCameraFog(THREE, scene, gsap) {
  const material = new THREE.MeshBasicMaterial({
    map: createGradientTexture(THREE),
    color: FOG_COLORS.night,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });

  // A cached gradient texture replaces the animated fragment shader, avoiding
  // per-pixel noise calculations and reducing transparent overdraw cost.
  const fog = new THREE.Mesh(new THREE.PlaneGeometry(50, 26), material);
  fog.name = "directional-camera-gradient-fog";
  fog.rotation.y = Math.PI / 2;
  fog.position.y = 9;
  fog.renderOrder = 900;
  fog.visible = false;
  scene.add(fog);

  function setCameraView(view) {
    fog.visible = view === "front" || view === "back";
    if (view === "front") fog.position.x = -29;
    if (view === "back") fog.position.x = 31;
  }

  function setTheme(theme, animated = false) {
    const target = new THREE.Color(FOG_COLORS[theme] || FOG_COLORS.night);
    const duration = animated ? 0.85 : 0;
    if (!duration) {
      material.color.copy(target);
      return;
    }
    gsap.to(material.color, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration,
      ease: "power2.inOut",
    });
  }

  return { setCameraView, setTheme };
}
