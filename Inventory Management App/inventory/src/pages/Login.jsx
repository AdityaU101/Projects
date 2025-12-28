import { googleSignIn, observeAuth } from '../firebase.js';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    const unsub = observeAuth((u) => {
      if (u) navigate('/', { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  return (
    <div className="center">
      <h1>Inventory</h1>
      <p>Please sign in to continue</p>
      <button className="primary" onClick={googleSignIn}>Sign in with Google</button>
    </div>
  );
}
