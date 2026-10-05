// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  console.log("Outside return", count);

  return (
    <>
    {console.log("First inside return", count)}
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    {console.log("Last inside return", count)}
    </>
  );
}
