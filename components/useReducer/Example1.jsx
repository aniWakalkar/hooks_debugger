// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useReducer } from "react";

function reducer(state, action) {
  console.log("reducer:", action.type, "| old count:", state.count);
  if (action.type === "increment") return { count: state.count + 1 };
  if (action.type === "decrement") return { count: state.count - 1 };
  if (action.type === "reset") return { count: 0 };
  return state;
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+1</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-1</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
}
