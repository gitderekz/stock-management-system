import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin1234!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="login-layout">
      <div className="login-card">
        <div className="login-brand">
          <img src="/uploads/logo.png" alt="Logo" className="brand-logo" onError={(e)=>{e.target.style.display='none'}} />
        </div>
        <div className="login-title">StockFlow</div>
        <div className="login-subtitle">Inventory Management System</div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="field-label">Email Address</label>
            <input
              type="email"
              className="text-input full"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="field-label">Password</label>
            <input
              type="password"
              className="text-input full"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">OR</div>

        <div className="login-links">
          <Link to="/forgot-password" className="link-text">Forgot password?</Link>
          <span className="link-separator">•</span>
          <Link to="/register" className="link-text">Create account</Link>
        </div>

        <div className="login-demo">
          <div className="demo-label">Demo Credentials</div>
          <div className="demo-item">
            <div className="demo-role">Admin</div>
            <div className="demo-email">admin@example.com / Admin1234!</div>
          </div>
          <div className="demo-item">
            <div className="demo-role">Stock Manager</div>
            <div className="demo-email">stock@example.com / Stock1234!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
