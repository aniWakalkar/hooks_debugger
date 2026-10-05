// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useMemo, useEffect } from "react";

export default function App() {
  const [age, setAge] = useState(20);
  const [count, setCount] = useState(0);

  // Without useMemo, this would be a NEW object on every render,
  // and the effect below would run every time
  const person = useMemo(() => ({ name: "Aniket", age }), [age]);

  useEffect(() => {
    console.log("Effect: person changed", person);
  }, [person]);

  return (
    <div>
      <p>
        {person.name} is {person.age}
      </p>
      <button onClick={() => setAge(age + 1)}>Age +1 (effect runs)</button>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Count +1 (effect does not run)</button>
    </div>
  );
}
