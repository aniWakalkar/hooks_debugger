// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useEffect } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);

  // Runs only when name changes, not when count changes
  useEffect(() => {
    console.log("Effect [name]: name is", name);
  }, [name]);

  // No dependency array: runs after every render
  useEffect(() => {
    console.log("Effect (no array): runs after every render");
  });

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Count +1</button>
    </div>
  );
}
