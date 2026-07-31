import { runners } from "../../data/runners";
import RunnerCard from "./RunnerCard";

export default function RunnerSelect() {
  return (
    <section className="runner-select" id="runnerSelect" role="dialog"
      aria-modal="true" aria-labelledby="runnerSelectTitle" hidden>
      <div className="runner-select-card">
        <p className="guide-kicker">Choose your character</p>
        <h2 id="runnerSelectTitle">Select runner</h2>
        <p className="runner-select-copy">Each runner uses their own animated 3D model.</p>
        <div className="runner-options">
          {runners.map((runner, index) => (
            <RunnerCard runner={runner} selected={index === 0} key={runner.id} />
          ))}
        </div>
        <p className="runner-loading" id="runnerLoading" aria-live="polite" />
      </div>
    </section>
  );
}
