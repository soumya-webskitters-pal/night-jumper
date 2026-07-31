export default function HudActions() {
  return (
    <nav className="hud-actions" aria-label="Quick actions">
      <button id="soundToggle" className="hud-action sound-toggle" type="button"
        aria-label="Enable sound" aria-pressed="false" title="Toggle sound">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M4 9v6h4l5 4V5L8 9H4Zm12.2-.8a5.4 5.4 0 0 1 0 7.6l1.4 1.4a7.4 7.4 0 0 0 0-10.4l-1.4 1.4Zm-1.8 2a2.8 2.8 0 0 1 0 3.6l1.4 1.2a4.7 4.7 0 0 0 0-6l-1.4 1.2Z" />
        </svg>
        <span>Sound</span>
      </button>
      <button id="cameraToggle" className="hud-action camera-toggle" type="button"
        aria-label="Camera view: Side. Change camera angle"
        title="Camera: Side view" data-camera-view="side">
        <svg className="camera-icon-side" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M4.5 6h10A2.5 2.5 0 0 1 17 8.5v1.35l3.2-2.1A1.15 1.15 0 0 1 22 8.7v6.6a1.15 1.15 0 0 1-1.8.95L17 14.15v1.35a2.5 2.5 0 0 1-2.5 2.5h-10A2.5 2.5 0 0 1 2 15.5v-7A2.5 2.5 0 0 1 4.5 6Z" />
        </svg>
        <svg className="camera-icon-angle" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M9 5.5 10.3 4h3.4L15 5.5h3.5A2.5 2.5 0 0 1 21 8v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5V8a2.5 2.5 0 0 1 2.5-2.5H9Zm3 2.25A4.25 4.25 0 1 0 12 16.25 4.25 4.25 0 0 0 12 7.75Zm0 1.75A2.5 2.5 0 1 1 12 14.5 2.5 2.5 0 0 1 12 9.5Z" />
        </svg>
        <span>Camera</span>
      </button>
      <button id="themeToggle" className="hud-action theme-toggle" type="button"
        aria-label="Switch to day mode" aria-pressed="false" title="Change day or night mode">
        <svg className="theme-icon-night" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M20.4 15.3A8.7 8.7 0 0 1 8.7 3.6 9 9 0 1 0 20.4 15.3Z" />
        </svg>
        <svg className="theme-icon-day" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M11 1h2v3h-2V1Zm0 19h2v3h-2v-3ZM1 11h3v2H1v-2Zm19 0h3v2h-3v-2ZM4.22 5.64l1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12Zm12.02 12.02 1.42-1.42 2.12 2.12-1.42 1.42-2.12-2.12ZM16.24 6.34l2.12-2.12 1.42 1.42-2.12 2.12-1.42-1.42ZM4.22 18.36l2.12-2.12 1.42 1.42-2.12 2.12-1.42-1.42ZM12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
        </svg>
        <span className="hud-action-label">Night</span>
      </button>
    </nav>
  );
}
