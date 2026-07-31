import { useEffect } from "react";
import { createPortal } from "react-dom";
import AboutAuthor from "./AboutAuthor";
import AboutGame from "./AboutGame";

export default function AboutModal({ panel, onClose }) {
  useEffect(() => {
    if (!panel) return undefined;
    window.dispatchEvent(new CustomEvent("night-runner:about-open"));
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.dispatchEvent(new CustomEvent("night-runner:about-close"));
    };
  }, [panel, onClose]);

  if (!panel) return null;

  return createPortal(
    <section className="about-modal" role="dialog" aria-modal="true"
      aria-label={panel === "game" ? "About the game" : "About the author"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div className="about-modal-card">
        <button className="about-modal-close" type="button"
          aria-label="Close about popup" onClick={onClose}>×</button>
        {panel === "game" ? <AboutGame /> : <AboutAuthor />}
      </div>
    </section>,
    document.body,
  );
}
