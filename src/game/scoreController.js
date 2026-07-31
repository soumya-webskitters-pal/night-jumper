export function createScoreController({
  gsap,
  state,
  scoreValue,
  highScoreValue,
  finalScoreValue,
}) {
  let displayedScore = 0;
  let databasePromise = null;
  let highScoreLoaded = false;

  function openDatabase() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("jumper-game", 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains("scores")) {
          database.createObjectStore("scores");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return databasePromise;
  }

  async function storeHighScore(value) {
    if (!highScoreLoaded || value <= state.highScore) return;
    state.highScore = value;
    highScoreValue.textContent = String(value);
    try {
      const database = await openDatabase();
      await new Promise((resolve, reject) => {
        const transaction = database.transaction("scores", "readwrite");
        transaction.objectStore("scores").put(value, "highest");
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.warn("Unable to save high score to IndexedDB", error);
    }
  }

  async function loadHighScore() {
    try {
      const database = await openDatabase();
      const value = await new Promise((resolve, reject) => {
        const transaction = database.transaction("scores", "readonly");
        const request = transaction.objectStore("scores").get("highest");
        request.onsuccess = () => resolve(Number(request.result) || 0);
        request.onerror = () => reject(request.error);
      });
      state.highScore = value;
      highScoreLoaded = true;
      highScoreValue.textContent = String(value);
      if (state.score > value) storeHighScore(state.score);
    } catch (error) {
      console.warn("Unable to load high score from IndexedDB", error);
    }
  }

  function updateDisplay(value, force = false) {
    if (!force && value === displayedScore) return;
    displayedScore = value;
    scoreValue.textContent = String(value);
    scoreValue.classList.remove("score-spin");
    void scoreValue.offsetWidth;
    scoreValue.classList.add("score-spin");
    storeHighScore(value);
  }

  function animateFinal(target) {
    const counter = { value: 0 };
    finalScoreValue.textContent = "0";
    gsap.to(counter, {
      value: target,
      duration: Math.min(2.2, 0.8 + target * 0.018),
      ease: "power3.out",
      onUpdate: () => {
        finalScoreValue.textContent = String(Math.round(counter.value));
      },
    });
  }

  return { loadHighScore, updateDisplay, animateFinal };
}
