import React, { useState, useEffect } from 'react';
import { Check, X, History } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { useAuth } from '../contexts/AuthContext';

const API = 'http://localhost:8080';

const LeaveApprovals = () => {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { openConfirm } = useConfirm();
  const { token } = useAuth();
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (tab === 'pending') fetchPending();
    else fetchHistory();
  }, [tab]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/leaves/pending`, { headers });
      if (r.ok) setPending(await r.json());
    } catch { addToast('Error loading pending requests.', 'error'); }
    setLoading(false);
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/leaves/team-history`, { headers });
      if (r.ok) setHistory(await r.json());
    } catch { addToast('Error loading history.', 'error'); }
    setLoading(false);
  };

  const handleAction = async (id, action) => {
    if (action === 'REJECTED') {
      const ok = await openConfirm('Are you sure you want to reject this leave request?');
      if (!ok) return;
    }
    try {
      const r = await fetch(`${API}/api/leaves/action`, {
        method: 'POST', headers,
        body: JSON.stringify({ leaveId: id, status: action })
      });
      if (r.ok) { addToast(`Leave ${action.toLowerCase()} successfully.`, 'success'); fetchPending(); }
      else { const d = await r.json(); addToast(d.message || 'Action failed.', 'error'); }
    } catch { addToast('Error processing action.', 'error'); }
  };

  const statusBadge = (s) => {
    const map = { APPROVED: 'badge-success', REJECTED: 'badge-danger', PENDING: 'badge-warning' };
    return <span className={`badge ${map[s?.toUpperCase()] || 'badge-warning'}`}>{s || 'PENDING'}</span>;
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2>Leave Approvals</h2>
        <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>{pending.length} Pending</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        {[{ id: 'pending', label: 'Pending Requests' }, { id: 'history', label: 'Team History' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '0.6rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer',
              color: tab === t.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              fontWeight: tab === t.id ? 600 : 400, fontSize: '0.95rem' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-card">
        {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div> : (
          <div className="table-wrapper">
            {tab === 'pending' ? (
              <table className="data-table">
                <thead><tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Actions</th></tr></thead>
                <tbody>
                  {pending.length > 0 ? pending.map((r, i) => (
                    <tr key={i}>
                      <td>{r.employeeName || r.employeeCode}</td>
                      <td>{r.type || r.leaveType}</td>
                      <td>{r.startDate}</td>
                      <td>{r.endDate}</td>
                      <td>{r.numberOfDays || r.days || '-'}</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                      <td>
                        <div className="flex-gap">
                          <button className="btn btn-sm btn-success" style={{ padding: '0.3rem 0.7rem' }} onClick={() => handleAction(r.id, 'APPROVED')}>
                            <Check size={16} /> Approve
                          </button>
                          <button className="btn btn-sm btn-danger" style={{ padding: '0.3rem 0.7rem' }} onClick={() => handleAction(r.id, 'REJECTED')}>
                            <X size={16} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="7" style={{ textAlign: 'center' }}>No pending requests.</td></tr>}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead><tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
                <tbody>
                  {history.length > 0 ? history.map((r, i) => (
                    <tr key={i}>
                      <td>{r.employeeName || r.employeeCode}</td>
                      <td>{r.type || r.leaveType}</td>
                      <td>{r.startDate}</td>
                      <td>{r.endDate}</td>
                      <td>{r.numberOfDays || r.days || '-'}</td>
                      <td>{r.reason}</td>
                      <td>{statusBadge(r.status)}</td>
                    </tr>
                  )) : <tr><td colSpan="7" style={{ textAlign: 'center' }}>No history found.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovals;
