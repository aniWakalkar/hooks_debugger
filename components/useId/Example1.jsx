// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useId } from "react";

function EmailField() {
  const id = useId(); // unique id for each EmailField
  console.log("Generated id:", id);

  return (
    <div>
      <label htmlFor={id}>Email: </label>
      <input id={id} type="email" />
    </div>
  );
}

export default function App() {
  return (
    <div>
      <EmailField />
      <EmailField />
    </div>
  );
}
