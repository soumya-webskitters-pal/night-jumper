export default function GameFooter() {
  return (
    <footer className="game-footer">
      <div className="controls">
        <div className="control"><kbd>Space</kbd><span>Jump / tap / swipe up</span></div>
        <div className="control"><kbd>↓</kbd><span>Roll / swipe down</span></div>
        <div className="control super-jump-control"><kbd>×2</kbd><span>Super jump</span></div>
      </div>
      <div className="mobile-controls" aria-label="Game controls">
        <button id="jumpControl" className="mobile-control" type="button">
          <span aria-hidden="true">↑</span> Jump
        </button>
        <button id="superJumpControl" className="mobile-control mobile-control-super" type="button">
          <span aria-hidden="true">⇈</span> Super
        </button>
        <button id="rollControl" className="mobile-control" type="button">
          <span aria-hidden="true">↓</span> Roll
        </button>
      </div>
    </footer>
  );
}
