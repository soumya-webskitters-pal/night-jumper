import { useState } from "react";
import { runners } from "../../data/runners";
import RunnerCard from "./RunnerCard";

export default function RunnerSelect() {
  const [view, setView] = useState("grid");
  const nextView = view === "list" ? "grid" : "list";

  return (
    <section className="runner-select" id="runnerSelect" role="dialog"
      aria-modal="true" aria-labelledby="runnerSelectTitle" hidden>
      <div className="runner-select-card">
        <p className="runner-loading" id="runnerLoading" aria-live="polite" />
        <div className="runner-select-toolbar">
          <p className="guide-kicker">Choose your character</p>
          <button className="runner-view-toggle" type="button"
            aria-label={`Switch to ${nextView} view`}
            onClick={() => setView(nextView)}>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              {view === "list" ? (
                <path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" />
              ) : (
                <path d="M3 4h5v5H3V4Zm7 0h11v5H10V4ZM3 10h5v5H3v-5Zm7 0h11v5H10v-5ZM3 16h5v5H3v-5Zm7 0h11v5H10v-5Z" />
              )}
            </svg>
            <span>{nextView === "grid" ? "Grid" : "List"}</span>
          </button>
        </div>
        <h2 id="runnerSelectTitle">Select runner</h2>
        <p className="runner-select-copy">Each runner uses their own animated 3D model.</p>
        <div className={`runner-options is-${view}`}>
          {runners.map((runner, index) => (
            <RunnerCard runner={runner} selected={index === 0} key={runner.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
