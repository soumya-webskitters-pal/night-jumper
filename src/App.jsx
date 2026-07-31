import GameCanvas from "./components/GameCanvas";
import GameFooter from "./components/ui/GameFooter";
import GameGuide from "./components/ui/GameGuide";
import GameMeta from "./components/ui/GameMeta";
import GraphicsControls from "./components/ui/GraphicsControls";
import Hero from "./components/ui/Hero";
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
        <ScoreCard />
        <GraphicsControls />
        <GameFooter />
        <RestartPanel />
        <GameGuide />
        <RunnerSelect />
      </main>
      <GameMeta />
    </>
  );
}
