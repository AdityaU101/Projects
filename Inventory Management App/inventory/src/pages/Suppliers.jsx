import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export default function Suppliers() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const q = query(collection(db, 'suppliers'), orderBy('name'));
    const res = await getDocs(q);
    setRows(res.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function submit(e) {
    e.preventDefault();
    const data = { ...form, updatedAt: serverTimestamp() };
    if (editing) await updateDoc(doc(db, 'suppliers', editing), data);
    else await addDoc(collection(db, 'suppliers'), { ...data, createdAt: serverTimestamp() });
    setForm({ name: '', email: '', phone: '', address: '' }); setEditing(null); load();
  }

  return (
    <div>
      <h2>Suppliers</h2>
      <table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td><td>{r.email}</td><td>{r.phone}</td><td>{r.address}</td>
              <td>
                <button onClick={() => { setEditing(r.id); setForm({ name: r.name || '', email: r.email || '', phone: r.phone || '', address: r.address || '' }); }}>Edit</button>
                <button className="danger" onClick={() => deleteDoc(doc(db, 'suppliers', r.id)).then(load)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{editing ? 'Edit Supplier' : 'Add Supplier'}</h3>
      <form className="form" onSubmit={submit}>
        <div className="grid">
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Address<input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
        </div>
        <div className="actions">
          <button className="primary" type="submit">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', email: '', phone: '', address: '' }); }}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
