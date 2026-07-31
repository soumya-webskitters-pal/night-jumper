function createWebGeometry(THREE) {
  const points = [];
  const spokes = 10;
  for (let spoke = 0; spoke < spokes; spoke += 1) {
    const angle = (spoke / spokes) * Math.PI * 2;
    points.push(0, 0, 0, Math.cos(angle), Math.sin(angle), 0);
  }
  for (let ring = 1; ring <= 4; ring += 1) {
    const radius = ring / 4;
    for (let segment = 0; segment < spokes; segment += 1) {
      const angleA = (segment / spokes) * Math.PI * 2;
      const angleB = ((segment + 1) / spokes) * Math.PI * 2;
      points.push(
        Math.cos(angleA) * radius,
        Math.sin(angleA) * radius,
        0,
        Math.cos(angleB) * radius,
        Math.sin(angleB) * radius,
        0,
      );
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

export function createBuildingSpiderWebs(THREE, buildingBlocks) {
  const geometry = createWebGeometry(THREE);
  const materials = [0xe8f1ff, 0x75a7ff, 0xff6075].map((color) =>
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  const webs = [];

  buildingBlocks.forEach((block, index) => {
    if (index % 2 !== 0) return;
    const building = block.children.find((child) => child.userData.buildingMesh);
    const { width, height, depth } = building?.geometry?.parameters || {};
    if (!width || !height || !depth) return;

    const radius = Math.min(width * 0.38, height * 0.19);
    const web = new THREE.LineSegments(geometry, materials[index % materials.length]);
    web.name = `spider-web-${block.name}`;
    web.position.set(
      width * (index % 4 === 0 ? -0.12 : 0.12),
      Math.min(height * 0.62, height - radius - 0.25),
      block.userData.roadSide < 0 ? depth / 2 + 0.025 : -depth / 2 - 0.025,
    );
    web.rotation.y = block.userData.roadSide < 0 ? 0 : Math.PI;
    web.scale.setScalar(radius);
    web.visible = false;
    block.add(web);
    webs.push(web);
  });

  function setVisible(visible) {
    webs.forEach((web) => {
      web.visible = visible;
    });
  }

  return { setVisible, webs };
}
