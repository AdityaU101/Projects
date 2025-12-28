import { useEffect, useState } from 'react';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, observeAuth } from '../firebase.js';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('staff');

  useEffect(() => {
    const unsub = observeAuth(async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, 'users', u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setRole(snap.data().role || 'staff');
        else await setDoc(ref, { role: 'admin', email: u.email, displayName: u.displayName, createdAt: serverTimestamp() });
      }
    });
    return () => unsub();
  }, []);

  async function save() {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), { role }, { merge: true });
    alert('Saved');
  }

  return (
    <div>
      <h2>Settings</h2>
      <p>User: {user?.email}</p>
      <label>Role
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </label>
      <div className="actions"><button className="primary" onClick={save}>Save</button></div>
    </div>
  );
}
