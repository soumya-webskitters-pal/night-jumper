const technologies = ["React", "Three.js", "GSAP", "Vite"];

export default function TechnologyStack() {
  return (
    <div className="technology-stack">
      <span className="about-eyebrow">Technology used</span>
      <div className="technology-list">
        {technologies.map((technology) => (
          <span key={technology}>{technology}</span>
        ))}
      </div>
    </div>
  );
}
