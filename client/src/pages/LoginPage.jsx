import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Destination after login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Invalid email or password');
    }
  };

  return (
    <PageContainer maxWidth="max-w-md">
      <div className="py-8 sm:py-14">
        <div className="text-center mb-6">
          <Badge variant="forest" size="sm" className="mb-2">Student Access</Badge>
          <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold text-ink">
            Log In to NEXTowner
          </h1>
          <p className="text-xs text-olive mt-1">
            Access your active bids, saved items, and seller listings.
          </p>
        </div>

        <Card variant="stone" padding="lg">
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-ink tracking-wide">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-forest hover:underline font-normal"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                icon={Lock}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          <div className="pt-4 mt-4 border-t border-border/80 text-center text-xs text-olive">
            Don't have a student account yet?{' '}
            <Link to="/register" className="text-forest font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default LoginPage;
