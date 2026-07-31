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

  return { selectRandomObstacle, spawn };
}
