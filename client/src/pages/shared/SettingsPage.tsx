import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
import { Laptop, Smartphone, Monitor, Shield, LogOut, CheckCircle, UserCheck, Key, Lock, Edit3 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [preferences, setPreferences] = useState({
    inApp: true,
    email: true,
    sms: false,
    classReminders: true,
    reminderOffsetMinutes: 10
  });
  const [savedMsg, setSavedMsg] = useState(false);

  // Dean Account Details & Edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  // Dean Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  useEffect(() => {
    loadSessions();
    if (user) {
      if (user.notificationPreferences) {
        setPreferences(user.notificationPreferences);
      }
      setFullName(user.fullName || '');
      setDesignation(user.designation || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const res = await apiFetch('/auth/sessions');
      if (res.success && res.data) {
        setSessions(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });
      if (res.success && res.data) {
        if (user) {
          updateUser({ ...user, notificationPreferences: res.data });
        }
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update preferences');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ fullName, designation, phone })
      });
      if (res.success && res.data) {
        updateUser(res.data);
        setIsEditingProfile(false);
        setProfileMsg('Account details updated successfully.');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile details');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErr('');
    setPasswordMsg('');
    if (newPassword !== confirmPassword) {
      setPasswordErr('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErr('New password must be at least 6 characters.');
      return;
    }
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (res.success) {
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMsg(''), 4000);
      }
    } catch (err: any) {
      setPasswordErr(err.message || 'Failed to change password');
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!confirm('This will log out all other active sessions across your mobile and desktop devices. Proceed?')) return;
    try {
      await apiFetch('/auth/logout-all', { method: 'POST' });
      loadSessions();
    } catch {
      // Ignore
    }
  };

  if (!user) return null;
  const isDean = user.role === 'HOD';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-5 rounded-xl border border-[#E6E8ED] shadow-sm">
        <h1 className="text-lg font-bold text-[#24232B] flex items-center space-x-2">
          <Shield className="w-5 h-5 text-[#7051C8]" />
          <span>Account Settings & Multi-Device Sessions</span>
        </h1>
        <p className="text-xs text-[#737784] mt-0.5">
          Manage your personal profile, institutional credentials, and active device sessions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Information (View & Edit) and Change Password for All Users */}
        <div className="lg:col-span-6 space-y-6">
          {/* Account Details & Edit Profile */}
          <div className="bg-white p-6 rounded-xl border border-[#E6E8ED] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-[#7051C8]" />
                  <span>Personal Information & Account Details</span>
                </h2>
                <p className="text-[11px] text-[#737784] mt-0.5">
                  View and update your personal and professional profile details.
                </p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="inline-flex items-center space-x-1 text-xs text-[#7051C8] hover:underline font-semibold shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'Cancel' : 'Edit Details'}</span>
              </button>
            </div>

            {profileMsg && (
              <div className="p-3 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{profileMsg}</span>
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#24232B] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#24232B] mb-1">
                    Official Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#24232B] mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#7051C8] text-white rounded-lg text-xs font-semibold hover:bg-[#50305F] shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                  <span className="text-[#737784] font-medium shrink-0">Full Name</span>
                  <span className="font-semibold text-[#24232B] sm:text-right">{user.fullName}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                  <span className="text-[#737784] font-medium shrink-0">Institutional Email</span>
                  <span className="font-semibold text-[#24232B] sm:text-right break-all">{user.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                  <span className="text-[#737784] font-medium shrink-0">Employee ID</span>
                  <span className="font-semibold text-[#24232B] sm:text-right">{user.employeeId}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                  <span className="text-[#737784] font-medium shrink-0">Assigned Role</span>
                  <span className="font-bold text-[#7051C8] bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 self-start sm:self-auto">
                    {user.role === 'HOD' || (user as any).role === 'DEAN'
                      ? 'Dean, CSE'
                      : user.role === 'COORDINATOR'
                      ? 'Academic Coordinator'
                      : 'Faculty Member'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                  <span className="text-[#737784] font-medium shrink-0">Department</span>
                  <span className="font-semibold text-[#24232B] sm:text-right">{user.department || 'Computer Science and Engineering'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 gap-1">
                  <span className="text-[#737784] font-medium shrink-0">Official Designation</span>
                  <span className="font-semibold text-[#24232B] sm:text-right">{user.designation || (user.role === 'COORDINATOR' ? 'Academic Coordinator' : 'Faculty')}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 gap-1">
                  <span className="text-[#737784] font-medium shrink-0">Phone Contact</span>
                  <span className="font-semibold text-[#24232B] sm:text-right">{user.phone || 'Not specified'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Change / Reset Password Card */}
          <div className="bg-white p-6 rounded-xl border border-[#E6E8ED] shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-[#24232B] flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#7051C8]" />
                <span>Change / Reset Password</span>
              </h2>
              <p className="text-[11px] text-[#737784] mt-0.5">
                Update your institutional password. Must be at least 6 characters.
              </p>
            </div>

            {passwordMsg && (
              <div className="p-3 bg-green-50 text-green-700 text-xs rounded-md border border-green-200 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{passwordMsg}</span>
              </div>
            )}

            {passwordErr && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
                {passwordErr}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#24232B] mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#24232B] mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#24232B] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full text-xs p-2.5 border border-[#E6E8ED] rounded-lg focus:ring-1 focus:ring-[#7051C8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7051C8] text-white rounded-lg text-xs font-semibold hover:bg-[#50305F] shadow-sm transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Active Simultaneous Device Sessions */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-[#E6E8ED] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-[#24232B]">Active Device Sessions</h2>
              <button
                onClick={handleTerminateAllSessions}
                className="text-[11px] text-[#D94B4B] hover:underline font-semibold"
              >
                Revoke All Others
              </button>
            </div>

            <div className="mt-4 divide-y divide-gray-100 space-y-2">
              {sessions.map((sess) => {
                const isMobile = sess.deviceType === 'mobile';
                return (
                  <div key={sess._id} className="pt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                        {isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#24232B]">{sess.deviceName}</h4>
                        <span className="text-[10px] text-[#737784] block">
                          Last active: {new Date(sess.lastActiveAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-[#219653] bg-green-50 px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-3 bg-purple-50/50 rounded-lg border border-purple-100 text-[11px] text-[#7051C8] leading-relaxed">
            💡 <strong>Multi-Device Sync:</strong> You can stay logged in simultaneously on your desktop Chrome and Android/iPhone browser. Completed tasks and read receipts synchronize in real time.
          </div>
        </div>
      </div>
    </div>
  );
};
