import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSeo } from '../../hooks/useSeo';
import { getGuestId } from '../../services/api';

export function Login() {
  useSeo({ title: 'Login' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login({ ...form, guestId: getGuestId() });
      const to = location.state?.from || (user.role === 'admin' ? '/admin' : '/account');
      navigate(to);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Log in</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="field">
          <label>Password</label>
          <input type={show ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="button" className="muted" style={{ border: 0, background: 'none', textAlign: 'left' }} onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'} password</button>
        </div>
        <label><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Remember me</label>
        <button className="btn btn-dark btn-full" style={{ marginTop: 16 }} disabled={loading}>{loading ? 'Signing in…' : 'Log in'}</button>
        <p style={{ marginTop: 16 }}><Link to="/forgot-password">Forgot password</Link></p>
        <p>New here? <Link to="/signup">Create account</Link></p>
      </form>
    </main>
  );
}

export function Signup() {
  useSeo({ title: 'Create account' });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', acceptedTerms: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = form.password.length > 11 ? 'Strong' : form.password.length > 7 ? 'Good' : form.password ? 'Weak' : '';

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ ...form, guestId: getGuestId() });
      navigate('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Create account</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field"><label>First name</label><input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
        <div className="field"><label>Last name</label><input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
        <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="field"><label>Password</label><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><small>{strength}</small></div>
        <div className="field"><label>Confirm password</label><input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></div>
        <label><input type="checkbox" checked={form.acceptedTerms} onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })} /> I agree to the <Link to="/terms">Terms</Link></label>
        <button className="btn btn-dark btn-full" style={{ marginTop: 16 }} disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
        <p style={{ marginTop: 16 }}>Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  );
}
