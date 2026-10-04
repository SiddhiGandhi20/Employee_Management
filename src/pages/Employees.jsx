import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Icon from '../components/Icon';
import Modal, { ConfirmDialog } from '../components/Modal';

const empty = {
  employeeId: 0, employeeCode: '', employeeName: '', departmentId: '',
  designation: '', email: '', mobileNo: '', joiningDate: '', status: true,
};

const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Employees() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);           // null = modal closed
  const [formError, setFormError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('');

  const fetchData = () =>
    Promise.all([api.get('/employee'), api.get('/departments')])
      .then(([e, d]) => {
        setList(e.data);
        setDepartments(d.data);
      })
      .catch((err) => toast(errMsg(err), 'error'))
      .finally(() => setLoading(false));

  useEffect(() => {
    Promise.all([api.get('/employee'), api.get('/departments')])
      .then(([e, d]) => {
        setList(e.data);
        setDepartments(d.data);
      })
      .catch((err) => toast(errMsg(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openForm = (emp) => {
    setFormError('');
    setForm(emp ? { ...emp, joiningDate: emp.joiningDate.slice(0, 10) } : empty);
  };

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!/^[0-9+\-\s]{7,15}$/.test(form.mobileNo)) return setFormError('Enter a valid mobile number.');
    const payload = {
      employeeCode: form.employeeCode,
      employeeName: form.employeeName,
      departmentId: Number(form.departmentId),
      designation: form.designation,
      email: form.email,
      mobileNo: form.mobileNo,
      joiningDate: form.joiningDate,
      status: form.status,
    };
    try {
      const { data } = form.employeeId
        ? await api.put(`/employee/${form.employeeId}`, payload)
        : await api.post('/employee', payload);
      toast(data?.message || 'Saved');
      setForm(null);
      fetchData();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const confirmDelete = async () => {
    const emp = toDelete;
    setToDelete(null);
    try {
      const { data } = await api.delete(`/employee/${emp.employeeId}`);
      toast(data?.message || 'Deleted');
      fetchData();
    } catch (err) {
      toast(errMsg(err), 'error');
    }
  };

  // active departments in the dropdown, plus the current one when editing
  const deptOptions = form
    ? departments.filter((d) => d.status || d.departmentId === Number(form.departmentId))
    : [];

  const q = search.trim().toLowerCase();
  const shown = list.filter((e) =>
    (statusFilter === 'all' || (statusFilter === 'active' ? e.status : !e.status)) &&
    (!deptFilter || e.departmentId === Number(deptFilter)) &&
    (!q || [e.employeeCode, e.employeeName, e.departmentName, e.designation, e.email, e.mobileNo]
      .some((v) => v?.toLowerCase().includes(q))));

  const activeCount = list.filter((e) => e.status).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Employees</h2>
          <p>{list.length} employees · {activeCount} active · {list.length - activeCount} inactive</p>
        </div>
        {isAdmin && <button onClick={() => openForm()}><Icon name="plus" /> Add Employee</button>}
      </div>

      {!isAdmin && <div className="readonly-note"><Icon name="lock" /> Read-only access — only Admin can add, edit or delete.</div>}

      <div className="panel">
        <div className="toolbar">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search name, code, email, mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="count">Showing {shown.length} of {list.length}</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Code</th><th>Department</th><th>Designation</th>
                <th>Mobile</th><th>Joined</th><th>Status</th>{isAdmin && <th className="right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td className="empty" colSpan={8}><span className="spinner dark" /> Loading...</td></tr>}
              {!loading && shown.length === 0 && <tr><td className="empty" colSpan={8}>No employees found.</td></tr>}
              {shown.map((e) => (
                <tr key={e.employeeId}>
                  <td>
                    <div className="cell-main">
                      <span className="avatar sm">{initials(e.employeeName)}</span>
                      <div>
                        <strong>{e.employeeName}</strong>
                        <div className="muted small">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="code">{e.employeeCode}</span></td>
                  <td>{e.departmentName}</td>
                  <td>{e.designation}</td>
                  <td>{e.mobileNo}</td>
                  <td className="muted">{fmtDate(e.joiningDate)}</td>
                  <td><span className={`badge ${e.status ? 'on' : 'off'}`}>{e.status ? 'Active' : 'Inactive'}</span></td>
                  {isAdmin && (
                    <td className="right">
                      <div className="actions">
                        <button className="icon-btn" title="Edit" onClick={() => openForm(e)}><Icon name="edit" size={16} /></button>
                        <button className="icon-btn danger" title="Delete" onClick={() => setToDelete(e)}><Icon name="trash" size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal title={form.employeeId ? `Edit Employee — ${form.employeeCode}` : 'Add Employee'} onClose={() => setForm(null)} width={720}>
          <form onSubmit={save}>
            <div className="modal-body">
              {formError && <div className="alert error"><Icon name="alert" /> {formError}</div>}
              <div className="form-grid">
                <div><label>Employee Code *</label><input value={form.employeeCode} onChange={set('employeeCode')} placeholder="e.g. EMP001" autoFocus required /></div>
                <div><label>Employee Name *</label><input value={form.employeeName} onChange={set('employeeName')} placeholder="Full name" required /></div>
                <div>
                  <label>Department *</label>
                  <select value={form.departmentId} onChange={set('departmentId')} required>
                    <option value="">-- Select department --</option>
                    {deptOptions.map((d) => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                  </select>
                </div>
                <div><label>Designation *</label><input value={form.designation || ''} onChange={set('designation')} placeholder="e.g. Software Engineer" required /></div>
                <div><label>Email *</label><input type="email" value={form.email || ''} onChange={set('email')} placeholder="name@company.com" required /></div>
                <div><label>Mobile No *</label><input value={form.mobileNo || ''} onChange={set('mobileNo')} placeholder="10-digit number" required /></div>
                <div><label>Joining Date *</label><input type="date" value={form.joiningDate} onChange={set('joiningDate')} required /></div>
                <div>
                  <label>Status</label>
                  <select value={String(form.status)} onChange={(e) => setForm({ ...form, status: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="secondary" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit">{form.employeeId ? 'Save changes' : 'Add Employee'}</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete employee"
          message={<>Permanently delete <strong>{toDelete.employeeName}</strong> ({toDelete.employeeCode})? This cannot be undone.</>}
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}
