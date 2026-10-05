// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useEffect, useLayoutEffect } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    console.log("useLayoutEffect:", count, "(before the browser paints)");
  }, [count]);

  useEffect(() => {
    console.log("useEffect:", count, "(after the browser paints)");
  }, [count]);

  console.log("Render:", count);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Count +1</button>
    </div>
  );
}
