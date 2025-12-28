import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { uploadImage } from '../services/storage.js';

export default function Items() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ name: '', sku: '', unit: 'pcs', price: 0, reorderPoint: 0, categoryId: '', supplierId: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const q = query(collection(db, 'items'), orderBy('name'));
    const res = await getDocs(q);
    setItems(res.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    return items.filter((i) => i.name?.toLowerCase().includes(f) || i.sku?.toLowerCase().includes(f));
  }, [items, filter]);

  async function onSubmit(e) {
    e.preventDefault();
    const data = { ...form, price: Number(form.price || 0), reorderPoint: Number(form.reorderPoint || 0), currentStock: Number(form.currentStock || 0), updatedAt: serverTimestamp(), createdAt: serverTimestamp() };
    if (editingId) {
      await updateDoc(doc(db, 'items', editingId), data);
    } else {
      await addDoc(collection(db, 'items'), data);
    }
    setForm({ name: '', sku: '', unit: 'pcs', price: 0, reorderPoint: 0, categoryId: '', supplierId: '' });
    setEditingId(null);
    await load();
  }

  async function onDelete(id) {
    if (!confirm('Delete item?')) return;
    await deleteDoc(doc(db, 'items', id));
    await load();
  }

  async function onImageChange(file, id) {
    if (!file) return;
    const url = await uploadImage(file, `items/${id}`);
    await updateDoc(doc(db, 'items', id), { photoUrl: url, updatedAt: serverTimestamp() });
    await load();
  }

  return (
    <div>
      <h2>Items</h2>
      <div className="toolbar">
        <input placeholder="Search by name or SKU" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Photo</th><th>Name</th><th>SKU</th><th>Unit</th><th>Price</th><th>Stock</th><th>Reorder</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((i) => (
            <tr key={i.id} className={i.currentStock <= (i.reorderPoint || 0) ? 'warn-row' : ''}>
              <td>
                <label className="upload">
                  <input type="file" accept="image/*" onChange={(e) => onImageChange(e.target.files?.[0], i.id)} />
                  {i.photoUrl ? <img src={i.photoUrl} alt="" /> : <span>Upload</span>}
                </label>
              </td>
              <td>{i.name}</td>
              <td>{i.sku}</td>
              <td>{i.unit}</td>
              <td>{i.price}</td>
              <td>{i.currentStock || 0}</td>
              <td>{i.reorderPoint || 0}</td>
              <td>
                <button onClick={() => { setForm(i); setEditingId(i.id); }}>Edit</button>
                <button className="danger" onClick={() => onDelete(i.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{editingId ? 'Edit Item' : 'Add Item'}</h3>
      <form className="form" onSubmit={onSubmit}>
        <div className="grid">
          <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></label>
          <label>Unit<input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></label>
          <label>Price<input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <label>Reorder Point<input type="number" value={form.reorderPoint} onChange={(e) => setForm({ ...form, reorderPoint: e.target.value })} /></label>
          <label>Category ID<input value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} /></label>
          <label>Supplier ID<input value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} /></label>
        </div>
        <div className="actions">
          <button className="primary" type="submit">{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" onClick={() => { setForm({ name: '', sku: '', unit: 'pcs', price: 0, reorderPoint: 0, categoryId: '', supplierId: '' }); setEditingId(null); }}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
