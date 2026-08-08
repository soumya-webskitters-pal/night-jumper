import { useEffect } from "react";
import { createPortal } from "react-dom";
import VolumeControls from "./VolumeControls";

export default function SoundSettingsModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    window.dispatchEvent(new CustomEvent("night-runner:sound-open"));
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.dispatchEvent(new CustomEvent("night-runner:sound-close"));
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <section 
      className="sound-modal about-modal" 
      role="dialog" 
      aria-modal="true"
      aria-label="Sound Settings"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="about-modal-card">
        <button 
          className="about-modal-close" 
          type="button"
          aria-label="Close sound settings popup" 
          onClick={onClose}
        >
          <svg 
            aria-hidden="true" 
            viewBox="0 0 24 24" 
            width="18" 
            height="18" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <h2 className="sound-modal-title">Sound Settings</h2>
        <VolumeControls />
      </div>
    </section>,
    document.body,
  );
}
