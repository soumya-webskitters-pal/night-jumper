import SettingsMenu from "./SettingsMenu";

export default function ScoreCard() {
  return (
    <section className="score-card" aria-live="polite" aria-label="Score">
      <div className="score-current">
        <span>Score</span>
        <strong id="scoreValue">0</strong>
      </div>
      <div className="score-best">
        <span>Best</span>
        <strong id="highScoreValue">0</strong>
      </div>
      <SettingsMenu />
    </section>
  );
}
