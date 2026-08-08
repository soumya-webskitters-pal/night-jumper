import { useState, useRef } from "react";

export default function RangeSlider({
  id,
  label,
  sublabel,
  min = 0,
  max = 1,
  step = 0.05,
  value,
  onChange,
  ariaLabel,
}) {
  const [isActive, setIsActive] = useState(false);
  const lastSoundTimeRef = useRef(0);

  const percentage = Math.round(((value - min) / (max - min)) * 100);

  // Position tooltip bubble directly over the thumb center
  const tooltipStyle = {
    left: `calc(${percentage}% + ${(10 - percentage * 0.2)}px)`,
  };

  // Linear gradient for solid fill on the left and soft translucent track on the right
  const trackStyle = {
    background: `linear-gradient(to right, #00ff66 0%, #00ff66 ${percentage}%, rgba(0, 255, 102, 0.18) ${percentage}%, rgba(0, 255, 102, 0.18) 100%)`,
  };

  const handleInputChange = (e) => {
    onChange(e);

    // Play SFX sound feedback as user changes the slider value (throttled to ~75ms)
    const now = performance.now();
    if (now - lastSoundTimeRef.current > 75) {
      lastSoundTimeRef.current = now;
      if (window.gameAudio) {
        window.gameAudio.playClick();
      }
    }
  };

  return (
    <div className={`custom-range-slider-group ${isActive ? "is-active" : ""}`}>
      <div className="custom-range-slider-header">
        <label htmlFor={id}>
          <strong>{label}</strong>
          {sublabel && <small>{sublabel}</small>}
        </label>
      </div>

      <div className="custom-range-slider-track-area">
        {/* Floating Speech-Bubble Tooltip with pop & float animation */}
        <div 
          className={`slider-tooltip-bubble ${isActive ? "is-bouncing" : ""}`} 
          style={tooltipStyle}
        >
          {percentage}%
        </div>

        <div className="slider-track-wrapper">
          {/* Left cap dot matching reference design */}
          <div className="slider-left-dot" />

          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleInputChange}
            onMouseDown={() => setIsActive(true)}
            onMouseUp={() => setIsActive(false)}
            onTouchStart={() => setIsActive(true)}
            onTouchEnd={() => setIsActive(false)}
            aria-label={ariaLabel || label}
            style={trackStyle}
            className="custom-range-input"
          />
        </div>
      </div>
    </div>
  );
}
