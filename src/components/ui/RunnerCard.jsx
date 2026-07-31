export default function RunnerCard({ runner, selected }) {
  return (
    <button className={`runner-option${selected ? " is-selected" : ""}`}
      type="button" data-runner={runner.id} aria-pressed={selected}>
      <span className={`runner-avatar ${runner.avatar}`}>
        <img src={runner.image} alt={`${runner.name} runner preview`} />
      </span>
      <span className="runner-name">{runner.name}</span>
      <span className="runner-detail">{runner.detail}</span>
      <span className="runner-check">{selected ? "Selected" : "Select"}</span>
    </button>
  );
}
