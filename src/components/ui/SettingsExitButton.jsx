export default function SettingsExitButton({ onExit }) {
  const handleExit = () => {
    if (onExit) onExit();

    // Try native app exit (Capacitor)
    try {
      if (window.Capacitor?.Plugins?.App?.exitApp) {
        window.Capacitor.Plugins.App.exitApp();
        return;
      }
    } catch (e) {
      console.warn("Capacitor App exit failed:", e);
    }

    // Try native app exit (Cordova/PhoneGap)
    try {
      if (navigator.app?.exitApp) {
        navigator.app.exitApp();
        return;
      }
    } catch (e) {
      console.warn("Cordova exit failed:", e);
    }

    // Try web browser window close
    try {
      window.close();
    } catch (e) {
      console.warn("Window close failed:", e);
    }

    // Fallback if browser blocks window.close() (standard security restriction for non-script-opened tabs)
    try {
      window.location.href = "about:blank";
    } catch (e) {
      console.warn("Redirect to about:blank failed:", e);
    }
  };

  return (
    <button className="settings-exit" type="button" onClick={handleExit}>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m6.7 5.3 5.3 5.3 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4Z" />
      </svg>
      <span>Exit</span>
    </button>
  );
}

