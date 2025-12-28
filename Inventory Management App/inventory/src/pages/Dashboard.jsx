import { collection, getCountFromServer, query, where, orderBy, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase.js';

export default function Dashboard() {
  const [counts, setCounts] = useState({ items: 0, lowStock: 0, suppliers: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    async function load() {
      const itemsCol = collection(db, 'items');
      const suppliersCol = collection(db, 'suppliers');
      const lowStockQ = query(itemsCol, where('currentStock', '<=', 0));

      const [itemsSnap, lowSnap, suppSnap] = await Promise.all([
        getCountFromServer(itemsCol),
        getCountFromServer(lowStockQ),
        getCountFromServer(suppliersCol),
      ]);

      setCounts({
        items: itemsSnap.data().count,
        lowStock: lowSnap.data().count,
        suppliers: suppSnap.data().count,
      });

      const txQuery = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(5));
      const res = await (await import('firebase/firestore')).getDocs(txQuery);
      setRecent(res.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="kpis">
        <div className="kpi"><div className="kpi-label">Items</div><div className="kpi-value">{counts.items}</div></div>
        <div className="kpi"><div className="kpi-label">Low Stock</div><div className="kpi-value warn">{counts.lowStock}</div></div>
        <div className="kpi"><div className="kpi-label">Suppliers</div><div className="kpi-value">{counts.suppliers}</div></div>
      </div>

      <h3>Recent Transactions</h3>
      <table className="table">
        <thead>
          <tr><th>Item</th><th>Type</th><th>Qty</th><th>Date</th></tr>
        </thead>
        <tbody>
          {recent.map((t) => (
            <tr key={t.id}>
              <td>{t.itemName || t.itemId}</td>
              <td>{t.type}</td>
              <td>{t.quantity}</td>
              <td>{t.createdAt?.toDate ? t.createdAt.toDate().toLocaleString() : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
