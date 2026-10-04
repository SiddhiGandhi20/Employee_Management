import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';

const links = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/departments', label: 'Departments', icon: 'building' },
  { to: '/employees', label: 'Employees', icon: 'users' },
  { to: '/reports', label: 'Report', icon: 'report' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo"><Icon name="users" size={18} /></span>
          <div>EmpManager<small>Employee Management</small></div>
        </div>

        <nav>
          <div className="nav-title">Menu</div>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              <Icon name={l.icon} /> {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <span className="avatar">{user.username.charAt(0)}</span>
            <div className="user-info">
              <strong>{user.username}</strong>
              <span className={`role ${user.role === 'Admin' ? 'admin' : ''}`}>{user.role}</span>
            </div>
          </div>
          <button className="logout" onClick={handleLogout} title="Logout"><Icon name="logout" /> Logout</button>
        </div>
      </aside>

      <main className="main"><Outlet /></main>
    </div>
  );
}
