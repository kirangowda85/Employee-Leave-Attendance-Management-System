import React, { useState, useEffect } from 'react';
import { Plus, Edit, Camera, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/ConfirmContext';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { addToast } = useToast();
  const { openConfirm } = useConfirm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  const [formData, setFormData] = useState({
    employeeCode: '',
    name: '',
    department: '',
    email: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading employees. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (employee = null) => {
    if (employee) {
      setCurrentEmployee(employee);
      setFormData({
        employeeCode: employee.employeeCode || '',
        name: employee.name || '',
        department: employee.department || '',
        email: employee.email || ''
      });
    } else {
      setCurrentEmployee(null);
      setFormData({ employeeCode: '', name: '', department: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEmployee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = currentEmployee ? 'PUT' : 'POST';
      // If we are updating, we use the specific endpoint. Assuming employee.id exists.
      const url = currentEmployee 
        ? `http://localhost:8080/api/employees/${currentEmployee.id || currentEmployee.employeeCode}`
        : 'http://localhost:8080/api/employees';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        addToast(currentEmployee ? 'Employee updated successfully!' : 'Employee added successfully!', 'success');
        fetchEmployees();
        closeModal();
      } else {
        throw new Error('Failed to save employee');
      }
    } catch (err) {
      console.error(err);
      addToast('Error saving employee. Please check the details.', 'error');
    }
  };

  const handleDelete = async (employee) => {
    const confirmed = await openConfirm(`Are you sure you want to delete employee ${employee.name}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/employees/${employee.id || employee.employeeCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        addToast('Employee deleted successfully', 'success');
        fetchEmployees();
      } else {
        throw new Error('Failed to delete employee');
      }
    } catch (err) {
      console.error(err);
      addToast('Error deleting employee.', 'error');
    }
  };

  const totalPages = Math.ceil(employees.length / rowsPerPage);
  const currentEmployees = employees.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="employees-page">
      <div className="flex-between">
        <h2>Employee Directory</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="glass-card table-wrapper">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading employees...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.length > 0 ? (
                currentEmployees.map((emp) => (
                  <tr key={emp.id || emp.employeeCode}>
                    <td>{emp.employeeCode}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.email}</td>
                    <td>
                      <div className="flex-gap">
                        <button className="btn btn-sm" style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)' }} onClick={() => openModal(emp)}>
                          <Edit size={16} />
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(emp)}>
                          <Trash2 size={16} />
                          Delete
                        </button>
                        <Link to="/register-face" className="btn btn-sm btn-success">
                          <Camera size={16} />
                          Face Rec
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No employees found. Add one!</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && employees.length > 0 && (
        <div className="pagination">
          <span className="page-info">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, employees.length)} of {employees.length} entries
          </span>
          <div className="pagination-controls">
            <button 
              className="btn btn-sm" 
              style={{ backgroundColor: 'var(--surface)' }} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button 
              className="btn btn-sm" 
              style={{ backgroundColor: 'var(--surface)' }} 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h2>{currentEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
              <button className="btn-close" onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Employee Code</label>
                <input
                  type="text"
                  name="employeeCode"
                  className="input-field"
                  value={formData.employeeCode}
                  onChange={handleInputChange}
                  required
                  disabled={!!currentEmployee} // Prevent changing code if editing
                />
              </div>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  className="input-field"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="input-field"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex-gap" style={{ marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" style={{ backgroundColor: 'var(--surface)' }} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentEmployee ? 'Update' : 'Save'} Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
