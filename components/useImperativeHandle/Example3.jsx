// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { forwardRef, useImperativeHandle, useState, useRef } from "react";

const Modal = forwardRef(function Modal(props, ref) {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open() {
      console.log("Modal: open()");
      setOpen(true);
    },
    close() {
      console.log("Modal: close()");
      setOpen(false);
    },
  }));

  if (!open) return null;

  return (
    <div style={{ border: "2px solid #333", padding: 12, marginTop: 8 }}>
      <p>I am a modal!</p>
      <button onClick={() => setOpen(false)}>Close from inside</button>
    </div>
  );
});

export default function App() {
  const modalRef = useRef(null);

  return (
    <div>
      <button onClick={() => modalRef.current.open()}>Open modal</button>
      <button onClick={() => modalRef.current.close()}>Close modal</button>
      <Modal ref={modalRef} />
    </div>
  );
}
