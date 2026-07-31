import { Canvas } from "@react-three/fiber";
import EngineBridge from "./EngineBridge";

export default function GameCanvas() {
  return (
    <Canvas
      id="gameCanvas"
      aria-label="Three-dimensional runner game. Tap or press Space to jump, double-tap to super jump, and swipe down to roll."
      camera={{ fov: 52, near: 0.1, far: 120 }}
      dpr={1}
      gl={{
        antialias: true,
        alpha: false,
        depth: true,
        stencil: false,
        powerPreference: "high-performance",
      }}
      performance={{ min: 0.7 }}
      shadows
    >
      <EngineBridge />
    </Canvas>
  );
}
