const noiseFunctions = `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amplitude;
      p = p * 2.03 + 17.1;
      amplitude *= 0.5;
    }
    return value;
  }
`;

const surfaceVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export function createSunShaderMaterials(THREE) {
  const surface = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    },
    vertexShader: surfaceVertexShader,
    fragmentShader: `
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDirection;
      ${noiseFunctions}

      void main() {
        vec2 flow = vUv * 7.0;
        float plasma = fbm(flow + vec2(uTime * 0.055, -uTime * 0.035));
        plasma += fbm(flow * 1.8 - vec2(uTime * 0.075, uTime * 0.04)) * 0.42;
        float facing = max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0);
        float rim = pow(1.0 - facing, 2.2);
        vec3 core = vec3(1.0, 0.69, 0.12);
        vec3 hot = vec3(1.0, 0.97, 0.57);
        vec3 color = mix(core, hot, smoothstep(0.35, 1.15, plasma));
        color += vec3(1.0, 0.25, 0.015) * rim * 0.75;
        gl_FragColor = vec4(color, uOpacity);
      }
    `,
    transparent: true,
    toneMapped: false,
  });

  const corona = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.38 },
    },
    vertexShader: surfaceVertexShader,
    fragmentShader: `
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDirection;
      ${noiseFunctions}

      void main() {
        float facing = abs(dot(normalize(vNormal), normalize(vViewDirection)));
        float edge = pow(1.0 - facing, 2.8);
        float flare = fbm(vUv * 10.0 + vec2(uTime * 0.07, 0.0));
        float alpha = edge * (0.55 + flare * 0.65) * uOpacity;
        gl_FragColor = vec4(vec3(1.0, 0.42, 0.045), alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
    toneMapped: false,
  });

  return { surface, corona };
}

export function createMoonShaderMaterials(THREE) {
  const surface = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    },
    vertexShader: surfaceVertexShader,
    fragmentShader: `
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDirection;
      ${noiseFunctions}

      void main() {
        vec2 lunarUv = vUv * vec2(10.0, 7.0);
        float terrain = fbm(lunarUv);
        float smallCraters = noise(lunarUv * 2.7);
        float craterMask = smoothstep(0.57, 0.76, terrain * 0.72 + smallCraters * 0.38);
        float facing = max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0);
        float rim = pow(1.0 - facing, 2.7);
        float shimmer = sin(uTime * 0.35) * 0.012;
        vec3 bright = vec3(0.84, 1.0, 0.91);
        vec3 crater = vec3(0.28, 0.50, 0.41);
        vec3 color = mix(bright, crater, craterMask * 0.62 + (1.0 - terrain) * 0.16);
        color += vec3(0.32, 1.0, 0.58) * (rim * 0.55 + shimmer);
        gl_FragColor = vec4(color, uOpacity);
      }
    `,
    transparent: true,
    toneMapped: false,
  });

  const halo = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.24 },
    },
    vertexShader: surfaceVertexShader,
    fragmentShader: `
      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vViewDirection;

      void main() {
        float facing = abs(dot(normalize(vNormal), normalize(vViewDirection)));
        float rim = pow(1.0 - facing, 3.2);
        float pulse = 0.88 + sin(uTime * 0.72) * 0.12;
        gl_FragColor = vec4(vec3(0.27, 1.0, 0.55), rim * pulse * uOpacity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
    toneMapped: false,
  });

  return { surface, halo };
}
