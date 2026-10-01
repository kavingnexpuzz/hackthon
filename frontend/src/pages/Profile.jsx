import React from 'react';
import { User, Mail, Phone, Building2, Shield, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Badge } from '../components/common/Badge';

const Profile = () => {
  const { user, stats, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          User Account Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Identity, verified role privileges, and activity overview
        </p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center text-3xl font-bold uppercase shadow-lg shadow-indigo-500/20">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {user?.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>

              <Badge
                variant={
                  user?.role === 'admin'
                    ? 'purple'
                    : user?.role === 'staff'
                    ? 'amber'
                    : 'indigo'
                }
                size="lg"
              >
                {user?.role}
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Dept: <strong>{user?.department || 'General'}</strong></span>
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{user.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Security / Session Details */}
        <div className="pt-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Security & Access Privileges
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-slate-400 block mb-1">Authentication Method</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                JWT Token (HS256) & bcryptjs Hash
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-slate-400 block mb-1">Account Role Clearance</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {user?.role} Access Level
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="danger" icon={LogOut} onClick={logout} size="sm">
              Sign Out from Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
