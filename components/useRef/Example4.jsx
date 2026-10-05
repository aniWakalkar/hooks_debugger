// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useRef } from "react";

export default function App() {
  const [stateCount, setStateCount] = useState(0);
  const refCount = useRef(0);

  function addToRef() {
    refCount.current = refCount.current + 1;
    console.log("ref is now", refCount.current, "(screen does not update)");
  }

  console.log("Render | state:", stateCount, "| ref:", refCount.current);

  return (
    <div>
      <p>State: {stateCount}</p>
      <p>Ref: {refCount.current}</p>
      <button onClick={addToRef}>Ref +1 (no re-render)</button>
      <button onClick={() => setStateCount(stateCount + 1)}>State +1 (re-render)</button>
    </div>
  );
}
