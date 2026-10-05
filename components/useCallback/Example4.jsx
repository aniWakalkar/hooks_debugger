// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useCallback } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  // Wrong: [] keeps the first count (0) forever, so it always sets 1
  const addStale = useCallback(() => {
    console.log("addStale sees count =", count);
    setCount(count + 1);
  }, []);

  // Right: functional update reads the latest value, so [] is fine
  const addFresh = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={addStale}>+1 (stale value)</button>
      <button onClick={addFresh}>+1 (functional update)</button>
    </div>
  );
}
