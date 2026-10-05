// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");

function ThemedBox() {
  const theme = useContext(ThemeContext); // reads the nearest Provider's value
  console.log("ThemedBox got theme:", theme);

  return (
    <p style={{ padding: 8, background: theme === "dark" ? "#333" : "#eee", color: theme === "dark" ? "#fff" : "#000" }}>
      Current theme: {theme}
    </p>
  );
}

export default function App() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Toggle theme</button>
      <ThemedBox />
    </ThemeContext.Provider>
  );
}
