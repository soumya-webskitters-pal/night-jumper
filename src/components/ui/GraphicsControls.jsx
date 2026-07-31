import GraphicsIcon from "./GraphicsIcon";

export default function GraphicsControls() {
  return (
    <section className="quality-switch" aria-labelledby="graphicsTitle">
      <div className="graphics-menu-title">
        <GraphicsIcon />
        <span>
          <strong id="graphicsTitle">Graphics</strong>
          <small>Performance quality</small>
        </span>
      </div>
      <div className="quality-options" role="group" aria-label="Graphics quality">
        <button id="lowGraphics" type="button">Low</button>
        <button id="highGraphics" type="button">High</button>
      </div>
    </section>
  );
}
