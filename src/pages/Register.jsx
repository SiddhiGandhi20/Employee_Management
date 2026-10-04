import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import AuthShell from '../components/AuthShell';
import Icon from '../components/Icon';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'User' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setBusy(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="It only takes a minute.">
      {error && <div className="alert error"><Icon name="alert" /> {error}</div>}
      <form onSubmit={submit}>
        <label>Username</label>
        <input value={form.username} onChange={set('username')} placeholder="At least 3 characters" minLength={3} autoFocus required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={set('email')} placeholder="name@company.com" required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={set('password')} placeholder="At least 6 characters" required />
        <label>Role</label>
        <select value={form.role} onChange={set('role')}>
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        <button type="submit" className="block" disabled={busy}>{busy ? <span className="spinner" /> : null}{busy ? 'Creating account...' : 'Create account'}</button>
      </form>
      <p className="switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthShell>
  );
}
