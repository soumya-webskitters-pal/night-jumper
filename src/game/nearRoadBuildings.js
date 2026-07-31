export function createNearRoadBuildings(THREE, scene) {
  const blocks = [];
  const windowMaterials = [];
  const windowGeometry = new THREE.PlaneGeometry(0.28, 0.4);
  const transform = new THREE.Object3D();
  const columnsPerRow = 14;
  const rowCount = 2;

  [-1, 1].forEach((roadSide) => {
    for (let index = 0; index < columnsPerRow * rowCount; index += 1) {
      const row = Math.floor(index / columnsPerRow);
      const column = index % columnsPerRow;
      const width = 3.4 + Math.random() * 1.7;
      const height = 4.5 + row * 1.8 + Math.random() * 5.2;
      const depth = 1.9 + Math.random() * 1.1;
      const distanceFromRoad = row === 0
        ? 5.7 + Math.random() * 0.8
        : 9.3 + Math.random() * 1.1;
      const block = new THREE.Group();
      const sideName = roadSide < 0 ? "left" : "right";
      block.name = `near-road-${sideName}-row-${row + 1}-${column + 1}`;
      block.position.set(
        -47 + column * 7.15 + row * 2.6,
        0,
        roadSide * distanceFromRoad,
      );
      block.userData.parallax = row === 0 ? 1.08 : 0.94;
      block.userData.roadSide = roadSide;
      block.userData.buildingRow = row;
      block.userData.cameraManaged = true;
      block.userData.wrapMin = -50;
      block.userData.wrapRange = 100;

      const litMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0, 0, 0.012 + Math.random() * 0.012),
        roughness: 0.9,
        metalness: 0.08,
      });
      const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), litMaterial);
      building.position.y = height / 2;
      building.castShadow = true;
      building.receiveShadow = true;
      building.userData.buildingMesh = true;
      building.userData.nightColor = litMaterial.color.clone();
      building.userData.dayColor = new THREE.Color(0x3f4a47);
      building.userData.spiderColor = new THREE.Color(index % 2 ? 0x24070d : 0x08102d);
      building.userData.litMaterial = litMaterial;
      building.userData.flatMaterial = new THREE.MeshBasicMaterial({ color: litMaterial.color.clone() });
      block.add(building);

      const windowMaterial = new THREE.MeshBasicMaterial({
        color: 0x5ee894,
        transparent: true,
        opacity: 0.72,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      windowMaterial.userData.nightColor = new THREE.Color(0x5ee894);
      windowMaterial.userData.dayColor = new THREE.Color(0xffc85a);
      windowMaterial.userData.spiderColor = new THREE.Color(index % 2 ? 0xff3a50 : 0x4c82ff);
      windowMaterials.push(windowMaterial);

      const windowColumns = Math.max(2, Math.floor(width / 0.75));
      const windowRows = Math.max(3, Math.floor(height / 0.85));
      const panes = new THREE.InstancedMesh(
        windowGeometry,
        windowMaterial,
        windowColumns * windowRows,
      );
      let paneIndex = 0;
      for (let paneRow = 0; paneRow < windowRows; paneRow += 1) {
        for (let paneColumn = 0; paneColumn < windowColumns; paneColumn += 1) {
          transform.position.set(
            (paneColumn - (windowColumns - 1) / 2) * 0.62,
            0.65 + paneRow * 0.7,
            roadSide < 0 ? depth / 2 + 0.012 : -depth / 2 - 0.012,
          );
          transform.rotation.y = roadSide < 0 ? 0 : Math.PI;
          transform.updateMatrix();
          panes.setMatrixAt(paneIndex, transform.matrix);
          paneIndex += 1;
        }
      }
      panes.instanceMatrix.needsUpdate = true;
      block.add(panes);

      if (roadSide > 0) {
        block.visible = false;
      }
      scene.add(block);
      blocks.push(block);
    }
  });

  function setCameraView(view) {
    const showBothSides = view === "front" || view === "back";
    blocks.forEach((block) => {
      block.userData.cameraVisible = showBothSides
        ? block.userData.buildingRow === 0
        : block.userData.roadSide < 0;
      block.visible = block.userData.cameraVisible;
    });
  }

  setCameraView("side");
  return { blocks, windowMaterials, setCameraView };
}
