import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Tag,
  Building2,
  User,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  FileText,
  Sparkles,
  Calendar,
  Check,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/EmptyState';

const STATUS_STEPS = [
  { key: 'Open', label: 'Reported', desc: 'Complaint logged in system' },
  { key: 'Assigned', label: 'Assigned', desc: 'Dispatched to department' },
  { key: 'In Progress', label: 'In Progress', desc: 'Technician inspecting/fixing' },
  { key: 'Resolved', label: 'Resolved', desc: 'Issue resolved & verified' },
  { key: 'Closed', label: 'Closed', desc: 'Ticket archived' },
];

const TrackComplaint = () => {
  const [searchParams] = useSearchParams();
  const [ticketNumber, setTicketNumber] = useState(searchParams.get('ticket') || '');
  const [rollNumber, setRollNumber] = useState(searchParams.get('roll') || '');
  const [loading, setLoading] = useState(false);
  const [complaintData, setComplaintData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  // Auto-search if query params are present
  useEffect(() => {
    if (searchParams.get('ticket') && searchParams.get('roll')) {
      handleTrack(searchParams.get('ticket'), searchParams.get('roll'));
    }
  }, [searchParams]);

  const handleTrack = async (ticket = ticketNumber, roll = rollNumber) => {
    setError('');
    if (!ticket.trim() || !roll.trim()) {
      setError('Please provide both Ticket Number (e.g. CMP-2026-0001) and your Roll Number (e.g. 23CS001).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/complaints/track', {
        ticketNumber: ticket.trim(),
        rollNumber: roll.trim(),
      });

      if (res.success && res.data) {
        setComplaintData(res.data.complaint);
        setHistory(res.data.history || []);
      }
    } catch (err) {
      setError(err.message || 'No complaint found matching the provided Ticket Number and Roll Number.');
      setComplaintData(null);
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (ticket, roll) => {
    setTicketNumber(ticket);
    setRollNumber(roll);
    handleTrack(ticket, roll);
  };

  const getStepIndex = (status) => {
    if (status === 'Rejected') return -1;
    return STATUS_STEPS.findIndex((s) => s.key.toLowerCase() === (status || '').toLowerCase());
  };

  const currentStepIdx = complaintData ? getStepIndex(complaintData.status) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 sm:py-12 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
          <Search className="w-3.5 h-3.5" />
          <span>Real-time Complaint Tracker</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Track Your Resolution Progress
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Enter your Ticket Number and Student Roll Number to securely view live updates, assigned staff, and resolution audit logs.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-500/5 dark:shadow-none border border-slate-200/80 dark:border-slate-800 space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Ticket Number *
              </label>
              <input
                type="text"
                placeholder="e.g. CMP-2026-0001"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Student Roll Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 23CS001"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Quick Demo Fill */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Try sample:</span>
              <button
                type="button"
                onClick={() => fillQuickDemo('CMP-2026-0001', '23CS001')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-mono font-bold text-[11px] transition-colors"
              >
                CMP-2026-0001 (23CS001)
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Locating Ticket...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verify & Track Status</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Complaint Result View */}
      {complaintData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Main Status & Stepper Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {complaintData.ticket_number}
                  </span>
                  <StatusBadge status={complaintData.status} size="md" />
                  <PriorityBadge priority={complaintData.priority} size="md" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Submitted on {new Date(complaintData.created_at).toLocaleString()}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Unit
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center sm:justify-end gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  {complaintData.department_name || 'Department Assigned'}
                </span>
              </div>
            </div>

            {/* Visual Stepper */}
            <div className="relative">
              <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
              <div
                className="hidden sm:block absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, (currentStepIdx / (STATUS_STEPS.length - 1)) * 100))}%`,
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  return (
                    <div
                      key={step.key}
                      className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-3 sm:p-0 rounded-2xl sm:rounded-none ${
                        isCurrent
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/30 sm:bg-transparent'
                          : ''
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : isCurrent
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-100 dark:ring-indigo-950/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div>
                        <p
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : isCompleted
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[10px] text-slate-400 hidden sm:block">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details & Resolution Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: Issue Summary */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Complaint Summary</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Problem Description
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 leading-relaxed">
                    {complaintData.problem || complaintData.subject}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Location
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {complaintData.location || 'Campus'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Category
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                      <Tag className="w-3.5 h-3.5 text-purple-500" />
                      {complaintData.category || 'General'}
                    </span>
                  </div>
                </div>

                {complaintData.ai_summary && (
                  <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Analysis Summary
                    </span>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {complaintData.ai_summary}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: Resolution & Audit Logs */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Timeline Audit Log</span>
              </h3>

              {history.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No status transitions recorded yet. Ticket is currently Open.
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
                  {history.map((h, i) => (
                    <div
                      key={h.id || i}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {h.old_status ? `${h.old_status} → ${h.new_status}` : h.new_status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {h.comment && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                          "{h.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {complaintData.resolution_notes && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    Technician Resolution Remarks
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {complaintData.resolution_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackComplaint;
