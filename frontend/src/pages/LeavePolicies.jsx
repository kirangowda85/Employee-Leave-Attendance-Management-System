import React, { useState, useEffect } from 'react';
import { Plus, Settings } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const API = 'http://localhost:8080';

const LeavePolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: 'ANNUAL', totalDays: '', carryForward: false, description: '' });
  const { addToast } = useToast();
  const { token } = useAuth();
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetchPolicies(); }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/leave-policies`, { headers });
      if (r.ok) { const d = await r.json(); setPolicies(Array.isArray(d) ? d : []); }
    } catch { addToast('Error loading policies.', 'error'); }
    setLoading(false);
  };

  const addPolicy = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/api/leave-policies`, {
        method: 'POST', headers, body: JSON.stringify({ ...form, totalDays: parseInt(form.totalDays) })
      });
      if (r.ok) { addToast('Policy created!', 'success'); setShowForm(false); setForm({ leaveType: 'ANNUAL', totalDays: '', carryForward: false, description: '' }); fetchPolicies(); }
      else { const d = await r.json(); addToast(d.message || 'Failed to create policy.', 'error'); }
    } catch { addToast('Error creating policy.', 'error'); }
  };

  const leaveTypes = ['ANNUAL', 'SICK', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'COMPENSATORY'];

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Leave Policies</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>Define leave entitlements for all employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> {showForm ? 'Cancel' : 'New Policy'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ marginBottom: '1.5rem', maxWidth: 560 }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Create Leave Policy</h3>
          <form onSubmit={addPolicy}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Leave Type</label>
                <select className="input-field" value={form.leaveType} onChange={e => setForm(p => ({ ...p, leaveType: e.target.value }))}>
                  {leaveTypes.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()} Leave</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Total Days Per Year</label>
                <input type="number" className="input-field" placeholder="e.g. 12" min="1" value={form.totalDays} onChange={e => setForm(p => ({ ...p, totalDays: e.target.value }))} required />
              </div>
            </div>
            <div className="input-group">
              <label>Description</label>
              <input className="input-field" placeholder="e.g. Annual leave for all permanent employees" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="carry" checked={form.carryForward} onChange={e => setForm(p => ({ ...p, carryForward: e.target.checked }))} style={{ width: 'auto' }} />
              <label htmlFor="carry" style={{ marginBottom: 0 }}>Allow carry forward to next year</label>
            </div>
            <button type="submit" className="btn btn-primary"><Plus size={18} /> Create Policy</button>
          </form>
        </div>
      )}

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>Active Policies ({policies.length})</h3>
        {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div> : policies.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {policies.map((p, i) => (
              <div key={p.id || i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <h4 style={{ fontSize: '1rem' }}>{(p.leaveType || p.type || '').replace('_', ' ')} Leave</h4>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{p.totalDays || p.days}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{p.description || 'No description'}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>{p.totalDays || p.days} days/year</span>
                  {p.carryForward && <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Carry Forward</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Settings size={48} style={{ color: 'var(--text-secondary)', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-secondary)' }}>No leave policies configured yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeavePolicies;
