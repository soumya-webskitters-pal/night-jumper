import { createMoonShaderMaterials } from "./celestialShaders";

export function createNightMoon(THREE, scene, gsap) {
  const group = new THREE.Group();
  group.name = "night-moon";
  group.position.set(-13, 12, -12.2);

  const shaderMaterials = createMoonShaderMaterials(THREE);
  const disc = new THREE.Mesh(
    new THREE.SphereGeometry(1.7, 40, 32),
    shaderMaterials.surface,
  );
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.45, 28, 22),
    shaderMaterials.halo,
  );
  group.add(halo, disc);
  scene.add(group);

  function setTheme(theme, animated = true) {
    const show = theme === "night";
    gsap.killTweensOf(group.scale);
    gsap.killTweensOf(group.position);
    gsap.killTweensOf(shaderMaterials.surface.uniforms.uOpacity);
    gsap.killTweensOf(shaderMaterials.halo.uniforms.uOpacity);

    if (!animated) {
      group.visible = show;
      group.scale.setScalar(1);
      group.position.y = 12;
      shaderMaterials.surface.uniforms.uOpacity.value = 1;
      shaderMaterials.halo.uniforms.uOpacity.value = 0.24;
      return;
    }

    if (show) {
      group.visible = true;
      group.scale.setScalar(0.68);
      group.position.y = 8.6;
      shaderMaterials.surface.uniforms.uOpacity.value = 0;
      shaderMaterials.halo.uniforms.uOpacity.value = 0;
      gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: 0.85, ease: "back.out(1.6)" });
      gsap.to(group.position, { y: 12, duration: 0.85, ease: "power2.out" });
      gsap.to(shaderMaterials.surface.uniforms.uOpacity, { value: 1, duration: 0.65 });
      gsap.to(shaderMaterials.halo.uniforms.uOpacity, { value: 0.24, duration: 0.9 });
    } else {
      gsap.to(group.scale, { x: 0.72, y: 0.72, z: 0.72, duration: 0.45, ease: "power2.in" });
      gsap.to(group.position, { y: 8.4, duration: 0.45, ease: "power2.in" });
      gsap.to(shaderMaterials.surface.uniforms.uOpacity, { value: 0, duration: 0.4 });
      gsap.to(shaderMaterials.halo.uniforms.uOpacity, {
        value: 0,
        duration: 0.35,
        onComplete: () => { group.visible = false; },
      });
    }
  }

  function update(elapsed) {
    if (!group.visible) return;
    shaderMaterials.surface.uniforms.uTime.value = elapsed;
    shaderMaterials.halo.uniforms.uTime.value = elapsed;
    halo.scale.setScalar(1 + Math.sin(elapsed * 0.7) * 0.025);
  }

  return { setTheme, update };
}
