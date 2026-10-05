// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState } from "react";

// Custom hook: a true/false value with a toggle function
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn((v) => !v);
  console.log("useToggle, on =", on);
  return [on, toggle];
}

export default function App() {
  const [showDetails, toggleDetails] = useToggle(false);
  const [darkMode, toggleDark] = useToggle(true);

  return (
    <div style={{ background: darkMode ? "#333" : "#fff", color: darkMode ? "#fff" : "#000", padding: 8 }}>
      <button onClick={toggleDark}>Dark mode: {darkMode ? "on" : "off"}</button>
      <button onClick={toggleDetails}>{showDetails ? "Hide" : "Show"} details</button>
      {showDetails && <p>Here are the details!</p>}
    </div>
  );
}
