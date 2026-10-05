// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useEffect } from "react";

// Custom hook: gives back the value only after the user stops typing for `delay` ms
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => {
      console.log("Debounced value:", value);
      setDebounced(value);
    }, delay);

    // New key press before the delay: cancel the old timer
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export default function App() {
  const [text, setText] = useState("");
  const search = useDebounce(text, 500);

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search" />
      <p>Typing: {text}</p>
      <p>Searching for (after 500ms): {search}</p>
    </div>
  );
}
