export function createPlayerMovementController({
  gsap,
  state,
  player,
  getActions,
  getSelectedRunner,
  playAction,
  playJumpSound,
  playRollSound,
}) {
  function killTweens() {
    gsap.killTweensOf(player.position);
    gsap.killTweensOf(player.scale);
  }

  function jump() {
    if (!state.running) return;
    const { idle, run, jump: jumpAction, superJump: superJumpAction } = getActions();
    if (state.jumping) {
      if (!state.jumpBoosted && state.jumpTime <= 0.28) {
        state.jumpBoosted = true;
        playAction(superJumpAction || jumpAction || run || idle, 0.08);
        playJumpSound(true);
      }
      return;
    }
    killTweens();
    state.ducking = false;
    state.jumping = true;
    state.jumpTime = 0;
    state.jumpBoosted = false;
    playJumpSound(false);
    playAction(jumpAction || run || idle, 0.1);
    player.scale.y = 1;
    player.position.y = 0.08;
    gsap
      .timeline()
      .to(player.scale, {
        x: 0.96,
        y: 1.06,
        z: 0.96,
        duration: 0.11,
        ease: "power2.out",
      })
      .to(player.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.16,
        ease: "power2.inOut",
      });
  }

  function superJump() {
    if (!state.running) return;
    if (!state.jumping) jump();
    if (!state.jumpBoosted) {
      const { idle, run, jump: jumpAction, superJump: superJumpAction } = getActions();
      state.jumpBoosted = true;
      playAction(superJumpAction || jumpAction || run || idle, 0.08);
      playJumpSound(true);
    }
  }

  function setDuck(pressed) {
    if (!state.running || state.jumping || pressed === state.ducking) return;
    const { idle, run, roll } = getActions();
    state.ducking = pressed;
    if (pressed) playRollSound();
    playAction(pressed ? roll || run || idle : run || idle, 0.12);
    const selectedRunner = getSelectedRunner();
    const preserveShape =
      selectedRunner === "tron" || selectedRunner === "spiderman";
    gsap.to(player.scale, {
      x: pressed && !preserveShape ? 1.12 : 1,
      y: pressed && !preserveShape ? 0.5 : 1,
      z: pressed && !preserveShape ? 1.12 : 1,
      duration: pressed ? 0.16 : 0.24,
      ease: pressed ? "power3.out" : "back.out(1.8)",
      overwrite: "auto",
    });
  }

  function roll() {
    if (!state.running || state.jumping) return;
    state.rollTime = 0.72;
    setDuck(true);
  }

  return { jump, superJump, setDuck, roll, killTweens };
}
