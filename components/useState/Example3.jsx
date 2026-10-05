// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  function addThreeWrong() {
    // All three use the same old count, so it only goes up by 1
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  function addThreeRight() {
    // Functional update: each one gets the latest value
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  }

  console.log("Render | count:", count);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={addThreeWrong}>+3 (wrong way)</button>
      <button onClick={addThreeRight}>+3 (functional update)</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
