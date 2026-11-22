import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { User, Mail, Lock, Building, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    role: 'FACULTY',
    designation: 'Assistant Professor',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          employeeId: formData.employeeId,
          role: formData.role,
          designation: formData.designation,
          password: formData.password
        })
      });

      if (res.success) {
        setSuccess(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <Link to="/" title="Go to UniSync Landing Page" className="inline-block hover:opacity-90 transition-opacity">
            <img
              src="/unisync-logo.png"
              alt="UniSync CSE Anurag University"
              className="w-16 h-16 object-contain drop-shadow-md cursor-pointer"
            />
          </Link>
        </div>
        <h2 className="text-2xl font-extrabold text-[#24232B]">
          Create your UniSync Account
        </h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7051C8]">
          Department of CSE | Anurag University
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E6E8ED] rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-[#D94B4B] p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-[#219653] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#24232B] mb-2">Registration Submitted</h3>
              <p className="text-xs text-[#737784] mb-6 leading-relaxed">
                {success}
              </p>
              <Link
                to="/login"
                className="inline-block px-5 py-2.5 bg-[#7051C8] text-white rounded-md text-xs font-semibold hover:bg-[#50305F]"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleRegister}>
              <div>
                <label className="block text-xs font-medium text-[#24232B]">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-[#E6E8ED] rounded-md focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name.cse@anurag.edu.in"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-[#E6E8ED] rounded-md focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="AU-CSE-XXX"
                    className="mt-1 block w-full px-3 py-2 text-sm border border-[#E6E8ED] rounded-md focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Requested Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-[#E6E8ED] rounded-md focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                  >
                    <option value="FACULTY">Faculty</option>
                    <option value="COORDINATOR">Academic Coordinator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#24232B]">Designation</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Assistant Professor / Associate Professor"
                  className="mt-1 block w-full px-3 py-2 text-sm border border-[#E6E8ED] rounded-md focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="mt-1 block w-full px-3 py-2 text-sm border border-[#E6E8ED] rounded-md focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#24232B]">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="mt-1 block w-full px-3 py-2 text-sm border border-[#E6E8ED] rounded-md focus:outline-none focus:ring-1 focus:ring-[#7051C8]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-md shadow-sm text-sm font-semibold text-white bg-[#7051C8] hover:bg-[#50305F] transition-colors"
                >
                  {loading ? 'Submitting Registration...' : 'Submit for Dean Approval'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-[#737784]">
              Already have an approved account?{' '}
              <Link to="/login" className="font-semibold text-[#7051C8] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
