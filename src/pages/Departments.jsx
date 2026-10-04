import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Icon from '../components/Icon';
import Modal, { ConfirmDialog } from '../components/Modal';

const empty = { departmentId: 0, departmentName: '', description: '', status: true };

export default function Departments() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [counts, setCounts] = useState({});        // departmentId -> employee count
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);           // null = modal closed
  const [formError, setFormError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = () =>
    Promise.all([api.get('/departments'), api.get('/dashboard/departments')])
      .then(([d, c]) => {
        setList(d.data);
        setCounts(Object.fromEntries(c.data.map((x) => [x.departmentId, x.employeeCount])));
      })
      .catch((err) => toast(errMsg(err), 'error'))
      .finally(() => setLoading(false));

  useEffect(() => {
    Promise.all([api.get('/departments'), api.get('/dashboard/departments')])
      .then(([d, c]) => {
        setList(d.data);
        setCounts(Object.fromEntries(c.data.map((x) => [x.departmentId, x.employeeCount])));
      })
      .catch((err) => toast(errMsg(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  const openForm = (d = empty) => {
    setFormError('');
    setForm({ ...d, description: d.description || '' });
  };

  const save = async (e) => {
    e.preventDefault();
    setFormError('');
    const payload = { departmentName: form.departmentName, description: form.description, status: form.status };
    try {
      const { data } = form.departmentId
        ? await api.put(`/departments/${form.departmentId}`, payload)
        : await api.post('/departments', payload);
      toast(data?.message || 'Saved');
      setForm(null);
      fetchData();
    } catch (err) {
      setFormError(errMsg(err));
    }
  };

  const confirmDelete = async () => {
    const d = toDelete;
    setToDelete(null);
    try {
      const { data } = await api.delete(`/departments/${d.departmentId}`);
      toast(data?.message || 'Deleted');
      fetchData();
    } catch (err) {
      toast(errMsg(err), 'error');
    }
  };

  const q = search.trim().toLowerCase();
  const shown = list.filter((d) =>
    (statusFilter === 'all' || (statusFilter === 'active' ? d.status : !d.status)) &&
    (!q || d.departmentName.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)));

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Departments</h2>
          <p>{list.length} departments · {list.filter((d) => d.status).length} active</p>
        </div>
        {isAdmin && <button onClick={() => openForm()}><Icon name="plus" /> Add Department</button>}
      </div>

      {!isAdmin && <div className="readonly-note"><Icon name="lock" /> Read-only access — only Admin can add, edit or delete.</div>}

      <div className="panel">
        <div className="toolbar">
          <div className="search">
            <Icon name="search" />
            <input placeholder="Search departments..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
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
              <tr><th>#</th><th>Department</th><th>Description</th><th>Employees</th><th>Status</th>{isAdmin && <th className="right">Actions</th>}</tr>
            </thead>
            <tbody>
              {loading && <tr><td className="empty" colSpan={6}><span className="spinner dark" /> Loading...</td></tr>}
              {!loading && shown.length === 0 && <tr><td className="empty" colSpan={6}>No departments found.</td></tr>}
              {shown.map((d) => (
                <tr key={d.departmentId}>
                  <td className="muted">{d.departmentId}</td>
                  <td>
                    <div className="cell-main">
                      <span className="tile-icon"><Icon name="building" size={16} /></span>
                      <strong>{d.departmentName}</strong>
                    </div>
                  </td>
                  <td className="muted wrap">{d.description || '—'}</td>
                  <td>{counts[d.departmentId] ?? 0}</td>
                  <td><span className={`badge ${d.status ? 'on' : 'off'}`}>{d.status ? 'Active' : 'Inactive'}</span></td>
                  {isAdmin && (
                    <td className="right">
                      <div className="actions">
                        <button className="icon-btn" title="Edit" onClick={() => openForm(d)}><Icon name="edit" size={16} /></button>
                        <button className="icon-btn danger" title="Delete" onClick={() => setToDelete(d)}><Icon name="trash" size={16} /></button>
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
        <Modal title={form.departmentId ? 'Edit Department' : 'Add Department'} onClose={() => setForm(null)} width={520}>
          <form onSubmit={save}>
            <div className="modal-body">
              {formError && <div className="alert error"><Icon name="alert" /> {formError}</div>}
              <label>Department Name *</label>
              <input value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })} placeholder="e.g. Human Resources" autoFocus required />
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
              <label>Status</label>
              <select value={String(form.status)} onChange={(e) => setForm({ ...form, status: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="modal-foot">
              <button type="button" className="secondary" onClick={() => setForm(null)}>Cancel</button>
              <button type="submit">{form.departmentId ? 'Save changes' : 'Add Department'}</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete department"
          message={<>Permanently delete <strong>{toDelete.departmentName}</strong>? This cannot be undone.</>}
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
}
