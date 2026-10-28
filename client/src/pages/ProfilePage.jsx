import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  School,
  IdCard,
  Phone,
  FileText,
  Lock,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Tag,
  Gavel,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';

export const ProfilePage = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Profile details state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    campus: user?.campus || '',
    studentId: user?.studentId || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    const res = await updateProfile(profileData);
    setProfileLoading(false);

    if (res.success) {
      setProfileSuccess('Profile updated successfully.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } else {
      setProfileError(res.error || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!passData.currentPassword || !passData.newPassword) {
      setPassError('Please complete all password fields.');
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    const res = await changePassword(passData.currentPassword, passData.newPassword);
    setPassLoading(false);

    if (res.success) {
      setPassSuccess('Password updated successfully.');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassSuccess(''), 4000);
    } else {
      setPassError(res.error || 'Failed to update password.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <PageContainer
      title="Student Profile"
      subtitle="Manage your unified campus account, personal details, contact coordinates, and security."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          icon={LogOut}
          className="text-[#9E392F] hover:bg-[#9E392F]/10 border-border"
        >
          Sign Out
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Profile Identity Card */}
        <Card variant="stone" padding="lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-border/80">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-forest text-paper text-xl font-bold flex items-center justify-center border-2 border-stone-hover shrink-0">
                {getInitials(user.name)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-ink">{user.name}</h2>
                  {user.isVerified ? (
                    <Badge variant="forest" size="sm">Verified Student</Badge>
                  ) : (
                    <Badge variant="olive" size="sm">Unverified Email</Badge>
                  )}
                </div>
                <p className="text-xs text-olive mt-0.5">{user.email}</p>
                <p className="text-xs text-olive font-mono mt-0.5">
                  Campus: {user.campus || 'Main Campus'} {user.studentId ? `• ID: ${user.studentId}` : ''}
                </p>
              </div>
            </div>

            {/* Unified Account Badges */}
            <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] text-olive font-medium">Unified Account Privileges:</span>
              <div className="flex items-center gap-2">
                <Badge variant="forest" size="sm" className="gap-1">
                  <ShoppingBag className="w-3 h-3" /> Active Buyer
                </Badge>
                <Badge variant="forest" size="sm" className="gap-1">
                  <Gavel className="w-3 h-3" /> Authorized Seller
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 text-xs text-olive leading-relaxed">
            <span className="font-semibold text-ink">Campus Role Policy:</span> In NEXTowner, all students possess equal rights to both bid on auctions and list items for sale under a single verified account.
          </div>
        </Card>

        {/* Edit Details & Security Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="stone" padding="lg">
              <CardHeader>
                <CardTitle>Personal & Campus Coordinates</CardTitle>
                <CardDescription>
                  Keep your campus and handover details updated for smooth auction pickups.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
                {profileSuccess && (
                  <div className="p-3 rounded border border-forest/30 bg-forest/10 text-xs text-forest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="p-3 rounded border border-[#9E392F]/30 bg-[#9E392F]/10 text-xs text-[#9E392F] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    icon={User}
                    required
                  />

                  <Input
                    label="Campus Email (Read Only)"
                    value={user.email}
                    disabled
                    icon={Mail}
                    helperText="Email is bound to your campus credentials"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Campus / Residence / Dorm"
                    value={profileData.campus}
                    onChange={(e) => setProfileData({ ...profileData, campus: e.target.value })}
                    placeholder="e.g. West Campus Dorm 4"
                    icon={School}
                  />

                  <Input
                    label="Student ID"
                    value={profileData.studentId}
                    onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                    placeholder="e.g. STU-8823"
                    icon={IdCard}
                  />
                </div>

                <Input
                  label="Contact Phone / WhatsApp (For Handover Coordination)"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  icon={Phone}
                  helperText="Shared only with winning bidders or sellers after auction closure"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-ink">
                    Bio / Student Intro
                  </label>
                  <textarea
                    rows={3}
                    maxLength={250}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="e.g. Senior CS student living on North Campus. Selling textbooks and tech gear."
                    className="w-full bg-paper text-ink placeholder-olive text-sm border border-border rounded px-3 py-2 transition-colors focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                  <p className="text-[11px] text-olive text-right">
                    {profileData.bio.length}/250 characters
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={profileLoading}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Security & Password (1 Col) */}
          <div className="space-y-6">
            <Card variant="stone" padding="lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-forest" />
                  Security & Password
                </CardTitle>
                <CardDescription>
                  Update your password regularly to protect your account.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
                {passSuccess && (
                  <div className="p-3 rounded border border-forest/30 bg-forest/10 text-xs text-forest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                {passError && (
                  <div className="p-3 rounded border border-[#9E392F]/30 bg-[#9E392F]/10 text-xs text-[#9E392F] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passError}</span>
                  </div>
                )}

                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Your current password"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  required
                />

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  isLoading={passLoading}
                >
                  Update Password
                </Button>
              </form>
            </Card>

            <Card variant="paper" padding="md">
              <h4 className="text-xs font-semibold text-ink mb-1">Account Safety Tip</h4>
              <p className="text-[11px] text-olive leading-relaxed">
                Never share your password or payment tokens with anyone. All NEXTowner transactions are conducted through verified student-to-student handover.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;
