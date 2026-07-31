import GameVersion from "./GameVersion";

export default function AboutGame() {
  return (
    <section className="about-panel game-about" aria-label="About the game">
      <span className="about-eyebrow">Night Runner</span>
      <strong>Jumper.</strong>
      <p>A neon endless runner built for quick reflexes, clean motion, and one-more-run energy.</p>
      <GameVersion />
    </section>
  );
}
