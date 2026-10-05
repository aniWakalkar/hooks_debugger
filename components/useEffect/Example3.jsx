// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useEffect } from "react";

export default function App() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    console.log("Effect: start interval");
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    // Without this, every Start would add another interval
    return () => {
      console.log("Cleanup: stop interval");
      clearInterval(id);
    };
  }, [running]);

  return (
    <div>
      <h2>{seconds}s</h2>
      <button onClick={() => setRunning(!running)}>{running ? "Stop" : "Start"}</button>
      <button onClick={() => setSeconds(0)}>Reset</button>
    </div>
  );
}
