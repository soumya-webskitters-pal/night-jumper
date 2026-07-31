export default function GraphicsControls() {
  return (
    <div className="quality-switch" role="group" aria-label="Graphics quality">
      <button id="lowGraphics" type="button">Low graphics</button>
      <button id="highGraphics" type="button">High graphics</button>
      <button id="themeToggle" className="theme-toggle" type="button"
        aria-label="Switch to day mode" aria-pressed="false">
        Night
      </button>
    </div>
  );
}
