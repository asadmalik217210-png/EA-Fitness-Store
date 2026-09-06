import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useSeo } from '../../hooks/useSeo';

export function ForgotPassword() {
  useSeo({ title: 'Forgot password' });
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  async function onSubmit(e) {
    e.preventDefault();
    const data = await api('/auth/forgot-password', { method: 'POST', body: { email } });
    setMsg(data.devResetUrl ? `Dev reset link: ${data.devResetUrl}` : data.message);
  }
  return (
    <main className="page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Forgot password</h1>
        {msg && <div className="alert alert-ok">{msg}</div>}
        <div className="field"><label>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <button className="btn btn-dark btn-full">Send reset link</button>
      </form>
    </main>
  );
}

export function ResetPassword() {
  useSeo({ title: 'Reset password' });
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  async function onSubmit(e) {
    e.preventDefault();
    await api(`/auth/reset-password/${token}`, { method: 'POST', body: { password } });
    setMsg('Password updated. You can now shop while logged in.');
  }
  return (
    <main className="page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Reset password</h1>
        {msg && <div className="alert alert-ok">{msg}</div>}
        <div className="field"><label>New password</label><input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn btn-dark btn-full">Update password</button>
      </form>
    </main>
  );
}
