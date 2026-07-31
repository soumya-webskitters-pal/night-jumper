export function bindGameInputs({
  canvas,
  controls,
  getState,
  ensureAudio,
  jump,
  superJump,
  roll,
  stopRoll,
  restart,
}) {
  let pointerStart = null;
  let lastUpActionAt = 0;

  const activateJump = () => {
    const now = performance.now();
    if (now - lastUpActionAt <= 320) superJump();
    else jump();
    lastUpActionAt = now;
  };

  const handleKeyDown = (event) => {
    ensureAudio();
    const state = getState();
    if (event.key === "ArrowUp" || event.code === "Space" || event.key === " ") {
      event.preventDefault();
      if (event.repeat) return;
      if (state.gameOver) restart();
      else if (state.running) jump();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!event.repeat) roll();
    }
  };

  const handlePointerDown = (event) => {
    ensureAudio();
    pointerStart = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      button: event.button,
    };
    canvas.setPointerCapture?.(event.pointerId);
  };

  const handlePointerUp = (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const start = pointerStart;
    pointerStart = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const isSwipe = Math.abs(dy) >= 42 && Math.abs(dy) > Math.abs(dx);

    if (start.button === 2 || (isSwipe && dy > 0)) roll();
    else if (isSwipe && dy < 0) activateJump();
    else if (start.button === 0 && Math.hypot(dx, dy) < 18) activateJump();
  };

  const handlePointerCancel = () => {
    pointerStart = null;
  };
  const handleContextMenu = (event) => {
    event.preventDefault();
    ensureAudio();
    roll();
  };
  const handleJumpButton = () => {
    ensureAudio();
    jump();
  };
  const handleSuperButton = () => {
    ensureAudio();
    superJump();
  };
  const handleRollButton = () => {
    ensureAudio();
    roll();
  };

  document.addEventListener("keydown", handleKeyDown, true);
  window.addEventListener("blur", stopRoll);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerCancel);
  canvas.addEventListener("contextmenu", handleContextMenu);
  controls.jump.addEventListener("click", handleJumpButton);
  controls.superJump.addEventListener("click", handleSuperButton);
  controls.roll.addEventListener("click", handleRollButton);

  return () => {
    document.removeEventListener("keydown", handleKeyDown, true);
    window.removeEventListener("blur", stopRoll);
    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointercancel", handlePointerCancel);
    canvas.removeEventListener("contextmenu", handleContextMenu);
    controls.jump.removeEventListener("click", handleJumpButton);
    controls.superJump.removeEventListener("click", handleSuperButton);
    controls.roll.removeEventListener("click", handleRollButton);
  };
}
