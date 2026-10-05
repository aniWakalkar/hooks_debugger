// This file must have `export default function App()`
// (main.jsx imports and renders it).

import { useReducer } from "react";

const products = [
  { id: 1, name: "Pen", price: 10 },
  { id: 2, name: "Notebook", price: 50 },
];

function cartReducer(cart, action) {
  console.log("reducer:", action.type, action.product ? action.product.name : "");
  switch (action.type) {
    case "add": {
      const qty = (cart[action.product.id] || 0) + 1;
      return { ...cart, [action.product.id]: qty };
    }
    case "remove": {
      const qty = (cart[action.product.id] || 0) - 1;
      const next = { ...cart };
      if (qty > 0) next[action.product.id] = qty;
      else delete next[action.product.id];
      return next;
    }
    case "clear":
      return {};
    default:
      return cart;
  }
}

export default function App() {
  const [cart, dispatch] = useReducer(cartReducer, {});

  const total = products.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0);

  return (
    <div>
      {products.map((p) => (
        <p key={p.id}>
          {p.name} (Rs {p.price}) x {cart[p.id] || 0}{" "}
          <button onClick={() => dispatch({ type: "add", product: p })}>+</button>
          <button onClick={() => dispatch({ type: "remove", product: p })}>-</button>
        </p>
      ))}
      <p>Total: Rs {total}</p>
      <button onClick={() => dispatch({ type: "clear" })}>Clear cart</button>
    </div>
  );
}
