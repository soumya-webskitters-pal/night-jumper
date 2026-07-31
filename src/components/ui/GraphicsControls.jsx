export default function GraphicsControls() {
  return (
    <section className="quality-switch" aria-labelledby="graphicsTitle">
      <div className="quality-heading">
        <span id="graphicsTitle">Graphics</span>
        <div className="quality-options" role="group" aria-label="Graphics quality">
          <button id="lowGraphics" type="button">Low</button>
          <button id="highGraphics" type="button">High</button>
        </div>
      </div>
    </section>
  );
}
