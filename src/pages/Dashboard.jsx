import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [deptSummary, setDeptSummary] = useState([]);
  const [selected, setSelected] = useState(null);   // 'total' | 'active' | 'inactive' | 'departments' | dept id
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/dashboard/summary'), api.get('/dashboard/departments')])
      .then(([s, d]) => {
        setSummary(s.data);
        setDeptSummary(d.data);
      })
      .catch((err) => setError(errMsg(err)));
  }, []);

  // clicking a card / bar loads the detail list below
  const drill = async (key) => {
    setSelected(key);
    setError('');
    setLoadingRows(true);
    try {
      if (key === 'departments') {
        const { data } = await api.get('/departments');
        setRows(data);
      } else if (typeof key === 'number') {
        const { data } = await api.get(`/employee/department/${key}`);
        setRows(data);
      } else {
        const { data } = await api.get('/employee');
        setRows(key === 'active' ? data.filter((e) => e.status)
          : key === 'inactive' ? data.filter((e) => !e.status)
          : data);
      }
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoadingRows(false);
    }
  };

  if (error && !summary) return <div className="alert error"><Icon name="alert" /> {error}</div>;
  if (!summary) return <div className="page-loading"><span className="spinner dark" /> Loading dashboard...</div>;

  const cards = [
    { key: 'total', label: 'Total Employees', value: summary.totalEmployees, icon: 'users', color: 'c-indigo' },
    { key: 'active', label: 'Active Employees', value: summary.activeEmployees, icon: 'check', color: 'c-green' },
    { key: 'inactive', label: 'Inactive Employees', value: summary.inactiveEmployees, icon: 'pause', color: 'c-slate' },
    { key: 'departments', label: 'Total Departments', value: summary.totalDepartments, icon: 'building', color: 'c-amber' },
  ];

  const pct = (n) => (summary.totalEmployees ? Math.round((n / summary.totalEmployees) * 100) : 0);
  const maxCount = Math.max(1, ...deptSummary.map((d) => d.employeeCount));

  const title =
    selected === 'departments' ? 'All Departments'
      : typeof selected === 'number' ? `Employees in ${deptSummary.find((d) => d.departmentId === selected)?.departmentName}`
      : cards.find((c) => c.key === selected)?.label;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{greeting()}, {user.username}</h2>
          <p>Here&apos;s what&apos;s happening in your organisation. Click any card or bar to drill down.</p>
        </div>
      </div>

      <div className="stats">
        {cards.map((c) => (
          <button key={c.key} className={`stat ${c.color} ${selected === c.key ? 'selected' : ''}`} onClick={() => drill(c.key)}>
            <div className="stat-top">
              <span className="stat-label">{c.label}</span>
              <span className="stat-icon"><Icon name={c.icon} size={20} /></span>
            </div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-foot">
              {c.key === 'active' || c.key === 'inactive' ? `${pct(c.value)}% of all employees` : 'View details →'}
            </div>
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Employees per Department</h3>
          <span className="muted small">Click a bar to see its employees</span>
        </div>
        {deptSummary.length === 0 ? (
          <p className="muted">No departments yet.</p>
        ) : (
          <div className="bar-chart" role="list">
            {deptSummary.map((d) => (
              <button
                key={d.departmentId}
                role="listitem"
                className={`bar-row ${selected === d.departmentId ? 'selected' : ''}`}
                onClick={() => drill(d.departmentId)}
              >
                <span className="bar-label">{d.departmentName}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${(d.employeeCount / maxCount) * 100}%` }} />
                  <span className="bar-tip">{d.departmentName}: {d.employeeCount} employee{d.employeeCount === 1 ? '' : 's'}</span>
                </span>
                <span className="bar-value">{d.employeeCount}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="alert error"><Icon name="alert" /> {error}</div>}

      {selected !== null && (
        <div className="panel">
          <div className="panel-head">
            <h3>{title}</h3>
            <div className="actions">
              <span className="pill">{rows.length} records</span>
              <button className="icon-btn" title="Close" onClick={() => setSelected(null)}><Icon name="x" size={16} /></button>
            </div>
          </div>

          <div className="table-wrap">
            {selected === 'departments' ? (
              <table>
                <thead><tr><th>#</th><th>Department</th><th>Description</th><th>Status</th></tr></thead>
                <tbody>
                  {loadingRows && <tr><td className="empty" colSpan={4}><span className="spinner dark" /> Loading...</td></tr>}
                  {!loadingRows && rows.length === 0 && <tr><td className="empty" colSpan={4}>No departments.</td></tr>}
                  {!loadingRows && rows.map((d) => (
                    <tr key={d.departmentId}>
                      <td className="muted">{d.departmentId}</td><td><strong>{d.departmentName}</strong></td>
                      <td className="muted wrap">{d.description || '—'}</td>
                      <td><span className={`badge ${d.status ? 'on' : 'off'}`}>{d.status ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table>
                <thead><tr><th>Code</th><th>Name</th><th>Department</th><th>Designation</th><th>Email</th><th>Status</th></tr></thead>
                <tbody>
                  {loadingRows && <tr><td className="empty" colSpan={6}><span className="spinner dark" /> Loading...</td></tr>}
                  {!loadingRows && rows.length === 0 && <tr><td className="empty" colSpan={6}>No employees.</td></tr>}
                  {!loadingRows && rows.map((e) => (
                    <tr key={e.employeeId}>
                      <td><span className="code">{e.employeeCode}</span></td><td><strong>{e.employeeName}</strong></td>
                      <td>{e.departmentName}</td><td>{e.designation}</td><td className="muted">{e.email}</td>
                      <td><span className={`badge ${e.status ? 'on' : 'off'}`}>{e.status ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
}
