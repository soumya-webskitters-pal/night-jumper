export function createCollisionSystem(THREE) {
  const playerBox = new THREE.Box3();
  const obstacleBox = new THREE.Box3();

  function update({
    player,
    obstacles,
    state,
    selectedRunner,
    worldSpeed,
    delta,
    scene,
    onCollision,
  }) {
    player.updateMatrixWorld(true);
    if (player.userData.localBounds) {
      playerBox.copy(player.userData.localBounds).applyMatrix4(player.matrixWorld);
    } else {
      playerBox.setFromObject(player);
    }

    if (
      state.ducking &&
      (selectedRunner === "tron" || selectedRunner === "spiderman")
    ) {
      playerBox.max.y =
        playerBox.min.y + (playerBox.max.y - playerBox.min.y) * 0.5;
    }

    for (let index = obstacles.length - 1; index >= 0; index -= 1) {
      const obstacle = obstacles[index];
      obstacle.userData.speed = worldSpeed + obstacle.userData.speedVariance;
      obstacle.position.x -= obstacle.userData.speed * delta;
      obstacle.userData.mixer?.update(delta);
      obstacle.userData.rotors?.forEach((rotor, rotorIndex) => {
        rotor.rotation.y += delta * (rotorIndex ? -15 : 15);
      });
      obstacle.updateMatrixWorld(true);
      if (obstacle.userData.localBounds) {
        obstacleBox
          .copy(obstacle.userData.localBounds)
          .applyMatrix4(obstacle.matrixWorld);
      } else {
        obstacleBox.setFromObject(obstacle);
      }

      if (playerBox.intersectsBox(obstacleBox)) {
        onCollision();
        return true;
      }
      if (!obstacle.userData.scored && obstacleBox.max.x < playerBox.min.x) {
        obstacle.userData.scored = true;
        state.score += 10;
      }
      if (obstacle.position.x < -13) {
        scene.remove(obstacle);
        obstacles.splice(index, 1);
      }
    }
    return false;
  }

  return { update };
}
