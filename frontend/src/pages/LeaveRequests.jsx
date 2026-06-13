import React, { useState, useEffect } from 'react';
import { Send, Check, X, Clock, History } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useAuth } from '../contexts/AuthContext';

const API = 'http://localhost:8080';

const LeaveRequests = () => {
  const [tab, setTab] = useState('apply');
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ startDate: '', endDate: '', type: 'ANNUAL', reason: '' });
  const { addToast } = useToast();
  const { openConfirm } = useConfirm();
  const { token } = useAuth();
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { if (tab === 'history') fetchMyLeaves(); }, [tab]);

  const fetchMyLeaves = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/leaves/my-leaves`, { headers });
      if (r.ok) setMyLeaves(await r.json());
    } catch { addToast('Error loading leave history.', 'error'); }
    setLoading(false);
  };

  const submitLeave = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API}/api/leaves`, { method: 'POST', headers, body: JSON.stringify(formData) });
      if (r.ok) {
        addToast('Leave request submitted!', 'success');
        setFormData({ startDate: '', endDate: '', type: 'ANNUAL', reason: '' });
      } else { const d = await r.json(); addToast(d.message || 'Submission failed.', 'error'); }
    } catch { addToast('Error submitting leave.', 'error'); }
  };

  const statusBadge = (s) => {
    const map = { APPROVED: 'badge-success', REJECTED: 'badge-danger', PENDING: 'badge-warning' };
    return <span className={`badge ${map[s?.toUpperCase()] || 'badge-warning'}`}>{s || 'PENDING'}</span>;
  };

  const tabs = [
    { id: 'apply', label: 'Apply Leave', icon: <Send size={16} /> },
    { id: 'history', label: 'My History', icon: <History size={16} /> },
  ];

  return (
    <div className="leaves-page">
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2>My Leave Requests</h2>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer',
              color: tab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: tab === t.id ? 600 : 400, fontSize: '0.95rem', transition: 'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'apply' && (
        <div className="glass-card" style={{ maxWidth: 560 }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Apply for Leave</h3>
          <form onSubmit={submitLeave}>
            <div className="input-group">
              <label>Leave Type</label>
              <select name="type" className="input-field" value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} required>
                <option value="ANNUAL">Annual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Start Date</label>
                <input type="date" className="input-field" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} required />
              </div>
              <div className="input-group">
                <label>End Date</label>
                <input type="date" className="input-field" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} required />
              </div>
            </div>
            <div className="input-group">
              <label>Reason</label>
              <textarea className="input-field" rows="3" value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Send size={18} /> Submit Request
            </button>
          </form>
        </div>
      )}

      {tab === 'history' && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>My Leave History</h3>
          <div className="table-wrapper">
            {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div> : (
              <table className="data-table">
                <thead><tr><th>Type</th><th>Start Date</th><th>End Date</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
                <tbody>
                  {myLeaves.length > 0 ? myLeaves.map((r, i) => (
                    <tr key={i}>
                      <td>{r.type || r.leaveType}</td>
                      <td>{r.startDate}</td>
                      <td>{r.endDate}</td>
                      <td>{r.numberOfDays || r.days || '-'}</td>
                      <td>{r.reason}</td>
                      <td>{statusBadge(r.status)}</td>
                    </tr>
                  )) : <tr><td colSpan="6" style={{ textAlign: 'center' }}>No leave history found.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
