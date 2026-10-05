// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { createContext, useContext, useState } from "react";

const LanguageContext = createContext("en");

const greetings = { en: "Hello", hi: "Namaste", es: "Hola" };

// Deep child: gets the value without passing props through Page and Section
function Greeting() {
  const lang = useContext(LanguageContext);
  console.log("Greeting | lang:", lang);
  return <h2>{greetings[lang]}!</h2>;
}

function Section() {
  return <Greeting />;
}

function Page() {
  return <Section />;
}

export default function App() {
  const [lang, setLang] = useState("en");

  return (
    <LanguageContext.Provider value={lang}>
      <button onClick={() => setLang("en")}>English</button>
      <button onClick={() => setLang("hi")}>Hindi</button>
      <button onClick={() => setLang("es")}>Spanish</button>
      <Page />
    </LanguageContext.Provider>
  );
}
