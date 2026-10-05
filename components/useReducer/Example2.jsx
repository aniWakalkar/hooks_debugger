// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useReducer, useState } from "react";

function todoReducer(todos, action) {
  console.log("reducer:", action.type);
  switch (action.type) {
    case "add":
      return [...todos, { id: Date.now(), text: action.text, done: false }];
    case "toggle":
      return todos.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case "remove":
      return todos.filter((t) => t.id !== action.id);
    default:
      return todos;
  }
}

export default function App() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [text, setText] = useState("");

  function add() {
    if (!text) return;
    dispatch({ type: "add", text });
    setText("");
  }

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="New todo" />
      <button onClick={add}>Add</button>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <span onClick={() => dispatch({ type: "toggle", id: t.id })} style={{ textDecoration: t.done ? "line-through" : "none", cursor: "pointer" }}>
              {t.text}
            </span>{" "}
            <button onClick={() => dispatch({ type: "remove", id: t.id })}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
