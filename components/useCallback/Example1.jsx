// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useCallback, useEffect } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // Same function is reused until count changes
  const sayHello = useCallback(() => {
    console.log("Hello! count is", count);
  }, [count]);

  useEffect(() => {
    console.log("sayHello is a NEW function");
  }, [sayHello]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Count +1 (new function)</button>
      <p>Text: {text}</p>
      <button onClick={() => setText(text + "a")}>Add "a" (same function)</button>
      <button onClick={sayHello}>Say hello</button>
    </div>
  );
}
