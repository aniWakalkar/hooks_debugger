// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState } from "react";

// Custom hook: everything one input field needs
function useInput(initialValue) {
  const [value, setValue] = useState(initialValue);

  function onChange(e) {
    setValue(e.target.value);
  }

  function reset() {
    setValue(initialValue);
  }

  return { value, onChange, reset };
}

export default function App() {
  const name = useInput("");
  const city = useInput("Pune");

  console.log("Render | name:", name.value, "| city:", city.value);

  return (
    <div>
      {/* value and onChange come from the hook */}
      <input value={name.value} onChange={name.onChange} placeholder="Name" />
      <input value={city.value} onChange={city.onChange} placeholder="City" />
      <p>
        {name.value || "Someone"} from {city.value}
      </p>
      <button
        onClick={() => {
          name.reset();
          city.reset();
        }}
      >
        Reset
      </button>
    </div>
  );
}
