// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useMemo } from "react";

const students = [
  { name: "Riya", marks: 82 },
  { name: "Aman", marks: 67 },
  { name: "Neha", marks: 91 },
  { name: "Karan", marks: 74 },
];

export default function App() {
  const [ascending, setAscending] = useState(true);
  const [highlight, setHighlight] = useState(false);

  // Sorts again only when the order changes
  const sorted = useMemo(() => {
    console.log("Sorting, ascending =", ascending);
    // Copy first: sort() changes the original array
    return [...students].sort((a, b) => (ascending ? a.marks - b.marks : b.marks - a.marks));
  }, [ascending]);

  return (
    <div>
      <button onClick={() => setAscending(!ascending)}>Sort {ascending ? "high to low" : "low to high"}</button>
      <button onClick={() => setHighlight(!highlight)}>Toggle highlight (no sorting)</button>
      <ol>
        {sorted.map((s) => (
          <li key={s.name} style={{ fontWeight: highlight && s.marks > 80 ? "bold" : "normal" }}>
            {s.name}: {s.marks}
          </li>
        ))}
      </ol>
    </div>
  );
}
