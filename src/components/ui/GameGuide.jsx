export default function GameGuide() {
  return (
    <section className="game-guide" id="gameGuide" role="dialog"
      aria-modal="true" aria-labelledby="gameGuideTitle" hidden>
      <div className="guide-card">
        <button className="guide-close" id="guideClose" type="button"
          aria-label="Close game guide and continue">×</button>
        <p className="guide-kicker">Runner briefing</p>
        <h2 id="gameGuideTitle">How to play</h2>
        <div className="guide-controls">
          <div><kbd>↑</kbd><span><strong>Jump</strong>Click, tap, swipe up, or press Space</span></div>
          <div><kbd>×2</kbd><span><strong>Super jump</strong>Double-click, double-tap, or swipe up twice</span></div>
          <div><kbd>↓</kbd><span><strong>Roll</strong>Right-click, swipe down, or press Down</span></div>
        </div>
        <div className="guide-rules">
          <h3>Game rules</h3>
          <p>Jump over ground barriers and roll beneath flying obstacles. One collision ends the run.</p>
          <p>Survive to earn points and collect a 10-point bonus for every obstacle you pass.</p>
        </div>
        <div className="guide-stats">
          <div><span>Level</span><strong>Rises every 25 seconds</strong></div>
          <div><span>Speed</span><strong>Starts at 5.8 and steadily reaches 13.3</strong></div>
        </div>
        <button className="guide-play" id="guidePlay" type="button">Start running</button>
        <p className="guide-credit">Created by ChatGPT, vibe coder: Soumya Pal</p>
      </div>
    </section>
  );
}
