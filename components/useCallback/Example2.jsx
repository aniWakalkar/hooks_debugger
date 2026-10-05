// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useCallback, memo } from "react";

// memo: re-renders only when its props change
const Child = memo(function Child({ onClick }) {
  console.log("Child rendered");
  return <button onClick={onClick}>Child button</button>;
});

export default function App() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // Same function every render, so Child is skipped when only "other" changes
  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  console.log("App rendered");

  return (
    <div>
      <p>Count: {count}</p>
      <Child onClick={handleClick} />
      <p>Other: {other}</p>
      <button onClick={() => setOther(other + 1)}>Other +1 (Child does not re-render)</button>
    </div>
  );
}
