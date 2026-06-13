import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, Calendar, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API = 'http://localhost:8080';

const Dashboard = () => {
  const { token, isAdmin, isManager, user } = useAuth();
  const [stats, setStats] = useState({ totalEmployees: 0, presentToday: 0, onLeaveToday: 0, totalEntriesToday: 0 });
  const [myAttendance, setMyAttendance] = useState(null);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const now = new Date();
      try {
        const r1 = await fetch(`${API}/api/attendance/dashboard?year=${now.getFullYear()}&month=${now.getMonth()+1}`, { headers });
        if (r1.ok) setStats(await r1.json());

        const r2 = await fetch(`${API}/api/attendance/my-attendance`, { headers });
        if (r2.ok) setMyAttendance(await r2.json());

        const r3 = await fetch(`${API}/api/leave-balance`, { headers });
        if (r3.ok) { const d = await r3.json(); setLeaveBalance(Array.isArray(d) ? d : []); }

        if (isAdmin || isManager) {
          const r4 = await fetch(`${API}/api/attendance/team`, { headers });
          if (r4.ok) { const d = await r4.json(); setTeamAttendance(Array.isArray(d) ? d : []); }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [token]);

  if (loading) return <div className="page-content" style={{ padding: '3rem', textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {(isAdmin || isManager) && (
          <div className="stat-card glass-card">
            <div className="stat-icon"><Users size={24} /></div>
            <div className="stat-info"><h3>Total Employees</h3><p>{stats.totalEmployees || 0}</p></div>
          </div>
        )}
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--secondary)' }}>
            <UserCheck size={24} />
          </div>
          <div className="stat-info"><h3>Present Today</h3><p>{stats.presentToday || 0}</p></div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
            <UserX size={24} />
          </div>
          <div className="stat-info"><h3>On Leave</h3><p>{stats.onLeaveToday || 0}</p></div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info"><h3>Entries Today</h3><p>{stats.totalEntriesToday || 0}</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isAdmin || isManager ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* My Today's Status */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} /> My Today's Status
          </h3>
          {myAttendance ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Entry Time</span>
                <span>{myAttendance.entryTime || myAttendance.firstEntry || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Exit Time</span>
                <span>{myAttendance.exitTime || myAttendance.lastExit || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span className={`badge ${myAttendance.status === 'PRESENT' ? 'badge-success' : 'badge-warning'}`}>
                  {myAttendance.status || 'Not Recorded'}
                </span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No attendance recorded today.</p>
          )}
        </div>

        {/* Leave Balance */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={18} /> Leave Balance
          </h3>
          {leaveBalance.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaveBalance.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{b.leaveType || b.type}</span>
                  <span style={{ fontWeight: 600 }}>{b.remainingDays ?? b.balance ?? '-'} days left</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No leave balance data.</p>
          )}
        </div>
      </div>

      {/* Team Attendance for Manager/Admin */}
      {(isAdmin || isManager) && teamAttendance.length > 0 && (
        <div className="glass-card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} /> Team Attendance Today
          </h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Entry</th><th>Exit</th><th>Status</th></tr></thead>
              <tbody>
                {teamAttendance.slice(0, 8).map((r, i) => (
                  <tr key={i}>
                    <td>{r.employeeName || r.name}</td>
                    <td>{r.entryTime || r.firstEntry || '-'}</td>
                    <td>{r.exitTime || r.lastExit || '-'}</td>
                    <td><span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : r.status === 'ON_LEAVE' ? 'badge-warning' : 'badge-danger'}`}>{r.status || 'Absent'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
