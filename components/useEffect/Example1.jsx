// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useEffect } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(`EFFECT: ${count}`);

    return () => {
      console.log(`CLEANUP: ${count}`);
    };
  }, [count]);

  return (
    <div>
      <h2>Count: {count}</h2>

      <button onClick={() => setCount(count + 1)}>
        Count +1
      </button>
    </div>
  );
}
