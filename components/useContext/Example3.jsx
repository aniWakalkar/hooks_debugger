// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { createContext, useContext } from "react";

const ColorContext = createContext("gray"); // default value

function Box() {
  const color = useContext(ColorContext);
  console.log("Box | color:", color);
  return <p style={{ color }}>This text is {color}</p>;
}

export default function App() {
  return (
    <div>
      {/* No Provider above: uses the default value */}
      <Box />

      <ColorContext.Provider value="blue">
        <Box />
        {/* The nearest Provider wins */}
        <ColorContext.Provider value="red">
          <Box />
        </ColorContext.Provider>
      </ColorContext.Provider>
    </div>
  );
}
