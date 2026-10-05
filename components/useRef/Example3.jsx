// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useRef } from "react";

export default function App() {
  const [time, setTime] = useState(0);
  const intervalId = useRef(null); // keeps the id between renders

  function start() {
    if (intervalId.current) return;
    intervalId.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    console.log("Started, interval id:", intervalId.current);
  }

  function stop() {
    console.log("Stopping interval id:", intervalId.current);
    clearInterval(intervalId.current);
    intervalId.current = null;
  }

  return (
    <div>
      <h2>{time}s</h2>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
