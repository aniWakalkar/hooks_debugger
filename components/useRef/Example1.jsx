// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useRef } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const renders = useRef(0); // changing .current does NOT re-render
  const inputRef = useRef(null); // points to the <input> element

  renders.current = renders.current + 1;
  console.log("Render number:", renders.current);

  return (
    <div>
      <input ref={inputRef} placeholder="Type here" />
      <button onClick={() => inputRef.current.focus()}>Focus input</button>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Count +1</button>
    </div>
  );
}
