export function runnerAnimationTimeScale(selectedRunner, state) {
  const pauseNicky =
    selectedRunner === "nicky" &&
    (!state.running || state.jumping);

  return pauseNicky ? 0 : 1;
}
