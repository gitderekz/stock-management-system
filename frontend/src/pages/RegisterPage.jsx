import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(email, password, fullName);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="login-layout">
      <div className="login-card">
        <div className="login-brand">
          <img src="/uploads/logo.png" alt="Logo" className="brand-logo" onError={(e)=>{e.target.style.display='none'}} />
        </div>
        <div className="login-title">Create Account</div>
        <div className="login-subtitle">Join StockFlow Inventory System</div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="field-label">Full Name</label>
            <input
              type="text"
              className="text-input full"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="field-label">Email Address</label>
            <input
              type="email"
              className="text-input full"
              placeholder="you@example.com"
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
              placeholder="Enter password (min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="field-label">Confirm Password</label>
            <input
              type="password"
              className="text-input full"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-links">
          <span>Already have an account?</span>
          <Link to="/login" className="link-text">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
