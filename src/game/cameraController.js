const CAMERA_VIEWS = ["side", "back", "front"];

export function createCameraController(THREE, camera) {
  let view = "side";
  let baseY = 5.1;
  const target = new THREE.Vector3(-0.8, 1.55, -1.2);

  function apply() {
    const portrait = window.innerWidth / window.innerHeight < 0.8;

    if (view === "back") {
      camera.fov = portrait ? 66 : 62;
      baseY = portrait ? 6.5 : 6.05;
      camera.position.set(portrait ? -15.8 : -14.2, baseY, 0);
      target.set(2.2, 1.45, 0);
    } else if (view === "front") {
      camera.fov = portrait ? 60 : 56;
      baseY = portrait ? 6.1 : 5.35;
      camera.position.set(portrait ? 18.2 : 15.2, baseY, 0);
      target.set(-3.6, 1.45, 0);
    } else {
      camera.fov = 52;
      baseY = portrait ? 5.6 : 5.1;
      camera.position.set(
        portrait ? 2.8 : 4.6,
        baseY,
        portrait ? 15.5 : 13.2,
      );
      target.set(-0.8, 1.55, -1.2);
    }

    camera.updateProjectionMatrix();
    camera.lookAt(target);
  }

  function cycle() {
    view = CAMERA_VIEWS[(CAMERA_VIEWS.indexOf(view) + 1) % CAMERA_VIEWS.length];
    apply();
    return view;
  }

  function update(elapsed) {
    camera.position.y = baseY + Math.sin(elapsed * 0.45) * 0.06;
    camera.lookAt(target);
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    apply();
  }

  apply();
  return { apply, cycle, getView: () => view, resize, update };
}
