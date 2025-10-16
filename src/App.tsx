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
    setItems([
      ...items,
      { id: Date.now(), name, price: Number(price), people: [] },
    ]);
    setName("");
    setPrice("");
  }

  function togglePerson(itemId: number, p: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              people: it.people.includes(p)
                ? it.people.filter((x) => x !== p)
                : [...it.people, p],
            }
          : it
      )
    );
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
      <header className="header">
        <h1>FairShare</h1>
        <p className="subtitle">Split bills fairly and beautifully 💸</p>
      </header>

      {/* People Section */}
      <section className="card">
        <h2>👥 People</h2>
        <div className="input-row">
          <input
            placeholder="Add a person's name"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
          />
          <button onClick={addPerson}>Add</button>
        </div>
        <div className="pill-group">
          {people.length === 0 && (
            <p className="hint">Add people who will share the costs.</p>
          )}
          {people.map((p) => (
            <span key={p} className="person-pill">
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Items Section */}
      <section className="card">
        <h2>🛒 Items</h2>
        <div className="input-row">
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

        {items.length === 0 && (
          <p className="hint">Add some items to start splitting.</p>
        )}

        {items.length > 0 && (
          <div className="table-wrapper">
            <table className="styled-table">
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
                        <label key={p} className="checkbox-chip">
                          <input
                            type="checkbox"
                            checked={it.people.includes(p)}
                            onChange={() => togglePerson(it.id, p)}
                          />
                          {p}
                        </label>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Calculate Split */}
      {items.length > 0 && (
        <div className="center">
          <button className="big-btn" onClick={calculateSplits}>
            💰 Calculate Split
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="results-card">
          <h3>💵 Split Results</h3>
          <ul className="result-list">
            {Object.entries(result).map(([p, amt]) => (
              <li key={p} className="result-item">
                <span className="result-name">{p}</span>
                <span className="result-amount">${amt.toFixed(2)}</span>
              </li>
            ))}
            <li className="result-item total-line">
              <span className="result-name">Total</span>
              <span className="result-amount">
                $
                {Object.values(result)
                  .reduce((a, b) => a + b, 0)
                  .toFixed(2)}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
