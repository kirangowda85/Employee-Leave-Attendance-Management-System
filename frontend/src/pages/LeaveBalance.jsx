import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API = 'http://localhost:8080';

const LeaveBalance = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${API}/api/leave-balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (r.ok) { const d = await r.json(); setBalances(Array.isArray(d) ? d : []); }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const colors = ['rgba(79,70,229,0.15)', 'rgba(16,185,129,0.15)', 'rgba(245,158,11,0.15)', 'rgba(239,68,68,0.15)'];
  const textColors = ['#818CF8', '#34D399', '#FBBF24', '#F87171'];

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading leave balance...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Leave Balance</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Your current leave entitlements for this year</p>
      </div>

      {balances.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {balances.map((b, i) => {
              const total = b.totalDays || b.allocated || 0;
              const used = b.usedDays || b.used || 0;
              const remaining = b.remainingDays ?? b.remaining ?? (total - used);
              const pct = total > 0 ? Math.round((used / total) * 100) : 0;
              return (
                <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 4 }}>{b.leaveType || b.type}</p>
                      <p style={{ fontSize: '2rem', fontWeight: 700, color: textColors[i % textColors.length] }}>{remaining}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>days remaining</p>
                    </div>
                    <div style={{ background: colors[i % colors.length], borderRadius: 12, padding: '0.6rem' }}>
                      <Wallet size={22} style={{ color: textColors[i % textColors.length] }} />
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: textColors[i % textColors.length], borderRadius: 8, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{used} used</span><span>{total} total</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem' }}>Balance Summary</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>Leave Type</th><th>Allocated</th><th>Used</th><th>Remaining</th><th>Status</th></tr></thead>
                <tbody>
                  {balances.map((b, i) => {
                    const total = b.totalDays || b.allocated || 0;
                    const used = b.usedDays || b.used || 0;
                    const remaining = b.remainingDays ?? (total - used);
                    const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
                    return (
                      <tr key={i}>
                        <td>{b.leaveType || b.type}</td>
                        <td>{total}</td>
                        <td>{used}</td>
                        <td style={{ fontWeight: 600 }}>{remaining}</td>
                        <td>
                          <span className={`badge ${pct > 50 ? 'badge-success' : pct > 20 ? 'badge-warning' : 'badge-danger'}`}>
                            {pct > 50 ? 'Good' : pct > 20 ? 'Low' : 'Critical'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Wallet size={48} style={{ color: 'var(--text-secondary)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-secondary)' }}>No leave balance data found. Contact your admin.</p>
        </div>
      )}
    </div>
  );
};

export default LeaveBalance;
