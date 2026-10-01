import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bot,
  BookOpen,
  Info,
  Search,
  Shield,
  Briefcase,
  Sun,
  Moon,
  AlertTriangle,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const PublicNavbar = ({ onOpenComplaintModal }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItemClass = ({ isActive }) =>
    `relative px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
      isActive
        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200/60 dark:border-indigo-800/80 font-bold'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand & Logo */}
        <NavLink to="/" className="flex items-center gap-3.5 group py-1">
          <div className="relative">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ44vhfTgtbILqr4iyuXaATJkCOpUtfW0JfUQXbrIgImQ&s=10"
              alt="VET Institute of Arts and Science Logo"
              className="w-11 h-11 object-contain rounded-2xl bg-white p-1 shadow-md shadow-indigo-500/10 border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                VET Institute
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/60 dark:to-purple-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/80">
                <Sparkles className="w-2.5 h-2.5" />
                <span>AI Helpdesk</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-normal hidden sm:block">
              Institute of Arts and Science
            </p>
          </div>
        </NavLink>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <NavLink to="/" end className={navItemClass}>
            <Bot className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Assistant</span>
          </NavLink>

          <NavLink to="/courses" className={navItemClass}>
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Academic Programs</span>
          </NavLink>

          <NavLink to="/college-info" className={navItemClass}>
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Campus Info</span>
          </NavLink>

          <NavLink to="/track" className={navItemClass}>
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Track Complaint</span>
          </NavLink>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Problem Report Button */}
          <button
            onClick={onOpenComplaintModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-md shadow-rose-500/20 hover:shadow-rose-500/30 active:scale-95 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Problem</span>
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Color Theme"
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Admin & Department Portals */}
          {user && (role === 'admin' || role === 'staff') ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() =>
                  navigate(role === 'admin' ? '/admin/dashboard' : '/department/dashboard')
                }
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              >
                {role === 'admin' ? 'Admin Console' : 'Staff Workbench'}
              </button>
              <button
                onClick={logout}
                className="text-xs text-rose-500 hover:underline px-1 font-semibold"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <NavLink
                to="/admin/login"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </NavLink>
              <NavLink
                to="/department/login"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Staff</span>
              </NavLink>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-5 space-y-2 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Bot className="w-4 h-4 text-indigo-500" />
            <span>AI College Assistant</span>
          </NavLink>

          <NavLink
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Academic Programs</span>
          </NavLink>

          <NavLink
            to="/college-info"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>Campus Information</span>
          </NavLink>

          <NavLink
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>Track Complaint</span>
          </NavLink>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenComplaintModal();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-amber-500"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Problem</span>
            </button>

            <div className="flex gap-2">
              <NavLink
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/40"
              >
                Admin
              </NavLink>
              <NavLink
                to="/department/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40"
              >
                Staff
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
