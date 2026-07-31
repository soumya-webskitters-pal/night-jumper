export default function RestartPanel() {
  return (
    <section className="restart-panel" id="restartPanel" hidden>
      <button id="restartButton" type="button" aria-label="Restart game">
        <span className="restart-icon">↻</span>
        <span className="final-score-label">Total score</span>
        <strong className="final-score" id="finalScoreValue">0</strong>
        <span className="restart-action">Run again</span>
        <small>Click or press ↑</small>
      </button>
    </section>
  );
}
