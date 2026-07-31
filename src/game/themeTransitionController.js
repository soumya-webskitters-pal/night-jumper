function setOrAnimateColor(gsap, color, target, duration) {
  const destination = color.clone().set(target);
  if (!duration) {
    color.copy(destination);
    return;
  }
  gsap.to(color, {
    r: destination.r,
    g: destination.g,
    b: destination.b,
    duration,
    ease: "power2.inOut",
  });
}

export function applyThemeTransition({
  gsap,
  theme,
  animated,
  scene,
  renderer,
  roadMaterial,
  curbMaterial,
  laneMaterial,
  lights,
}) {
  const day = theme === "day";
  const spider = theme === "spiderman";
  const duration = animated ? 0.85 : 0;
  const color = (spiderColor, dayColor, nightColor) =>
    spider ? spiderColor : day ? dayColor : nightColor;

  setOrAnimateColor(gsap, scene.background, color(0x030716, 0xaec9c6, 0x030706), duration);
  setOrAnimateColor(gsap, scene.fog.color, color(0x07142c, 0xc3d2ce, 0x07100c), duration);
  if (roadMaterial) {
    setOrAnimateColor(gsap, roadMaterial.color, color(0x070b1b, 0x3f4a47, 0x070d0a), duration);
    gsap.to(roadMaterial, { roughness: day ? 0.82 : 0.72, metalness: day ? 0.16 : 0.35, duration });
  }
  if (curbMaterial) {
    setOrAnimateColor(gsap, curbMaterial.color, color(0x172446, 0x75827e, 0x123326), duration);
  }
  if (laneMaterial) {
    setOrAnimateColor(gsap, laneMaterial.color, color(0xff263d, 0xe2b855, 0x63c98c), duration);
  }

  const { hemisphere, moon, rim, city } = lights;
  setOrAnimateColor(gsap, hemisphere.color, color(0x4169ff, 0xe4fff2, 0x7ac69a), duration);
  setOrAnimateColor(gsap, hemisphere.groundColor, color(0x160208, 0x52645c, 0x050807), duration);
  setOrAnimateColor(gsap, moon.color, color(0x7da6ff, 0xfff0c4, 0xb8ffd5), duration);
  setOrAnimateColor(gsap, rim.color, color(0xff2438, 0xffb52e, 0x32d976), duration);
  setOrAnimateColor(gsap, city.color, color(0x2266ff, 0xe6a128, 0x32a967), duration);
  gsap.to(hemisphere, { intensity: spider ? 1.5 : day ? 2.2 : 1.15, duration });
  gsap.to(moon, { intensity: spider ? 2.1 : day ? 1.8 : 3.2, duration });
  gsap.to(rim, { intensity: spider ? 18 : day ? 8 : 20, duration });
  gsap.to(city, { intensity: spider ? 22 : day ? 7 : 25, duration });
  gsap.to(renderer, { toneMappingExposure: day ? 1.08 : 1.15, duration });
}
