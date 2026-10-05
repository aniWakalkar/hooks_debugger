// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useEffect, useLayoutEffect } from "react";

function WithEffect() {
  const [label, setLabel] = useState("loading");
  // Runs AFTER paint: "loading" may flash on the screen first
  useEffect(() => {
    console.log("useEffect: set ready");
    setLabel("ready");
  }, []);
  return <p>useEffect box: {label}</p>;
}

function WithLayoutEffect() {
  const [label, setLabel] = useState("loading");
  // Runs BEFORE paint: the user never sees "loading"
  useLayoutEffect(() => {
    console.log("useLayoutEffect: set ready");
    setLabel("ready");
  }, []);
  return <p>useLayoutEffect box: {label}</p>;
}

export default function App() {
  const [key, setKey] = useState(0);

  return (
    <div>
      {/* Changing key creates the boxes again */}
      <WithEffect key={"a" + key} />
      <WithLayoutEffect key={"b" + key} />
      <button onClick={() => setKey(key + 1)}>Mount again</button>
    </div>
  );
}
