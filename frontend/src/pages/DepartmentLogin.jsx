import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Lock, Mail, ArrowLeft, Sparkles, AlertCircle, Wrench, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const DepartmentLogin = () => {
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
      if (user.role !== 'staff' && user.role !== 'admin') {
        setError('Access denied: Only department staff and administrators can access this portal.');
        return;
      }
      navigate('/department/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAndSubmitDemoStaff = async (staffEmail) => {
    setEmail(staffEmail);
    setPassword('Password@123');
    setError('');
    setIsLoading(true);
    try {
      const user = await login(staffEmail, 'Password@123');
      if (user.role !== 'staff' && user.role !== 'admin') {
        setError('Access denied: Not department staff.');
        return;
      }
      navigate('/department/dashboard', { replace: true });
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white p-1 shadow-lg shadow-amber-500/10 border border-slate-200 dark:border-slate-700 mb-4">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ44vhfTgtbILqr4iyuXaATJkCOpUtfW0JfUQXbrIgImQ&s=10"
              alt="VET Institute Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Department Staff Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            VET Institute of Arts and Science — Issue Resolution & Technician Workbench
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
              label="Staff Email"
              type="email"
              icon={Mail}
              placeholder="staff@campus.edu"
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
              Sign In to Department
            </Button>
          </form>

          {/* Quick 1-Click Demo Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Department Demo Accounts:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillAndSubmitDemoStaff('staff.it@campus.edu')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-semibold text-xs transition-colors"
              >
                <Wrench className="w-4 h-4" />
                <span>IT Staff</span>
              </button>

              <button
                type="button"
                onClick={() => fillAndSubmitDemoStaff('staff.facilities@campus.edu')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 font-semibold text-xs transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Facilities Staff</span>
              </button>
            </div>
            <p className="text-[11px] text-center text-slate-400 mt-2 font-mono">
              Password: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Password@123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentLogin;
