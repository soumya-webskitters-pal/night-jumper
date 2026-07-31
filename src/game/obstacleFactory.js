const TEXTURE_SOURCES = [
  "texture/image1.jpg",
  "texture/image2.jpg",
  "texture/image3.jpg",
  "texture/image4.jpg",
  "texture/texture1.jpg",
];

export function createObstacleFactory(THREE, renderer) {
  let theme = "night";
  let textures = null;
  let trimMaterial = null;
  let edgeMaterial = null;
  let goalFrameMaterial = null;
  let goalNetMaterial = null;
  const boxMaterials = [];
  const fenceMaterials = [];

  const glowColor = () =>
    theme === "spiderman" ? 0xff3048 : theme === "day" ? 0xffb52e : 0x00ff66;

  function loadTextures() {
    if (textures) return textures;
    const loader = new THREE.TextureLoader();
    textures = TEXTURE_SOURCES.map((source) => {
      const texture = loader.load(source);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1.6, 1.6);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy(),
      );
      return texture;
    });
    return textures;
  }

  function makeTexturedMaterials(kind) {
    const target = kind === "box" ? boxMaterials : fenceMaterials;
    if (target.length) return target;
    loadTextures().forEach((texture) => {
      target.push(
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: glowColor(),
          emissiveIntensity:
            theme === "day" ? (kind === "box" ? 0.12 : 0.1) : kind === "box" ? 0.2 : 0.18,
          map: texture,
          bumpMap: texture,
          bumpScale: kind === "box" ? 0.06 : 0.09,
          metalness: kind === "box" ? 0.82 : 0,
          roughness: kind === "box" ? 0.34 : 0.82,
        }),
      );
    });
    return target;
  }

  function randomMaterial(kind) {
    const materials = makeTexturedMaterials(kind);
    return materials[Math.floor(Math.random() * materials.length)];
  }

  function getTrimMaterial() {
    if (!trimMaterial) {
      trimMaterial = new THREE.MeshStandardMaterial({
        color: 0xc7ccc9,
        metalness: 0.95,
        roughness: 0.22,
      });
    }
    return trimMaterial;
  }

  function getEdgeMaterial() {
    if (!edgeMaterial) {
      edgeMaterial = new THREE.LineBasicMaterial({
        color: glowColor(),
        transparent: true,
        opacity: theme === "day" ? 0.72 : 0.96,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
    }
    return edgeMaterial;
  }

  function addGlowingEdges(mesh) {
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 25),
      getEdgeMaterial(),
    );
    edges.renderOrder = 2;
    mesh.add(edges);
  }

  function createHurdle() {
    const group = new THREE.Group();
    const obstacleMaterial = randomMaterial("fence");
    const addBar = (width, height, depth, x, y, z) => {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        obstacleMaterial,
      );
      bar.position.set(x, y, z);
      bar.castShadow = true;
      bar.receiveShadow = true;
      addGlowingEdges(bar);
      group.add(bar);
    };
    addBar(0.14, 1.35, 0.14, 0, 0.675, -1.25);
    addBar(0.14, 1.35, 0.14, 0, 0.675, 1.25);
    addBar(0.12, 0.14, 2.72, 0, 0.48, 0);
    addBar(0.12, 0.14, 2.72, 0, 1.04, 0);
    group.userData.type = "ground";
    group.userData.modelName = "mesh_hurdle";
    group.updateMatrixWorld(true);
    group.userData.localBounds = new THREE.Box3()
      .setFromObject(group)
      .applyMatrix4(group.matrixWorld.clone().invert());
    return group;
  }

  function createMetalBoxes() {
    const group = new THREE.Group();
    const obstacleMaterial = randomMaterial("box");
    const boxCount = Math.random() < 0.45 ? 2 : 1;

    for (let index = 0; index < boxCount; index += 1) {
      const width = 0.85 + Math.random() * 0.25;
      const height = 0.8 + Math.random() * 0.28;
      const depth = 0.9 + Math.random() * 0.3;
      const assembly = new THREE.Group();
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        obstacleMaterial,
      );
      box.castShadow = true;
      box.receiveShadow = true;
      addGlowingEdges(box);
      assembly.add(box);

      const addTrim = (trimWidth, trimHeight, trimDepth, x, y, z) => {
        const trim = new THREE.Mesh(
          new THREE.BoxGeometry(trimWidth, trimHeight, trimDepth),
          getTrimMaterial(),
        );
        trim.position.set(x, y, z);
        trim.castShadow = true;
        assembly.add(trim);
      };
      [-1, 1].forEach((side) => {
        addTrim(0.045, height * 0.92, 0.09, width / 2 + 0.026, 0, side * depth * 0.36);
        addTrim(0.045, 0.09, depth * 0.92, width / 2 + 0.026, side * height * 0.36, 0);
        addTrim(width * 0.92, height * 0.92, 0.045, 0, 0, side * (depth / 2 + 0.026));
      });
      assembly.position.set(index * 0.12, height / 2 + index * 0.64, index ? 0.08 : 0);
      assembly.rotation.y = (Math.random() - 0.5) * 0.18;
      group.add(assembly);
    }
    group.userData.type = "ground";
    group.userData.modelName = "mesh_boxes";
    group.updateMatrixWorld(true);
    group.userData.localBounds = new THREE.Box3()
      .setFromObject(group)
      .applyMatrix4(group.matrixWorld.clone().invert());
    return group;
  }

  function getGoalMaterials() {
    const color = glowColor();
    if (!goalFrameMaterial) {
      goalFrameMaterial = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: theme === "day" ? 0.28 : 0.75,
        metalness: 0.72,
        roughness: 0.25,
      });
    }
    if (!goalNetMaterial) {
      goalNetMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: theme === "day" ? 0.42 : 0.68 },
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
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            vec2 grid = abs(fract(vUv * vec2(12.0, 7.0)) - 0.5);
            float wires = smoothstep(0.42, 0.49, max(grid.x, grid.y));
            if (wires < 0.04) discard;
            gl_FragColor = vec4(uColor, wires * uOpacity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
    }
    return { frame: goalFrameMaterial, net: goalNetMaterial };
  }

  function createFloatingGoal() {
    const group = new THREE.Group();
    const goalWidth = 3.1;
    const goalHeight = 1.45;
    const barThickness = 0.13;
    const floatingHeight = 1.82 + Math.random() * 0.16;
    const materials = getGoalMaterials();
    const frame = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      materials.frame,
      5,
    );
    const transform = new THREE.Object3D();
    const bars = [
      [[0, goalHeight / 2, -goalWidth / 2], [barThickness, goalHeight, barThickness]],
      [[0, goalHeight / 2, goalWidth / 2], [barThickness, goalHeight, barThickness]],
      [[0, goalHeight, 0], [barThickness, barThickness, goalWidth + barThickness]],
      [[0, -floatingHeight / 2, -goalWidth / 2], [barThickness, floatingHeight, barThickness]],
      [[0, -floatingHeight / 2, goalWidth / 2], [barThickness, floatingHeight, barThickness]],
    ];
    bars.forEach(([position, scale], index) => {
      transform.position.set(...position);
      transform.scale.set(...scale);
      transform.rotation.set(0, 0, 0);
      transform.updateMatrix();
      frame.setMatrixAt(index, transform.matrix);
    });
    frame.instanceMatrix.needsUpdate = true;
    frame.castShadow = true;
    group.add(frame);

    const net = new THREE.Mesh(
      new THREE.PlaneGeometry(goalWidth, goalHeight),
      materials.net,
    );
    net.rotation.y = Math.PI / 2;
    net.position.set(0.06, goalHeight / 2, 0);
    group.add(net);
    group.position.y = floatingHeight;
    group.userData.type = "overhead";
    group.userData.modelName = "floating_soccer_goal";
    group.userData.localBounds = new THREE.Box3(
      new THREE.Vector3(-barThickness, 0, -goalWidth / 2),
      new THREE.Vector3(barThickness, goalHeight, goalWidth / 2),
    );
    return group;
  }

  function setTheme(nextTheme) {
    theme = nextTheme;
    const color = glowColor();
    const day = theme === "day";
    [...boxMaterials, ...fenceMaterials].forEach((material) => {
      material.color.set(0xffffff);
      material.emissive.set(color);
    });
    boxMaterials.forEach((material) => {
      material.emissiveIntensity = day ? 0.12 : 0.2;
    });
    fenceMaterials.forEach((material) => {
      material.emissiveIntensity = day ? 0.1 : 0.18;
    });
    if (edgeMaterial) {
      edgeMaterial.color.set(color);
      edgeMaterial.opacity = day ? 0.72 : 0.96;
    }
    if (goalFrameMaterial) {
      goalFrameMaterial.color.set(color);
      goalFrameMaterial.emissive.set(color);
      goalFrameMaterial.emissiveIntensity = day ? 0.28 : 0.75;
    }
    if (goalNetMaterial) {
      goalNetMaterial.uniforms.uColor.value.set(color);
      goalNetMaterial.uniforms.uOpacity.value = day ? 0.42 : 0.68;
    }
  }

  return { createHurdle, createMetalBoxes, createFloatingGoal, setTheme };
}
