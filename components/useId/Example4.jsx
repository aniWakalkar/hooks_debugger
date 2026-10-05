// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useId, useState } from "react";

function Option({ label, checked, onChange }) {
  const id = useId(); // each Option gets its own id
  return (
    <div>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <label htmlFor={id}> {label}</label>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState([]);
  const toppings = ["Cheese", "Onion", "Corn"];

  function toggle(item) {
    setSelected(selected.includes(item) ? selected.filter((x) => x !== item) : [...selected, item]);
  }

  console.log("Selected:", selected);

  return (
    <div>
      {toppings.map((t) => (
        <Option key={t} label={t} checked={selected.includes(t)} onChange={() => toggle(t)} />
      ))}
      <p>Clicking a label also ticks its box: {selected.join(", ") || "none"}</p>
    </div>
  );
}
