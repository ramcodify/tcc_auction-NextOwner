import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, School, IdCard, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    campus: 'Main Campus',
    studentId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      campus: formData.campus,
      studentId: formData.studentId
    });

    setLoading(false);

    if (res.success) {
      navigate('/profile');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <PageContainer maxWidth="max-w-md">
      <div className="py-6 sm:py-10">
        <div className="text-center mb-6">
          <Badge variant="forest" size="sm" className="mb-2">Unified Student Account</Badge>
          <h1 className="editorial-heading text-2xl sm:text-3xl font-semibold text-ink">
            Create Your Account
          </h1>
          <p className="text-xs text-olive mt-1 max-w-sm mx-auto leading-relaxed">
            One single student profile for both bidding on listings and auctioning items across campus.
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
              label="Full Name *"
              name="name"
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <Input
              label="Campus Email *"
              type="email"
              name="email"
              placeholder="student@university.edu"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              helperText="Preferably your campus .edu or university email"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Campus / Dorm"
                name="campus"
                placeholder="Main Campus"
                value={formData.campus}
                onChange={handleChange}
                icon={School}
              />

              <Input
                label="Student ID (Optional)"
                name="studentId"
                placeholder="STU-12345"
                value={formData.studentId}
                onChange={handleChange}
                icon={IdCard}
              />
            </div>

            <Input
              label="Password *"
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Input
              label="Confirm Password *"
              type="password"
              name="confirmPassword"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <div className="p-3 rounded bg-paper border border-border text-[11px] text-olive leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
              <span>
                <strong>Campus Rule:</strong> You will never be asked to pick a buyer or seller role. Both capabilities are unlocked automatically on this account.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
            >
              Complete Registration
            </Button>
          </form>

          <div className="pt-4 mt-4 border-t border-border/80 text-center text-xs text-olive">
            Already have an account?{' '}
            <Link to="/login" className="text-forest font-semibold hover:underline">
              Log in here
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default RegisterPage;
