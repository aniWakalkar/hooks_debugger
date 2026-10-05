// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useEffect } from "react";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // [] = runs only once, after the first render (like loading data when the page opens)
  useEffect(() => {
    console.log("Effect: loading user...");
    const id = setTimeout(() => {
      setUser({ name: "Aniket", city: "Pune" });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(id);
  }, []);

  console.log("Render | loading:", loading);

  if (loading) return <p>Loading...</p>;

  return (
    <p>
      {user.name} lives in {user.city}
    </p>
  );
}
