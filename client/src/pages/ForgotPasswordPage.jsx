import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setDevResetUrl('');

    if (!email) {
      setError('Please provide your registered campus email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to request password reset.');
      }

      setSuccessMessage(data.message || 'Password reset link dispatched.');
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="max-w-md">
      <div className="py-8 sm:py-14">
        <div className="text-center mb-6">
          <Badge variant="olive" size="sm" className="mb-2">Account Recovery</Badge>
          <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold text-ink">
            Reset Password
          </h1>
          <p className="text-xs text-olive mt-1">
            Enter your campus email to receive a password reset link.
          </p>
        </div>

        <Card variant="stone" padding="lg">
          {successMessage ? (
            <div className="space-y-4">
              <div className="p-4 rounded border border-forest/30 bg-forest/10 text-ink text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-forest shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-forest">Reset Link Dispatched</p>
                  <p className="text-olive mt-1 leading-relaxed">{successMessage}</p>
                </div>
              </div>

              {devResetUrl && (
                <div className="p-3 rounded bg-paper border border-border text-xs space-y-2">
                  <p className="font-semibold text-ink">Local Simulation Mode:</p>
                  <p className="text-olive text-[11px]">
                    Since external SMTP is unconfigured, here is the generated reset link:
                  </p>
                  <a
                    href={devResetUrl}
                    className="inline-flex items-center gap-1.5 text-forest font-semibold hover:underline break-all"
                  >
                    <span>Proceed to Reset Password</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              )}

              <Link to="/login" className="block pt-2">
                <Button variant="outline" className="w-full" icon={ArrowLeft}>
                  Return to Login
                </Button>
              </Link>
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
                label="Campus Email"
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                icon={Mail}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={loading}
              >
                Send Reset Link
              </Button>

              <div className="pt-3 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-olive hover:text-ink"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};

export default ForgotPasswordPage;
