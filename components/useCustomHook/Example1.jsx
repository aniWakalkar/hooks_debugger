// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState } from "react";

// A custom hook: a normal function whose name starts with "use"
// and that calls other hooks inside it.
function useCounter(initialValue) {
  const [count, setCount] = useState(initialValue);

  function increment() {
    setCount(count + 1);
  }

  function reset() {
    setCount(initialValue);
  }

  console.log("useCounter called, count =", count);
  return { count, increment, reset };
}

export default function App() {
  const likes = useCounter(0); // each call gets its own separate state
  const stars = useCounter(10);

  return (
    <div>
      <p>Likes: {likes.count}</p>
      <button onClick={likes.increment}>Like</button>
      <button onClick={likes.reset}>Reset likes</button>
      <p>Stars: {stars.count}</p>
      <button onClick={stars.increment}>Star</button>
    </div>
  );
}
