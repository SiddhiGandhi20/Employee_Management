import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import Icon from '../components/Icon';

// API returns a flat list -> group it by department here
const groupByDepartment = (rows) => {
  const map = new Map();
  rows.forEach((r) => {
    if (!map.has(r.departmentId)) {
      map.set(r.departmentId, { departmentId: r.departmentId, departmentName: r.departmentName, employees: [] });
    }
    map.get(r.departmentId).employees.push(r);
  });
  return [...map.values()].sort((a, b) => a.departmentName.localeCompare(b.departmentName));
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Reports() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/report/employees')
      .then((r) => setGroups(groupByDepartment(r.data)))
      .catch((err) => setError(errMsg(err)))
      .finally(() => setLoading(false));
  }, []);

  const all = groups.flatMap((g) => g.employees);
  const active = all.filter((e) => e.status).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Employee Report</h2>
          <p>Department-wise list of all employees · generated {fmtDate(new Date())}</p>
        </div>
        <button className="no-print" onClick={() => window.print()}><Icon name="print" /> Print report</button>
      </div>

      <div className="summary-strip">
        <div><span>Departments</span><strong>{groups.length}</strong></div>
        <div><span>Employees</span><strong>{all.length}</strong></div>
        <div><span>Active</span><strong>{active}</strong></div>
        <div><span>Inactive</span><strong>{all.length - active}</strong></div>
      </div>

      {loading && <div className="page-loading"><span className="spinner dark" /> Loading report...</div>}
      {error && <div className="alert error"><Icon name="alert" /> {error}</div>}
      {!loading && !error && groups.length === 0 && <div className="panel muted">No employees to report yet.</div>}

      {groups.map((g) => (
        <div className="panel report-section" key={g.departmentId}>
          <div className="panel-head">
            <div className="cell-main">
              <span className="tile-icon"><Icon name="building" size={16} /></span>
              <h3>{g.departmentName}</h3>
            </div>
            <span className="pill">{g.employees.length} employee{g.employees.length === 1 ? '' : 's'}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Code</th><th>Name</th><th>Designation</th><th>Email</th><th>Mobile</th><th>Joined</th><th>Status</th></tr>
              </thead>
              <tbody>
                {g.employees.map((e) => (
                  <tr key={e.employeeId}>
                    <td><span className="code">{e.employeeCode}</span></td><td><strong>{e.employeeName}</strong></td>
                    <td>{e.designation}</td><td className="muted">{e.email}</td><td>{e.mobileNo}</td>
                    <td className="muted">{fmtDate(e.joiningDate)}</td>
                    <td><span className={`badge ${e.status ? 'on' : 'off'}`}>{e.status ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}
