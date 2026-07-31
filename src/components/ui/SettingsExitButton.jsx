export default function SettingsExitButton({ onExit }) {
  return (
    <button className="settings-exit" type="button" onClick={onExit}>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m6.7 5.3 5.3 5.3 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4Z" />
      </svg>
      <span>Exit</span>
    </button>
  );
}
