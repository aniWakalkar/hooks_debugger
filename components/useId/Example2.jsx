// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useId } from "react";

function SignupForm() {
  // One id, many fields: add a suffix for each one
  const id = useId();
  console.log("Base id:", id);

  return (
    <div>
      <div>
        <label htmlFor={id + "-name"}>Name: </label>
        <input id={id + "-name"} />
      </div>
      <div>
        <label htmlFor={id + "-email"}>Email: </label>
        <input id={id + "-email"} type="email" />
      </div>
      <div>
        <label htmlFor={id + "-password"}>Password: </label>
        <input id={id + "-password"} type="password" />
      </div>
    </div>
  );
}

export default function App() {
  return <SignupForm />;
}
