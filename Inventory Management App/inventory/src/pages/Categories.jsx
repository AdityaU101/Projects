import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export default function Categories() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const q = query(collection(db, 'categories'), orderBy('name'));
    const res = await getDocs(q);
    setRows(res.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function submit(e) {
    e.preventDefault();
    if (editing) await updateDoc(doc(db, 'categories', editing), { name, updatedAt: serverTimestamp() });
    else await addDoc(collection(db, 'categories'), { name, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    setName(''); setEditing(null); load();
  }

  return (
    <div>
      <h2>Categories</h2>
      <ul className="list">
        {rows.map((r) => (
          <li key={r.id}>
            <span>{r.name}</span>
            <span>
              <button onClick={() => { setEditing(r.id); setName(r.name); }}>Edit</button>
              <button className="danger" onClick={() => deleteDoc(doc(db, 'categories', r.id)).then(load)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>

      <form className="form" onSubmit={submit}>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <div className="actions">
          <button className="primary" type="submit">{editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setName(''); }}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
