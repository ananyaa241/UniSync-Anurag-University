import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
import { ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
        })
      });

      if (res.success && res.data) {
        login(res.data.accessToken, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
              className="w-20 h-20 object-contain drop-shadow-md cursor-pointer"
            />
          </Link>
        </div>
        <h2 className="text-2xl font-extrabold text-[#24232B]">
          UniSync CSE
        </h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7051C8]">
          Anurag University
        </p>
        <p className="mt-1 text-xs text-[#737784]">
          One Department. One Workspace. Endless Collaboration.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E6E8ED] rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-[#D94B4B] p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-[#24232B]">
                Institutional Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name.cse@anurag.edu.in"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-[#E6E8ED] rounded-md focus:outline-none focus:ring-1 focus:ring-[#7051C8] focus:border-[#7051C8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#24232B]">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-[#E6E8ED] rounded-md focus:outline-none focus:ring-1 focus:ring-[#7051C8] focus:border-[#7051C8]"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#7051C8] hover:bg-[#50305F] focus:outline-none transition-colors"
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E6E8ED] text-center">
            <p className="text-xs text-[#737784]">
              Don't have an approved account?{' '}
              <Link to="/register" className="font-semibold text-[#7051C8] hover:underline">
                Register here
              </Link>
            </p>
            <p className="mt-2 text-[11px] text-gray-400">
              Institutional CSE credentials required. Protected by Anurag University Academic Security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
