import { useEffect, useState } from "react";
import AboutModal from "./AboutModal";
import GraphicsControls from "./GraphicsControls";
import SettingsExitButton from "./SettingsExitButton";

export default function SettingsMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutPanel, setAboutPanel] = useState(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    window.dispatchEvent(new CustomEvent("night-runner:settings-open"));
    return () => {
      window.dispatchEvent(new CustomEvent("night-runner:settings-close"));
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setAboutPanel(null);
  };
  const openAbout = (panel) => {
    setMenuOpen(false);
    setAboutPanel(panel);
  };

  return (
    <div className="settings-menu score-settings">
      <button className="settings-toggle" type="button"
        aria-label="Open game settings" aria-expanded={menuOpen}
        aria-controls="settingsMenu" title="Game settings"
        onClick={() => setMenuOpen((open) => !open)}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m19.43 12.98.04-.98-.04-.98 2.1-1.64-2-3.46-2.48 1a8.4 8.4 0 0 0-1.7-.98L15 3.29h-4l-.35 2.65c-.61.25-1.18.58-1.7.98l-2.48-1-2 3.46 2.1 1.64-.04.98.04.98-2.1 1.64 2 3.46 2.48-1c.52.4 1.09.73 1.7.98L11 20.71h4l.35-2.65a8.4 8.4 0 0 0 1.7-.98l2.48 1 2-3.46-2.1-1.64ZM13 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
        </svg>
      </button>
      <div id="settingsMenu" className="settings-popover" hidden={!menuOpen}>
        <button id="runnerToggle" className="hud-menu-action" type="button"
          aria-label="Select player" aria-controls="runnerSelect" onClick={closeMenu}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-5 0-8 2.5-8 5.5V21h16v-1.5C20 16.5 17 14 12 14Z" />
          </svg>
          <span><strong>Player</strong><small>Select runner</small></span>
        </button>
        <button id="guideToggle" className="hud-menu-action" type="button"
          aria-label="Show game guide" aria-controls="gameGuide" onClick={closeMenu}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M9.5 18h5v2h-5v-2Zm2.5-16a7 7 0 0 1 4.15 12.64c-.72.53-1.15 1.19-1.15 1.86H9c0-.67-.43-1.33-1.15-1.86A7 7 0 0 1 12 2Zm0 2a5 5 0 0 0-2.96 9.03c1.06.78 1.73 1.82 1.91 3.07h2.1c.18-1.25.85-2.29 1.91-3.07A5 5 0 0 0 12 4Z" />
          </svg>
          <span><strong>Tips</strong><small>How to play</small></span>
        </button>
        <GraphicsControls />
        <div className="settings-about">
          <button className="hud-menu-action" type="button"
            onClick={() => openAbout("game")}>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M11 10h2v7h-2v-7Zm0-4h2v2h-2V6Zm1-4a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
            </svg>
            <span><strong>About</strong><small>Game version and details</small></span>
          </button>
          <button className="hud-menu-action" type="button"
            onClick={() => openAbout("author")}>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 2 14 8l6 2-5 3.7.2 6.3-5.2-3.6L5 20l.2-6.3L0 10l6-2 2-6 4 4 4-4-2 6-2-6Z" />
            </svg>
            <span><strong>Author</strong><small>Meet the creator</small></span>
          </button>
        </div>
        <SettingsExitButton onExit={closeMenu} />
      </div>
      <AboutModal panel={aboutPanel} onClose={() => setAboutPanel(null)} />
    </div>
  );
}
