// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

const Form = forwardRef(function Form(props, ref) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // The parent can ask the form to check itself
  useImperativeHandle(ref, () => ({
    validate() {
      const ok = name.trim().length >= 3;
      console.log("validate() called, valid =", ok);
      setError(ok ? "" : "Name must have at least 3 letters");
      return ok;
    },
  }));

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
});

export default function App() {
  const formRef = useRef(null);
  const [message, setMessage] = useState("");

  function save() {
    if (formRef.current.validate()) setMessage("Saved!");
    else setMessage("");
  }

  return (
    <div>
      <Form ref={formRef} />
      <button onClick={save}>Save</button>
      <p>{message}</p>
    </div>
  );
}
