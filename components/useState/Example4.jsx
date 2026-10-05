// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState } from "react";

export default function App() {
  const [todos, setTodos] = useState(["Learn useState"]);
  const [input, setInput] = useState("");

  function addTodo() {
    if (!input) return;
    // Never push into the old array: create a new one
    setTodos([...todos, input]);
    setInput("");
  }

  function removeTodo(index) {
    setTodos(todos.filter((_, i) => i !== index));
  }

  console.log("Render | todos:", todos);

  return (
    <div>
      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="New todo" />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo} <button onClick={() => removeTodo(index)}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
