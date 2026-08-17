export function createObstacleSpawner({
  scene,
  state,
  factory,
  nextSpawnDelay,
  getSpawnX = () => 14,
}) {
  function selectRandomObstacle() {
    if (Math.random() < 0.28) return factory.createFloatingGoal();
    return Math.random() < 0.5
      ? factory.createHurdle()
      : factory.createMetalBoxes();
  }

  function spawn() {
    const object = selectRandomObstacle();
    object.position.set(getSpawnX(), object.position.y, 0);
    object.userData.speedVariance = Math.random() * 1.2;
    object.userData.scored = false;
    scene.add(object);
    state.obstacles.push(object);
    state.hasSpawned = true;
    state.spawnTimer = nextSpawnDelay();
    return object;
  }

  function spawnTutorial(kind) {
    const object = kind === "jump"
      ? factory.createHurdle()
      : kind === "superJump"
        ? factory.createMetalBoxes({ boxCount: 2 })
        : factory.createFloatingGoal();
    // Tutorial obstacles appear at the action point so the prompt and the
    // obstacle are introduced together while the world is paused.
    object.position.set(0.2, object.position.y, 0);
    object.userData.speedVariance = 0;
    object.userData.scored = false;
    object.userData.tutorial = true;
    scene.add(object);
    state.obstacles.push(object);
    state.hasSpawned = true;
    return object;
  }

  return { selectRandomObstacle, spawn, spawnTutorial };
}
