import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import FaceAttendance from './pages/FaceAttendance';
import FaceRegistration from './pages/FaceRegistration';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AttendanceReport from './pages/AttendanceReport';
import TeamAttendance from './pages/TeamAttendance';
import LeaveRequests from './pages/LeaveRequests';
import LeaveApprovals from './pages/LeaveApprovals';
import LeaveBalance from './pages/LeaveBalance';
import Holidays from './pages/Holidays';
import LeavePolicies from './pages/LeavePolicies';
import NotFound from './pages/NotFound';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <div className="app-container">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Navigate to="/entry" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/entry" element={<FaceAttendance type="ENTRY" />} />
                <Route path="/exit" element={<FaceAttendance type="EXIT" />} />

                {/* Protected — all roles */}
                <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/attendance" element={<AttendanceReport />} />
                  <Route path="/leaves" element={<LeaveRequests />} />
                  <Route path="/leave-balance" element={<LeaveBalance />} />
                  <Route path="/register-face" element={<FaceRegistration />} />

                  {/* Manager + Admin */}
                  <Route path="/team-attendance" element={
                    <PrivateRoute roles={['MANAGER','ADMIN']}><TeamAttendance /></PrivateRoute>
                  } />
                  <Route path="/leave-approvals" element={
                    <PrivateRoute roles={['MANAGER','ADMIN']}><LeaveApprovals /></PrivateRoute>
                  } />

                  {/* Admin only */}
                  <Route path="/employees" element={
                    <PrivateRoute roles={['ADMIN']}><Employees /></PrivateRoute>
                  } />
                  <Route path="/holidays" element={
                    <PrivateRoute roles={['ADMIN']}><Holidays /></PrivateRoute>
                  } />
                  <Route path="/leave-policies" element={
                    <PrivateRoute roles={['ADMIN']}><LeavePolicies /></PrivateRoute>
                  } />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
