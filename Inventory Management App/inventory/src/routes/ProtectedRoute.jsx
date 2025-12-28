import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { observeAuth } from '../firebase.js';

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = observeAuth((u) => setUser(u || null));
    return () => unsub();
  }, []);

  if (user === undefined) return <div className="center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
