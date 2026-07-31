const MOTION_VERTEX_SHADER = `
  uniform float uTravel;
  uniform float uWrapMin;
  uniform float uWrapRange;
  attribute float aSpeed;
  void main() {
    vec3 animated = position;
    animated.x = uWrapMin + mod(
      position.x - uWrapMin - uTravel * aSpeed,
      uWrapRange
    );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(animated, 1.0);
  }
`;

const MOTION_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

const PARTICLE_VERTEX_SHADER = `
  uniform float uTravel;
  attribute float aSpeed;
  void main() {
    vec3 animated = position;
    animated.x = -38.0 + mod(position.x + 38.0 - uTravel * aSpeed, 76.0);
    vec4 viewPosition = modelViewMatrix * vec4(animated, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(34.0 / max(1.0, -viewPosition.z), 1.0, 3.2);
  }
`;

const PARTICLE_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float alpha = smoothstep(0.5, 0.08, length(point));
    gl_FragColor = vec4(uColor, uOpacity * alpha);
  }
`;

export function createGpuMotionMaterial(
  THREE,
  { color, opacity, wrapMin = 0, wrapRange = 1, particles = false },
) {
  const uniforms = {
    uTravel: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: opacity },
    uWrapMin: { value: wrapMin },
    uWrapRange: { value: wrapRange },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: particles ? PARTICLE_VERTEX_SHADER : MOTION_VERTEX_SHADER,
    fragmentShader: particles
      ? PARTICLE_FRAGMENT_SHADER
      : MOTION_FRAGMENT_SHADER,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  material.color = uniforms.uColor.value;
  return material;
}

export function createRoadFoundation(THREE, scene, { mesh, material }) {
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x070d0a,
    roughness: 0.72,
    metalness: 0.35,
  });
  const road = mesh(new THREE.PlaneGeometry(90, 20), roadMaterial, false, true);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, -0.02, 0);
  scene.add(road);

  const curbMaterial = material(0x123326, 0.48, 0.58);
  [-2.4, 2.4].forEach((z) => {
    const curb = mesh(new THREE.BoxGeometry(90, 0.16, 0.16), curbMaterial);
    curb.position.set(0, 0.05, z);
    scene.add(curb);
  });

  const laneMaterial = new THREE.MeshBasicMaterial({ color: 0x63c98c });
  const roadMarkers = [];
  [-0.11, 0.11].forEach((laneZ) => {
    for (let x = -42; x < 43; x += 3.2) {
      const lane = mesh(
        new THREE.BoxGeometry(1.45, 0.025, 0.035),
        laneMaterial,
        false,
        false,
      );
      lane.position.set(x, 0.018, laneZ);
      scene.add(lane);
      roadMarkers.push(lane);
    }
  });

  return { roadMaterial, curbMaterial, laneMaterial, roadMarkers };
}
