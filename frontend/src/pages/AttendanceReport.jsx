import React, { useState, useEffect } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const API = 'http://localhost:8080';

const AttendanceReport = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { addToast } = useToast();
  const { token } = useAuth();
  const headers = { 'Authorization': `Bearer ${token}` };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/attendance/my-attendance`, { headers });
        if (r.ok) {
          const d = await r.json();
          const list = Array.isArray(d) ? d : d?.attendanceList || (d ? [d] : []);
          setAttendance(list);
        } else addToast('Error loading attendance.', 'error');
      } catch { addToast('Network error.', 'error'); }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = attendance.filter(r => {
    const name = (r.employeeName || r.name || '').toLowerCase();
    const date = r.date || r.attendanceDate || '';
    return name.includes(search.toLowerCase()) && (dateFilter ? date === dateFilter : true);
  });

  useEffect(() => { setPage(1); }, [search, dateFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    if (!filtered.length) { addToast('No data to export.', 'info'); return; }
    const rows = [['Employee', 'Date', 'Entry Time', 'Exit Time', 'Status'],
      ...filtered.map(r => [r.employeeName || 'Me', r.date || r.attendanceDate,
        r.entryTime || r.firstEntry || '-', r.exitTime || r.lastExit || '-', r.status || '-'])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `my_attendance_${new Date().toISOString().split('T')[0]}.csv`
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    addToast('Exported!', 'success');
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2>My Attendance</h2>
        <button className="btn btn-success" onClick={exportCSV}><Download size={18} /> Export CSV</button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: 180 }}>
            <label>Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input className="input-field" style={{ paddingLeft: '2.2rem' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: 160 }}>
            <label>Filter by Date</label>
            <input type="date" className="input-field" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => { setSearch(''); setDateFilter(''); }}>
            <Filter size={16} /> Clear
          </button>
        </div>
      </div>

      <div className="glass-card">
        {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading attendance...</div> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Entry Time</th><th>Exit Time</th><th>Status</th></tr></thead>
              <tbody>
                {paged.length > 0 ? paged.map((r, i) => (
                  <tr key={i}>
                    <td>{r.date || r.attendanceDate}</td>
                    <td>{r.entryTime || r.firstEntry || '-'}</td>
                    <td>{r.exitTime || r.lastExit || '-'}</td>
                    <td><span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : r.status === 'ON_LEAVE' ? 'badge-warning' : 'badge-danger'}`}>{r.status || 'Unknown'}</span></td>
                  </tr>
                )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No records found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > perPage && (
          <div className="pagination" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Showing {(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" style={{ background: 'var(--surface)' }} disabled={page===1} onClick={() => setPage(p=>p-1)}>Prev</button>
              <button className="btn btn-sm" style={{ background: 'var(--surface)' }} disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceReport;
