// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  console.log("Navbar | user:", user);

  if (!user) return <p>Not logged in</p>;

  return (
    <p>
      Welcome, {user} <button onClick={logout}>Logout</button>
    </p>
  );
}

function LoginButton() {
  const { user, login } = useContext(AuthContext);
  if (user) return null;
  return <button onClick={() => login("Aniket")}>Login</button>;
}

export default function App() {
  const [user, setUser] = useState(null);

  // The value can hold both data and functions
  const value = {
    user,
    login: (name) => setUser(name),
    logout: () => setUser(null),
  };

  return (
    <AuthContext.Provider value={value}>
      <Navbar />
      <LoginButton />
    </AuthContext.Provider>
  );
}
