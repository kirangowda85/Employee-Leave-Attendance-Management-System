import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CalendarDays } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useAuth } from '../contexts/AuthContext';

const API = 'http://localhost:8080';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', description: '' });
  const { addToast } = useToast();
  const { openConfirm } = useConfirm();
  const { token } = useAuth();
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchHolidays(); }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/holiday`, { headers });
      if (r.ok) { const d = await r.json(); setHolidays(Array.isArray(d) ? d : []); }
    } catch { addToast('Error loading holidays.', 'error'); }
    setLoading(false);
  };

  const addHoliday = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/admin/holiday/add`, { method: 'POST', headers, body: JSON.stringify(form) });
      if (r.ok) { addToast('Holiday added!', 'success'); setForm({ name: '', date: '', description: '' }); setShowForm(false); fetchHolidays(); }
      else { const d = await r.json(); addToast(d.message || 'Failed to add holiday.', 'error'); }
    } catch { addToast('Error adding holiday.', 'error'); }
  };

  const deleteHoliday = async (id) => {
    const ok = await openConfirm('Are you sure you want to delete this holiday?');
    if (!ok) return;
    try {
      const r = await fetch(`${API}/admin/holiday/${id}`, { method: 'DELETE', headers });
      if (r.ok) { addToast('Holiday deleted.', 'success'); fetchHolidays(); }
      else addToast('Failed to delete holiday.', 'error');
    } catch { addToast('Error deleting holiday.', 'error'); }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2>Holiday Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'Add Holiday'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', maxWidth: 560 }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Add New Holiday</h3>
          <form onSubmit={addHoliday}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Holiday Name</label>
                <input className="input-field" placeholder="e.g. Diwali" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
              </div>
            </div>
            <div className="input-group">
              <label>Description (optional)</label>
              <input className="input-field" placeholder="Description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary"><Plus size={18} /> Add Holiday</button>
          </form>
        </div>
      )}

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Company Holidays ({holidays.length})</h3>
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div> : holidays.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>#</th><th>Holiday Name</th><th>Date</th><th>Day</th><th>Description</th><th>Action</th></tr></thead>
              <tbody>
                {holidays.map((h, i) => {
                  const d = h.date ? new Date(h.date) : null;
                  const day = d ? d.toLocaleDateString('en-US', { weekday: 'long' }) : '-';
                  return (
                    <tr key={h.id || i}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 500 }}>{h.name || h.holidayName}</td>
                      <td>{h.date}</td>
                      <td><span className="badge badge-warning">{day}</span></td>
                      <td>{h.description || '-'}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" style={{ padding: '0.3rem 0.7rem' }} onClick={() => deleteHoliday(h.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <CalendarDays size={48} style={{ color: 'var(--text-secondary)', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-secondary)' }}>No holidays added yet. Click "Add Holiday" to start.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Holidays;
