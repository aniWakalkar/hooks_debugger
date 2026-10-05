// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useId } from "react";

function PasswordField() {
  const hintId = useId();
  console.log("Hint id:", hintId);

  return (
    <div>
      <label>
        Password: <input type="password" aria-describedby={hintId} />
      </label>
      {/* Screen readers read this hint for the input above */}
      <p id={hintId} style={{ fontSize: 12, color: "#555" }}>
        Use at least 8 characters.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <PasswordField />
      <PasswordField />
    </div>
  );
}
