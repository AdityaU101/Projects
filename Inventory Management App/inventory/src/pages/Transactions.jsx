import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

export default function Transactions() {
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ itemId: '', type: 'in', quantity: 1, unitCost: 0, note: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const itemsRes = await getDocs(query(collection(db, 'items'), orderBy('name')));
    setItems(itemsRes.docs.map((d) => ({ id: d.id, ...d.data() })));

    const txRes = await getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')));
    setRows(txRes.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.itemId) return;
    const itemDoc = await getDoc(doc(db, 'items', form.itemId));
    const item = itemDoc.data();

    const tx = {
      itemId: form.itemId,
      itemName: item?.name || '',
      type: form.type,
      quantity: Number(form.quantity || 0),
      unitCost: form.type === 'in' ? Number(form.unitCost || 0) : undefined,
      note: form.note || '',
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'transactions'), tx);

    setForm({ itemId: '', type: 'in', quantity: 1, unitCost: 0, note: '' });
    await load();
  }

  return (
    <div>
      <h2>Stock In/Out</h2>
      <form className="form" onSubmit={submit}>
        <div className="grid">
          <label>Item<select value={form.itemId} onChange={(e) => setForm({ ...form, itemId: e.target.value })} required>
            <option value="">Select item</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select></label>
          <label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="in">IN</option>
            <option value="out">OUT</option>
          </select></label>
          <label>Quantity<input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></label>
          {form.type === 'in' && (
            <label>Unit Cost<input type="number" min="0" step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} /></label>
          )}
          <label>Note<input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>
        </div>
        <div className="actions"><button className="primary" type="submit">Record</button></div>
      </form>

      <h3>Transactions</h3>
      <table className="table">
        <thead><tr><th>Item</th><th>Type</th><th>Qty</th><th>Unit Cost</th><th>Note</th><th>Date</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.itemName || r.itemId}</td>
              <td>{r.type}</td>
              <td>{r.quantity}</td>
              <td>{r.unitCost ?? '-'}</td>
              <td>{r.note}</td>
              <td>{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
