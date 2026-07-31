export default function CountdownOverlay() {
  return (
    <section className="countdown-overlay" id="countdownOverlay"
      role="status" aria-live="assertive" aria-atomic="true" hidden>
      <p className="countdown-label" id="countdownLabel">Get ready</p>
      <strong className="countdown-value" id="countdownValue">Ready?</strong>
    </section>
  );
}
