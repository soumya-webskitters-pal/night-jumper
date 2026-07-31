import GameCanvas from "./components/GameCanvas";
import CountdownOverlay from "./components/ui/CountdownOverlay";
import GameFooter from "./components/ui/GameFooter";
import GameGuide from "./components/ui/GameGuide";
import GameMeta from "./components/ui/GameMeta";
import Hero from "./components/ui/Hero";
import HudActions from "./components/ui/HudActions";
import LoadingScreen from "./components/ui/LoadingScreen";
import RestartPanel from "./components/ui/RestartPanel";
import RunnerSelect from "./components/ui/RunnerSelect";
import ScoreCard from "./components/ui/ScoreCard";

export default function App() {
  return (
    <>
      <LoadingScreen />
      <GameCanvas />
      <main className="hud">
        <Hero />
        <CountdownOverlay />
        <aside className="hud-cluster" aria-label="Game information and settings">
          <ScoreCard />
          <HudActions />
        </aside>
        <GameFooter />
        <RestartPanel />
        <GameGuide />
        <RunnerSelect />
      </main>
      <GameMeta />
    </>
  );
}
