import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  AlertCircle,
  FileText,
  BookOpen,
  Bell,
  User,
  LogOut,
  Shield,
  Briefcase,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, unreadCount, logout } = useAuth();

  const navLinks = [
    { to: '/', label: 'Public Assistant', icon: Sparkles },
    { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    {
      to: '/chat',
      label: 'AI Helpdesk',
      icon: Bot,
      highlight: true,
    },
    { to: '/complaints', label: 'My Complaints', icon: AlertCircle },
    { to: '/requests', label: 'My Requests', icon: FileText },
    { to: '/faq', label: 'Knowledge Base', icon: BookOpen },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  const staffLinks = [
    { to: '/department/dashboard', label: 'Department Workbench', icon: Briefcase },
    { to: '/staff', label: 'Staff Worklist', icon: Briefcase },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Console', icon: Shield },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
          <NavLink to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight block">
                Campus Helpdesk
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase block">
                AI Agent Edition
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main User Navigation */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Main Menu
            </p>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? link.highlight
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : link.highlight
                        ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <link.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  {link.highlight && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                      AI
                    </span>
                  )}
                  {link.badge && (
                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Staff specific navigation */}
          {(role === 'staff' || role === 'admin') && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Staff Operations
              </p>
              <div className="space-y-1">
                {staffLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <link.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* Admin console navigation */}
          {role === 'admin' && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Administration
              </p>
              <div className="space-y-1">
                {adminLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <link.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Footer Profile & Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center justify-between p-2 rounded-xl">
            <NavLink
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs uppercase flex-shrink-0">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 capitalize truncate">
                  {user?.role || 'student'} • {user?.department || 'General'}
                </p>
              </div>
            </NavLink>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
