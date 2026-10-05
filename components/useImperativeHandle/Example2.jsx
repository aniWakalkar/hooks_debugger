// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { forwardRef, useImperativeHandle, useState, useRef } from "react";

const Counter = forwardRef(function Counter(props, ref) {
  const [count, setCount] = useState(0);

  // The parent can call these, but cannot touch count directly
  useImperativeHandle(ref, () => ({
    increment() {
      console.log("Parent called increment()");
      setCount((c) => c + 1);
    },
    reset() {
      console.log("Parent called reset()");
      setCount(0);
    },
  }));

  return <p>Child count: {count}</p>;
});

export default function App() {
  const counterRef = useRef(null);

  return (
    <div>
      <Counter ref={counterRef} />
      <button onClick={() => counterRef.current.increment()}>Increment child</button>
      <button onClick={() => counterRef.current.reset()}>Reset child</button>
    </div>
  );
}
