export default function LoadingScreen() {
  return (
    <div className="loader-screen" id="loaderScreen" role="status" aria-live="polite">
      <div className="loader-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <strong>Loading</strong>
      <p>Preparing assets…</p>
    </div>
  );
}
