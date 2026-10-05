// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useMemo } from "react";

export default function App() {
  const [number, setNumber] = useState(5);
  const [count, setCount] = useState(0);

  // Recalculates only when number changes
  const square = useMemo(() => {
    console.log("Calculating square of", number);
    return number * number;
  }, [number]);

  console.log("Render | square:", square, "| count:", count);

  return (
    <div>
      <p>{number} x {number} = {square}</p>
      <button onClick={() => setNumber(number + 1)}>Number +1 (recalculates)</button>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Count +1 (uses cached value)</button>
    </div>
  );
}
