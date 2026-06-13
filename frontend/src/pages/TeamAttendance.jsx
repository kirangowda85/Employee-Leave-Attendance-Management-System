import React, { useState, useEffect } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const API = 'http://localhost:8080';

const TeamAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { token } = useAuth();
  const { addToast } = useToast();
  const headers = { 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${API}/api/attendance/team`, { headers });
        if (r.ok) { const d = await r.json(); setRecords(Array.isArray(d) ? d : []); }
        else addToast('Could not load team attendance.', 'error');
      } catch { addToast('Network error.', 'error'); }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = records.filter(r => {
    const name = (r.employeeName || r.name || '').toLowerCase();
    const date = r.date || r.attendanceDate || '';
    const status = (r.status || '').toUpperCase();
    return (
      name.includes(search.toLowerCase()) &&
      (dateFilter ? date === dateFilter : true) &&
      (statusFilter ? status === statusFilter : true)
    );
  });

  const exportCSV = () => {
    if (!filtered.length) { addToast('No data to export.', 'info'); return; }
    const rows = [['Employee', 'Date', 'Entry', 'Exit', 'Status'],
      ...filtered.map(r => [r.employeeName || r.name, r.date || r.attendanceDate,
        r.entryTime || r.firstEntry || '-', r.exitTime || r.lastExit || '-', r.status || '-'])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'team_attendance.csv' });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    addToast('Exported successfully.', 'success');
  };

  const summaryCount = (status) => records.filter(r => (r.status || '').toUpperCase() === status).length;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2>Team Attendance</h2>
        <button className="btn btn-success" onClick={exportCSV}><Download size={18} /> Export CSV</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[['Present', 'PRESENT', '#34D399'], ['On Leave', 'ON_LEAVE', '#FBBF24'], ['Absent', 'ABSENT', '#F87171']].map(([label, key, color]) => (
          <div key={key} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{summaryCount(key)}</span>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: 180 }}>
            <label>Search Employee</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input className="input-field" style={{ paddingLeft: '2.2rem' }} placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: 160 }}>
            <label>Filter by Date</label>
            <input type="date" className="input-field" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          </div>
          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
            <label>Status</label>
            <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="PRESENT">Present</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => { setSearch(''); setDateFilter(''); setStatusFilter(''); }}>
            <Filter size={16} /> Clear
          </button>
        </div>
      </div>

      <div className="glass-card">
        {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Employee</th><th>Date</th><th>Entry Time</th><th>Exit Time</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((r, i) => (
                  <tr key={i}>
                    <td>{r.employeeName || r.name}</td>
                    <td>{r.date || r.attendanceDate}</td>
                    <td>{r.entryTime || r.firstEntry || '-'}</td>
                    <td>{r.exitTime || r.lastExit || '-'}</td>
                    <td>
                      <span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : r.status === 'ON_LEAVE' ? 'badge-warning' : 'badge-danger'}`}>
                        {r.status || 'Absent'}
                      </span>
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" style={{ textAlign: 'center' }}>No records found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAttendance;
