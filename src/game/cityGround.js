const THEME_COLORS = {
  night: {
    ground: 0x07100c,
    edge: 0x18392b,
    seam: 0x2a5e45,
  },
  day: {
    ground: 0x38423f,
    edge: 0x68736f,
    seam: 0x8d9994,
  },
  spiderman: {
    ground: 0x070b1a,
    edge: 0x17254a,
    seam: 0x3156a1,
  },
};

export function createCityGround(THREE, scene, gsap) {
  const group = new THREE.Group();
  group.name = "city-ground";

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: THEME_COLORS.night.ground,
    roughness: 0.94,
    metalness: 0.04,
  });
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: THEME_COLORS.night.edge,
    roughness: 0.8,
    metalness: 0.12,
  });
  const seamMaterial = new THREE.MeshBasicMaterial({
    color: THEME_COLORS.night.seam,
    transparent: true,
    opacity: 0.34,
  });

  // The city occupies z -11 through -26. This slab ends exactly at y = 0,
  // keeping every procedurally generated building visibly planted on it.
  const district = new THREE.Mesh(
    new THREE.BoxGeometry(110, 0.16, 22),
    groundMaterial,
  );
  district.position.set(0, -0.08, -18.5);
  district.receiveShadow = true;
  group.add(district);

  const nearDistrict = new THREE.Mesh(
    new THREE.BoxGeometry(110, 0.16, 7.2),
    groundMaterial,
  );
  nearDistrict.position.set(0, -0.08, -6.25);
  nearDistrict.receiveShadow = true;
  group.add(nearDistrict);

  const oppositeDistrict = nearDistrict.clone();
  oppositeDistrict.position.z = 6.25;
  group.add(oppositeDistrict);

  const sidewalkEdge = new THREE.Mesh(
    new THREE.BoxGeometry(110, 0.2, 0.55),
    edgeMaterial,
  );
  sidewalkEdge.position.set(0, -0.02, -2.7);
  sidewalkEdge.receiveShadow = true;
  group.add(sidewalkEdge);

  const oppositeSidewalkEdge = sidewalkEdge.clone();
  oppositeSidewalkEdge.position.z = 2.7;
  group.add(oppositeSidewalkEdge);

  const seamGeometry = new THREE.BoxGeometry(0.055, 0.012, 17);
  for (let x = -52; x <= 52; x += 4) {
    const seam = new THREE.Mesh(seamGeometry, seamMaterial);
    seam.position.set(x, 0.008, -18.5);
    group.add(seam);
  }

  scene.add(group);

  function setTheme(theme, animated = false) {
    const palette = THEME_COLORS[theme] || THEME_COLORS.night;
    const duration = animated ? 0.85 : 0;
    [
      [groundMaterial, palette.ground],
      [edgeMaterial, palette.edge],
      [seamMaterial, palette.seam],
    ].forEach(([targetMaterial, targetColor]) => {
      const destination = new THREE.Color(targetColor);
      if (!duration) {
        targetMaterial.color.copy(destination);
        return;
      }
      gsap.to(targetMaterial.color, {
        r: destination.r,
        g: destination.g,
        b: destination.b,
        duration,
        ease: "power2.inOut",
      });
    });
  }

  return { group, setTheme };
}
