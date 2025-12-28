import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { observeAuth, logout } from '../firebase.js';

export default function Navbar() {
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = observeAuth((u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <nav className="navbar">
      <div className="brand">Inventory</div>
      <div className="links">
        {user && (
          <>
            <NavLink to="/" current={pathname === '/'}>Dashboard</NavLink>
            <NavLink to="/items" current={pathname.startsWith('/items')}>Items</NavLink>
            <NavLink to="/categories" current={pathname.startsWith('/categories')}>Categories</NavLink>
            <NavLink to="/suppliers" current={pathname.startsWith('/suppliers')}>Suppliers</NavLink>
            <NavLink to="/transactions" current={pathname.startsWith('/transactions')}>Transactions</NavLink>
            <NavLink to="/settings" current={pathname.startsWith('/settings')}>Settings</NavLink>
          </>
        )}
      </div>
      <div className="auth">
        {user ? (
          <>
            <img className="avatar" src={user.photoURL || ''} alt="" />
            <span className="name">{user.displayName || user.email}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, children, current }) {
  return (
    <Link className={current ? 'navlink active' : 'navlink'} to={to}>
      {children}
    </Link>
  );
}
