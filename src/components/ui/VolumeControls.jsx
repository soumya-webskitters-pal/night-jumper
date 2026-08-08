import { useState } from "react";
import RangeSlider from "./RangeSlider";

export default function VolumeControls() {
  const [musicVol, setMusicVol] = useState(() => 
    parseFloat(localStorage.getItem("night-runner-volume-music") ?? "0.5")
  );
  const [sfxVol, setSfxVol] = useState(() => 
    parseFloat(localStorage.getItem("night-runner-volume-sfx") ?? "1.0")
  );

  const handleMusicChange = (e) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    if (window.gameAudio) {
      window.gameAudio.setMusicVolume(val);
    } else {
      localStorage.setItem("night-runner-volume-music", String(val));
    }
  };

  const handleSfxChange = (e) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    if (window.gameAudio) {
      window.gameAudio.setSfxVolume(val);
    } else {
      localStorage.setItem("night-runner-volume-sfx", String(val));
    }
  };

  return (
    <section className="volume-controls" aria-label="Volume settings">
      <RangeSlider
        id="musicVolume"
        label="Music"
        sublabel="Background sound"
        min={0}
        max={1}
        step={0.05}
        value={musicVol}
        onChange={handleMusicChange}
        ariaLabel="Music volume"
      />
      <RangeSlider
        id="sfxVolume"
        label="SFX"
        sublabel="Effects sound"
        min={0}
        max={1}
        step={0.05}
        value={sfxVol}
        onChange={handleSfxChange}
        ariaLabel="SFX volume"
      />
    </section>
  );
}
