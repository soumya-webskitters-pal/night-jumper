const SKY_COLORS = {
  night: { horizon: 0x163429, zenith: 0x020807 },
  day: { horizon: 0xb6d6d1, zenith: 0x648f9b },
  spiderman: { horizon: 0x182b62, zenith: 0x050718 },
};

export function createCameraViewSky(THREE, scene, gsap) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uHorizon: { value: new THREE.Color(SKY_COLORS.night.horizon) },
      uZenith: { value: new THREE.Color(SKY_COLORS.night.zenith) },
    },
    vertexShader: `
      varying float vHeight;
      void main() {
        vHeight = normalize(position).y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uHorizon;
      uniform vec3 uZenith;
      varying float vHeight;
      void main() {
        float blend = smoothstep(-0.12, 0.72, vHeight);
        vec3 color = mix(uHorizon, uZenith, blend);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(95, 24, 16), material);
  sky.name = "front-back-camera-sky";
  sky.visible = false;
  sky.renderOrder = -100;
  scene.add(sky);

  function setCameraView(view) {
    sky.visible = view === "front" || view === "back";
  }

  function setTheme(theme, animated = false) {
    const palette = SKY_COLORS[theme] || SKY_COLORS.night;
    const duration = animated ? 0.85 : 0;
    [
      [material.uniforms.uHorizon.value, palette.horizon],
      [material.uniforms.uZenith.value, palette.zenith],
    ].forEach(([uniformColor, value]) => {
      const target = new THREE.Color(value);
      if (!duration) {
        uniformColor.copy(target);
        return;
      }
      gsap.to(uniformColor, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration,
        ease: "power2.inOut",
      });
    });
  }

  return { setCameraView, setTheme };
}
