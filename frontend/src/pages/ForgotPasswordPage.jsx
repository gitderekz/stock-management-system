import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess('Password reset link has been sent to your email. Check your inbox.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error || 'Failed to send reset email');
    }

    setLoading(false);
  };

  return (
    <div className="login-layout">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon">SMS</div>
        </div>
        <div className="login-title">Forgot Password?</div>
        <div className="login-subtitle">We'll help you reset your password</div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="field-label">Email Address</label>
              <p className="form-help">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
              <input
                type="email"
                className="text-input full"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : null}

        <div className="login-links">
          <Link to="/login" className="link-text">Back to login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
