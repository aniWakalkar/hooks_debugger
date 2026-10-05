// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useState, useLayoutEffect, useRef } from "react";

export default function App() {
  const [messages, setMessages] = useState(["Hi!", "How are you?"]);
  const listRef = useRef(null);

  // Scroll to the newest message before the user sees the screen
  useLayoutEffect(() => {
    const list = listRef.current;
    list.scrollTop = list.scrollHeight;
    console.log("Scrolled to bottom, messages:", messages.length);
  }, [messages]);

  return (
    <div>
      <div ref={listRef} style={{ height: 80, overflowY: "auto", border: "1px solid #ccc", padding: 4 }}>
        {messages.map((m, i) => (
          <p key={i} style={{ margin: 4 }}>
            {m}
          </p>
        ))}
      </div>
      <button onClick={() => setMessages([...messages, "Message " + (messages.length + 1)])}>Add message</button>
    </div>
  );
}
