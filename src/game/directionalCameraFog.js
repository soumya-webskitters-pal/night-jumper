const FOG_COLORS = {
  night: 0x17382d,
  day: 0xb8cfca,
  spiderman: 0x182c61,
};

export function createDirectionalCameraFog(THREE, scene, gsap) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(FOG_COLORS.night) },
      uTime: { value: 0 },
      uOpacity: { value: 0.42 },
      uDarkness: { value: 0.08 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uDarkness;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        float heightFade = smoothstep(0.04, 0.82, vUv.y);
        float sideFade = smoothstep(0.0, 0.08, vUv.x) * smoothstep(0.0, 0.08, 1.0 - vUv.x);
        vec2 driftingCell = floor(vUv * vec2(20.0, 12.0) + vec2(uTime * 0.12, 0.0));
        float textureNoise = hash(driftingCell) * 0.055;
        float alpha = (0.76 + heightFade * 0.22 + textureNoise) * sideFade * uOpacity;
        vec3 fogColor = mix(uColor, vec3(0.004, 0.007, 0.009), uDarkness);
        gl_FragColor = vec4(fogColor, alpha);
      }
    `,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });

  // Rotating the plane makes it cross the road along Z. Depth testing keeps
  // the player clear and applies the gradient only to geometry beyond it.
  const fog = new THREE.Mesh(new THREE.PlaneGeometry(50, 26), material);
  fog.name = "directional-camera-gradient-fog";
  fog.rotation.y = Math.PI / 2;
  fog.position.y = 9;
  fog.renderOrder = 900;
  fog.visible = false;
  scene.add(fog);

  function setCameraView(view) {
    fog.visible = view === "front" || view === "back";
    if (view === "front") {
      // Front camera looks toward -X. Placing the dense curtain at the far end
      // hides the building-row cutoff without covering the player or foreground.
      fog.position.x = -29;
      material.uniforms.uOpacity.value = 1;
      material.uniforms.uDarkness.value = 0.18;
    } else if (view === "back") {
      // Back camera looks toward +X. Keep the curtain beyond the x=24
      // obstacle entry point so gameplay objects remain readable.
      fog.position.x = 31;
      material.uniforms.uOpacity.value = 1;
      material.uniforms.uDarkness.value = 0.18;
    }
  }

  function setTheme(theme, animated = false) {
    const target = new THREE.Color(FOG_COLORS[theme] || FOG_COLORS.night);
    const duration = animated ? 0.85 : 0;
    if (!duration) {
      material.uniforms.uColor.value.copy(target);
      return;
    }
    gsap.to(material.uniforms.uColor.value, {
      r: target.r,
      g: target.g,
      b: target.b,
      duration,
      ease: "power2.inOut",
    });
  }

  function update(elapsed) {
    if (fog.visible) material.uniforms.uTime.value = elapsed;
  }

  return { setCameraView, setTheme, update };
}
