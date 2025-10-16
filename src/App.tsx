import { useState } from "react";
import "./index.css";

type Item = { id: number; name: string; price: number; people: string[] };

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [person, setPerson] = useState("");
  const [people, setPeople] = useState<string[]>([]);
  const [result, setResult] = useState<Record<string, number> | null>(null);

  function addPerson() {
    if (person && !people.includes(person)) {
      setPeople([...people, person]);
      setPerson("");
    }
  }

  function addItem() {
    if (!name || !price) return;
    setItems([...items, { id: Date.now(), name, price: Number(price), people: [] }]);
    setName("");
    setPrice("");
  }

  function togglePerson(itemId: number, p: string) {
    setItems(items.map(it =>
      it.id === itemId
        ? {
            ...it,
            people: it.people.includes(p)
              ? it.people.filter(x => x !== p)
              : [...it.people, p],
          }
        : it
    ));
  }

  function calculateSplits() {
    const totals: Record<string, number> = {};
    for (const item of items) {
      const share = item.people.length ? item.price / item.people.length : 0;
      for (const p of item.people) {
        totals[p] = (totals[p] || 0) + share;
      }
    }
    setResult(totals);
  }

  return (
    <div className="container">
      <h1>FairShare Splitter</h1>

      {/* Add people */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>People</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            placeholder="Add person"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
          />
          <button onClick={addPerson}>Add</button>
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          {people.map((p) => (
            <span
              key={p}
              style={{
                display: "inline-block",
                marginRight: "0.5rem",
                background: "#e0e7ff",
                padding: "0.3rem 0.6rem",
                borderRadius: "6px",
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Add items */}
      <div>
        <h3>Items</h3>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <input
            placeholder="Item name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button onClick={addItem}>Add</button>
        </div>

        {items.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Who used it?</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td>${it.price.toFixed(2)}</td>
                  <td>
                    {people.map((p) => (
                      <label key={p} style={{ marginRight: "0.5rem" }}>
                        <input
                          type="checkbox"
                          checked={it.people.includes(p)}
                          onChange={() => togglePerson(it.id, p)}
                        />{" "}
                        {p}
                      </label>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {items.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <button onClick={calculateSplits}>Calculate Split</button>
        </div>
      )}

      {result && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Split Results</h3>
          <ul>
            {Object.entries(result).map(([p, amt]) => (
              <li key={p}>
                {p}: ${amt.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
