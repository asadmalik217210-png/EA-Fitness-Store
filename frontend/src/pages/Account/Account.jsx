import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSeo } from '../../hooks/useSeo';

export default function Account() {
  useSeo({ title: 'Account' });
  const { user, logout } = useAuth();
  return (
    <main className="page">
      <div className="container content-page">
        <h1>Account</h1>
        <p>{user.firstName} {user.lastName}<br />{user.email}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
          <Link className="btn btn-dark" to="/orders">My orders</Link>
          <Link className="btn btn-outline" to="/wishlist">Wishlist</Link>
          <Link className="btn btn-outline" to="/track-order">Track order</Link>
          {user.role === 'admin' && <Link className="btn btn-outline" to="/admin">Admin</Link>}
          <button className="btn btn-outline" type="button" onClick={logout}>Log out</button>
        </div>
      </div>
    </main>
  );
}
