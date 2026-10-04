import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import Icon from '../components/Icon';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token);
      navigate('/');
    } catch (err) {
      setError(err.response ? errMsg(err) : err.message || errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back 👋" subtitle="Sign in to continue to your dashboard.">
      {location.state?.registered && <div className="alert success"><Icon name="check" /> Account created. Please sign in.</div>}
      {error && <div className="alert error"><Icon name="alert" /> {error}</div>}
      <form onSubmit={submit}>
        <label>Username</label>
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Enter your username" autoFocus required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" required />
        <button type="submit" className="block" disabled={busy}>{busy ? <span className="spinner" /> : null}{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <p className="switch">Don&apos;t have an account? <Link to="/register">Create one</Link></p>
    </AuthShell>
  );
}
