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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 👥 Add people
  function addPerson() {
    if (person && !people.includes(person)) {
      setPeople([...people, person]);
      setPerson("");
    }
  }

  // ❌ Remove a person
  function deletePerson(p: string) {
    // Remove the person and also remove them from any items they were assigned to
    setPeople((prev) => prev.filter((name) => name !== p));
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        people: it.people.filter((name) => name !== p),
      }))
    );
  }

  // 🛒 Add item manually
  function addItem() {
    if (!name || !price) return;
    setItems([
      ...items,
      { id: Date.now(), name, price: Number(price), people: [] },
    ]);
    setName("");
    setPrice("");
  }

  // ✅ Toggle which people used each item
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

  // 🗑 Delete an item
  function deleteItem(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  // 🧹 Clear all items (with confirmation)
  function clearAllItems() {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all items? This cannot be undone."
    );
    if (confirmClear) {
      setItems([]);
      setResult(null);
    }
  }

  // 💰 Calculate totals
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

  // 📸 Handle receipt upload → backend
  async function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5001/scan-receipt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      const scannedItems: Item[] = (data.items || []).map(
        (it: { name: string; price: number }) => ({
          id: Date.now() + Math.random(),
          name: it.name,
          price: it.price,
          people: [],
        })
      );

      setItems((prev) => [...prev, ...scannedItems]);
    } catch (err: any) {
      console.error(err);
      setError("Failed to scan receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ✏️ Edit item price or name manually
  function editItem(id: number, field: "name" | "price", value: string) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, [field]: field === "price" ? Number(value) : value } : it
      )
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1>FairShare</h1>
        <p className="subtitle">Sharing is Caring 💸</p>
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
              <button className="small-delete" onClick={() => deletePerson(p)}>
                ✕
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* Items Section */}
      <section className="card">
        <div className="section-header">
          <h2>🛒 Items</h2>
          {items.length > 0 && (
            <button className="clear-btn" onClick={clearAllItems}>
              🧹 Clear All
            </button>
          )}
        </div>

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

        {/* 📸 Receipt Upload Section */}
        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-btn">
            {loading ? "⏳ Scanning..." : "📷 Upload Receipt"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleReceiptUpload}
            className="hidden-input"
            disabled={loading}
          />

          {error && <p className="error-text">❌ {error}</p>}
          {!error && !loading && items.length > 0 && (
            <p className="success-text">✅ Receipt scanned successfully</p>
          )}
        </div>

        {items.length === 0 && (
          <p className="hint">Add items manually or upload a receipt to start splitting.</p>
        )}

        {items.length > 0 && (
          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>🛍️ Item</th>
                  <th>💵 Price</th>
                  <th>👥 Who used it?</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="item-cell">
                      <input
                        type="text"
                        value={it.name}
                        onChange={(e) => editItem(it.id, "name", e.target.value)}
                        className="editable-input"
                      />
                    </td>
                    <td className="price-cell">
                      <input
                        type="number"
                        value={it.price}
                        onChange={(e) => editItem(it.id, "price", e.target.value)}
                        className="editable-input"
                      />
                    </td>
                    <td className="people-cell">
                      <div className="chip-container">
                        {people.map((p) => (
                          <label key={p} className="checkbox-chip">
                            <input
                              type="checkbox"
                              checked={it.people.includes(p)}
                              onChange={() => togglePerson(it.id, p)}
                            />
                            <span>{p}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="delete-cell">
                      <button className="delete-btn" onClick={() => deleteItem(it.id)}>
                        ✕
                      </button>
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

          {/* 📊 Summary Insights */}
          <div className="insights-card">
            <h4>📈 Summary Insights</h4>
            {(() => {
              const total = Object.values(result).reduce((a, b) => a + b, 0);
              const entries = Object.entries(result);
              const avg = total / entries.length;
              const highest = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
              const lowest = entries.reduce((a, b) => (b[1] < a[1] ? b : a));

              return (
                <ul className="insights-list">
                  <li>
                    <strong>💰 Highest spender:</strong> {highest[0]} (${highest[1].toFixed(2)})
                  </li>
                  <li>
                    <strong>🪙 Lowest spender:</strong> {lowest[0]} (${lowest[1].toFixed(2)})
                  </li>
                  <li>
                    <strong>📊 Average cost per person:</strong> ${avg.toFixed(2)}
                  </li>
                  <li>
                    <strong>🧾 Total items:</strong> {items.length}
                  </li>
                  <li>
                    <strong>💵 Total cost:</strong> ${total.toFixed(2)}
                  </li>
                </ul>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
