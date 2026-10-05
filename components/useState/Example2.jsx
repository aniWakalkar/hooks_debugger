// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState } from "react";

export default function App() {
  const [text, setText] = useState("");

  console.log("Render | text:", text);

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your name" />
      <p>Hello, {text || "stranger"}!</p>
      <p>Length: {text.length}</p>
      <button onClick={() => setText("")}>Clear</button>
    </div>
  );
}
