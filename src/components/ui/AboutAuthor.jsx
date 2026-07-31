import TechnologyStack from "./TechnologyStack";

export default function AboutAuthor() {
  return (
    <section className="about-panel author-about" aria-label="About the author">
      <img src="/favicon.png" alt="Soumya Pal profile" />
      <div className="author-copy">
        <span className="about-eyebrow">Vibe coder</span>
        <strong>Soumya Pal</strong>
        <p>Dreaming in pixels. Building after dark. Turning playful ideas into interactive worlds.</p>
      </div>
      <TechnologyStack />
      <p className="codex-credit">
        <span aria-hidden="true">✦</span>
        Created with Codex
      </p>
    </section>
  );
}
