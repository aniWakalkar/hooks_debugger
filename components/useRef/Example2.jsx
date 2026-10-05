// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useRef, useEffect } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const previous = useRef(0);

  // Runs after render: save the current value for the next render
  useEffect(() => {
    previous.current = count;
  }, [count]);

  console.log("Render | count:", count, "| previous:", previous.current);

  return (
    <div>
      <p>Now: {count}</p>
      <p>Before: {previous.current}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count + 5)}>+5</button>
    </div>
  );
}
