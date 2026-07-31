export function createGameState() {
  return {
    running: false,
    playerReady: false,
    obstaclesReady: false,
    gameOver: false,
    score: 0,
    highScore: 0,
    scoreClock: 0,
    survivalTime: 0,
    spawnTimer: 5,
    hasSpawned: false,
    jumping: false,
    jumpTime: 0,
    jumpBoosted: false,
    ducking: false,
    rollTime: 0,
    obstacles: [],
  };
}

export function resetGameState(state) {
  Object.assign(state, {
    running: false,
    playerReady: true,
    gameOver: false,
    score: 0,
    scoreClock: 0,
    survivalTime: 0,
    spawnTimer: 5,
    hasSpawned: false,
    jumping: false,
    jumpTime: 0,
    jumpBoosted: false,
    ducking: false,
    rollTime: 0,
  });
}
