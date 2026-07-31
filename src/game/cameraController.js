const CAMERA_VIEWS = ["side", "back", "front"];

export function createCameraController(THREE, camera) {
  let view = "side";
  let baseY = 5.1;
  let transition = null;
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
    const startPosition = camera.position.clone();
    const startTarget = target.clone();
    const startFov = camera.fov;
    view = CAMERA_VIEWS[(CAMERA_VIEWS.indexOf(view) + 1) % CAMERA_VIEWS.length];
    apply();
    const endPosition = camera.position.clone();
    const endTarget = target.clone();
    const endFov = camera.fov;
    camera.position.copy(startPosition);
    target.copy(startTarget);
    camera.fov = startFov;
    camera.updateProjectionMatrix();
    camera.lookAt(target);
    transition = {
      duration: 0.78,
      endFov,
      endPosition,
      endTarget,
      startFov,
      startedAt: null,
      startPosition,
      startTarget,
    };
    return view;
  }

  function update(elapsed) {
    if (transition) {
      if (transition.startedAt === null) transition.startedAt = elapsed;
      const rawProgress = Math.min(
        1,
        (elapsed - transition.startedAt) / transition.duration,
      );
      const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      camera.position.lerpVectors(
        transition.startPosition,
        transition.endPosition,
        progress,
      );
      camera.position.y += Math.sin(progress * Math.PI) * 0.85;
      target.lerpVectors(
        transition.startTarget,
        transition.endTarget,
        progress,
      );
      camera.fov = THREE.MathUtils.lerp(
        transition.startFov,
        transition.endFov,
        progress,
      );
      camera.updateProjectionMatrix();
      camera.lookAt(target);
      if (rawProgress >= 1) transition = null;
      return;
    }
    camera.position.y = baseY + Math.sin(elapsed * 0.45) * 0.06;
    camera.lookAt(target);
  }

  function resize() {
    transition = null;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    apply();
  }

  apply();
  return { apply, cycle, getView: () => view, resize, update };
}
