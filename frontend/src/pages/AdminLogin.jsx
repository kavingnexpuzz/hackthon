import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('Access denied: This portal is strictly for Institutional Administrators.');
        return;
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAndSubmitDemoAdmin = async () => {
    setEmail('admin@campus.edu');
    setPassword('Password@123');
    setError('');
    setIsLoading(true);
    try {
      const user = await login('admin@campus.edu', 'Password@123');
      if (user.role !== 'admin') {
        setError('Access denied: Not an administrator.');
        return;
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public College Assistant</span>
        </Link>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-1 shadow-lg shadow-purple-500/10 border border-slate-200 dark:border-slate-700 mb-4">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ44vhfTgtbILqr4iyuXaATJkCOpUtfW0JfUQXbrIgImQ&s=10"
              alt="VET Institute Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Administrator Console
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            VET Institute of Arts and Science — Campus Helpdesk & AI Management
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              icon={Mail}
              placeholder="admin@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              variant="primary"
              isLoading={isLoading}
            >
              Sign In as Administrator
            </Button>
          </form>

          {/* Quick 1-Click Demo Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Instant Hackathon Evaluation:</span>
            </p>
            <button
              type="button"
              onClick={fillAndSubmitDemoAdmin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 font-semibold text-xs transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>1-Click Sign In: System Administrator</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2 font-mono">
              admin@campus.edu &bull; Password@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
