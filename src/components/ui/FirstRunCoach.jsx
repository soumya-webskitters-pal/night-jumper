export default function FirstRunCoach() {
  return (
    <section className="first-run-coach" id="firstRunCoach" aria-live="polite" hidden>
      <p className="coach-kicker">Training mode · slow motion</p>
      <strong id="coachTitle">First run walkthrough</strong>
      <p id="coachHint">Follow this order. The game is slowed down while you learn.</p>
      <ol className="coach-timeline" id="coachTimeline">
        <li data-coach-step="1"><b>1</b><span>Normal jump<br /><small>↑ / tap</small></span></li>
        <li data-coach-step="2"><b>2</b><span>Roll<br /><small>↓ / swipe down</small></span></li>
        <li data-coach-step="3"><b>3</b><span>Super jump<br /><small>↑ ↑ / double tap</small></span></li>
      </ol>
      <div className="coach-hud-callouts" aria-hidden="true">
        <span>↗ Score: your run and best score</span>
        <span>↗ Settings: sound, camera, theme, guide</span>
      </div>
    </section>
  );
}
