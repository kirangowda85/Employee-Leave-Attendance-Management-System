import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="layout-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--primary)' }}>404</h1>
        <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          <Home size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
