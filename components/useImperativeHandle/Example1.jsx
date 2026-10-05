// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { forwardRef, useImperativeHandle, useRef } from "react";

const MyInput = forwardRef(function MyInput(props, ref) {
  const inputRef = useRef(null);

  // The parent's ref gets only these two functions
  useImperativeHandle(ref, () => ({
    focus() {
      console.log("Parent called focus()");
      inputRef.current.focus();
    },
    clear() {
      console.log("Parent called clear()");
      inputRef.current.value = "";
    },
  }));

  return <input ref={inputRef} placeholder="Type something" />;
});

export default function App() {
  const myInputRef = useRef(null);

  return (
    <div>
      <MyInput ref={myInputRef} />
      <button onClick={() => myInputRef.current.focus()}>Focus</button>
      <button onClick={() => myInputRef.current.clear()}>Clear</button>
    </div>
  );
}
