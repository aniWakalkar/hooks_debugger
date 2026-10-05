// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useMemo } from "react";

const fruits = ["Apple", "Banana", "Mango", "Orange", "Grapes", "Pineapple", "Papaya"];

export default function App() {
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(false);

  // Filters again only when search changes (not when the theme changes)
  const filtered = useMemo(() => {
    console.log("Filtering for:", search);
    return fruits.filter((f) => f.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div style={{ background: dark ? "#333" : "#fff", color: dark ? "#fff" : "#000", padding: 8 }}>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fruit" />
      <button onClick={() => setDark(!dark)}>Toggle theme</button>
      <ul>
        {filtered.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  );
}
