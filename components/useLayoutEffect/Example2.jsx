// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useLayoutEffect, useRef } from "react";

export default function App() {
  const [text, setText] = useState("Hello");
  const [width, setWidth] = useState(0);
  const boxRef = useRef(null);

  // Measure the box after the DOM updates but before the browser paints
  useLayoutEffect(() => {
    const w = boxRef.current.getBoundingClientRect().width;
    console.log("Measured width:", w);
    setWidth(w);
  }, [text]);

  return (
    <div>
      <span ref={boxRef} style={{ background: "#fde68a", padding: 4 }}>
        {text}
      </span>
      <p>Width of the yellow box: {Math.round(width)}px</p>
      <button onClick={() => setText(text + " world")}>Add text</button>
      <button onClick={() => setText("Hi")}>Short text</button>
    </div>
  );
}
