import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please provide a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setSuccess(true);
      await checkAuth();
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Password reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="max-w-md">
      <div className="py-8 sm:py-14">
        <div className="text-center mb-6">
          <Badge variant="forest" size="sm" className="mb-2">Security</Badge>
          <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold text-ink">
            Set New Password
          </h1>
          <p className="text-xs text-olive mt-1">
            Choose a strong password to secure your NEXTowner student account.
          </p>
        </div>

        <Card variant="stone" padding="lg">
          {success ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-forest mx-auto" />
              <h2 className="text-base font-semibold text-ink">Password Updated</h2>
              <p className="text-xs text-olive">
                Your password has been reset. Redirecting you to your profile...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded border border-[#9E392F]/30 bg-[#9E392F]/10 text-xs text-[#9E392F] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                icon={Lock}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                icon={Lock}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={loading}
              >
                Save New Password
              </Button>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-xs text-olive hover:text-ink">
                  Return to sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};

export default ResetPasswordPage;
