import { createSunShaderMaterials } from "./celestialShaders";

export function createDaySun(THREE, scene, gsap) {
  const group = new THREE.Group();
  group.name = "day-sun";
  group.position.set(-13, 12, -12.2);

  const shaderMaterials = createSunShaderMaterials(THREE);
  const disc = new THREE.Mesh(new THREE.SphereGeometry(1.65, 40, 32), shaderMaterials.surface);
  const corona = new THREE.Mesh(new THREE.SphereGeometry(2.55, 32, 24), shaderMaterials.corona);
  group.add(corona, disc);
  group.visible = false;
  scene.add(group);

  function setTheme(theme, animated = true) {
    const show = theme === "day";
    gsap.killTweensOf(group.scale);
    gsap.killTweensOf(group.position);
    if (!animated) {
      group.visible = show;
      group.scale.setScalar(1);
      group.position.y = 12;
      return;
    }
    if (show) {
      group.visible = true;
      group.scale.setScalar(0.65);
      group.position.y = 8.6;
      gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(1.7)" });
      gsap.to(group.position, { y: 12, duration: 0.9, ease: "power2.out" });
    } else {
      gsap.to(group.scale, { x: 0.68, y: 0.68, z: 0.68, duration: 0.45, ease: "power2.in" });
      gsap.to(group.position, {
        y: 8.4,
        duration: 0.45,
        ease: "power2.in",
        onComplete: () => { group.visible = false; },
      });
    }
  }

  function update(elapsed) {
    if (!group.visible) return;
    shaderMaterials.surface.uniforms.uTime.value = elapsed;
    shaderMaterials.corona.uniforms.uTime.value = elapsed;
    corona.scale.setScalar(1 + Math.sin(elapsed * 0.62) * 0.045);
  }

  return { setTheme, update };
}
