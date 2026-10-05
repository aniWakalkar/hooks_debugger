// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useReducer } from "react";

const initialForm = { name: "", email: "", submitted: false };

function formReducer(state, action) {
  console.log("reducer:", action.type, action.field || "");
  switch (action.type) {
    case "change":
      return { ...state, [action.field]: action.value };
    case "submit":
      return { ...state, submitted: true };
    case "reset":
      return initialForm;
    default:
      return state;
  }
}

export default function App() {
  const [form, dispatch] = useReducer(formReducer, initialForm);

  function handleChange(e) {
    dispatch({ type: "change", field: e.target.name, value: e.target.value });
  }

  if (form.submitted) {
    return (
      <div>
        <p>
          Thanks {form.name}! We will email {form.email}
        </p>
        <button onClick={() => dispatch({ type: "reset" })}>Start again</button>
      </div>
    );
  }

  return (
    <div>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <button onClick={() => dispatch({ type: "submit" })}>Submit</button>
    </div>
  );
}
