// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useCallback, useEffect } from "react";

export default function App() {
  const [query, setQuery] = useState("react");
  const [count, setCount] = useState(0);

  // New function only when query changes
  const search = useCallback(() => {
    console.log("Searching for:", query);
  }, [query]);

  // Runs again only when search is a new function (when query changes)
  useEffect(() => {
    search();
  }, [search]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Count +1 (no new search)</button>
    </div>
  );
}
