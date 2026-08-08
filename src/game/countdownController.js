export function createCountdownController({
  state,
  overlay,
  label,
  value,
  isReady,
  onPause,
  onStart,
  onTick,
}) {
  let timer = null;

  function cancel() {
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
    overlay.hidden = true;
    overlay.classList.remove("is-counting");
  }

  function showStep(nextLabel, nextValue) {
    label.textContent = nextLabel;
    value.textContent = nextValue;
    value.classList.remove("is-pulsing");
    void value.offsetWidth;
    value.classList.add("is-pulsing");
    if (onTick) {
      onTick(nextValue);
    }
  }

  function begin() {
    cancel();
    if (state.gameOver || !isReady()) return;

    state.running = false;
    onPause();
    overlay.hidden = false;
    overlay.classList.add("is-counting");

    const steps = [
      ["Get ready", "Ready?", 800],
      ["Starting in", "3", 700],
      ["Starting in", "2", 700],
      ["Starting in", "1", 700],
    ];
    let index = 0;

    const advance = () => {
      if (index >= steps.length) {
        cancel();
        if (state.gameOver) return;
        state.running = true;
        onStart();
        return;
      }
      const [nextLabel, nextValue, duration] = steps[index];
      index += 1;
      showStep(nextLabel, nextValue);
      timer = window.setTimeout(advance, duration);
    };

    advance();
  }

  return { begin, cancel };
}
