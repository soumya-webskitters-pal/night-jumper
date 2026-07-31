export default function ScoreCard() {
  return (
    <aside className="score-card" aria-live="polite">
      <div className="score-current">
        <span>Score</span>
        <strong id="scoreValue">0</strong>
      </div>
      <div className="score-best">
        <span>Best</span>
        <strong id="highScoreValue">0</strong>
      </div>
      <button id="soundToggle" className="sound-toggle" type="button"
        aria-label="Enable sound" aria-pressed="false" title="Toggle sound">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M4 9v6h4l5 4V5L8 9H4Zm12.2-.8a5.4 5.4 0 0 1 0 7.6l1.4 1.4a7.4 7.4 0 0 0 0-10.4l-1.4 1.4Zm-1.8 2a2.8 2.8 0 0 1 0 3.6l1.4 1.2a4.7 4.7 0 0 0 0-6l-1.4 1.2Z" />
        </svg>
      </button>
      <button id="guideToggle" className="guide-toggle" type="button"
        aria-label="Show game guide" aria-expanded="false"
        aria-controls="gameGuide" title="Game guide">
        <span aria-hidden="true">💡</span>
      </button>
      <button id="runnerToggle" className="runner-toggle" type="button"
        aria-label="Select player" aria-expanded="false"
        aria-controls="runnerSelect" title="Select player">
        <span aria-hidden="true">●</span>
      </button>
    </aside>
  );
}
