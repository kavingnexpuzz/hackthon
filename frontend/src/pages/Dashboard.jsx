import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/EmptyState';

const Dashboard = () => {
  const { user, stats } = useAuth();
  const navigate = useNavigate();

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [complaintsRes, requestsRes] = await Promise.all([
          api.get('/complaints?limit=4'),
          api.get('/requests?limit=4'),
        ]);

        if (complaintsRes.success) {
          setRecentComplaints(complaintsRes.data.complaints || []);
        }
        if (requestsRes.success) {
          setRecentRequests(requestsRes.data.requests || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const complaintStats = stats?.complaints || {
    total: 0,
    open_count: 0,
    in_progress_count: 0,
    resolved_count: 0,
  };
  const requestStats = stats?.requests || { total: 0, pending_count: 0, completed_count: 0 };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Department of {user?.department || 'General'} • Campus Intelligent Support
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            icon={PlusCircle}
            onClick={() => navigate('/complaints?action=new')}
            size="sm"
          >
            File Complaint
          </Button>
          <Button
            variant="primary"
            icon={Bot}
            onClick={() => navigate('/chat')}
            size="sm"
          >
            Ask AI Helpdesk
          </Button>
        </div>
      </div>

      {/* AI Helpdesk Hero Shortcut Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/20 border border-indigo-700/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Next-Gen Helpdesk Experience</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Instant Problem Resolution with Conversational AI
            </h2>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              Describe any campus issue in plain English—from broken projectors to Wi-Fi drops or bonafide certificate requests. The AI registers complaints directly into MySQL with automatic ticket generation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="secondary"
              size="lg"
              icon={Bot}
              onClick={() => navigate('/chat')}
              className="!bg-white !text-indigo-900 hover:!bg-indigo-50 shadow-md font-semibold"
            >
              Open AI Chatbot
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Complaints"
          value={complaintStats.total}
          icon={AlertCircle}
          color="indigo"
          subtitle="All filed tickets"
          onClick={() => navigate('/complaints')}
        />
        <StatCard
          title="Open Tickets"
          value={complaintStats.open_count}
          icon={Clock}
          color="blue"
          subtitle="Awaiting dispatch"
          onClick={() => navigate('/complaints?status=Open')}
        />
        <StatCard
          title="In Progress"
          value={complaintStats.in_progress_count}
          icon={Sparkles}
          color="amber"
          subtitle="Technician assigned"
          onClick={() => navigate('/complaints?status=In Progress')}
        />
        <StatCard
          title="Resolved"
          value={complaintStats.resolved_count}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Closed successfully"
          onClick={() => navigate('/complaints?status=Resolved')}
        />
        <StatCard
          title="Active Requests"
          value={requestStats.pending_count}
          icon={FileText}
          color="rose"
          subtitle="Certificates & ID cards"
          onClick={() => navigate('/requests')}
        />
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-500" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Recent Complaints
              </h3>
            </div>
            <button
              onClick={() => navigate('/complaints')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-3">
            {loading ? (
              <LoadingSpinner label="Loading complaints..." />
            ) : recentComplaints.length === 0 ? (
              <EmptyState
                title="No complaints yet"
                description="Everything looks clear! Describe an issue to the AI to file a complaint."
                actionLabel="Report an Issue"
                onAction={() => navigate('/chat')}
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentComplaints.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/complaints?id=${c.id}`)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {c.ticket_number}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {c.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {c.location} • {c.category}
                      </p>
                    </div>

                    <PriorityBadge priority={c.priority} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Recent Service Requests */}
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Recent Service Requests
              </h3>
            </div>
            <button
              onClick={() => navigate('/requests')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-3">
            {loading ? (
              <LoadingSpinner label="Loading requests..." />
            ) : recentRequests.length === 0 ? (
              <EmptyState
                title="No service requests"
                description="Need a bonafide letter, ID replacement, or parking pass? Submit a request."
                actionLabel="Request Service"
                onAction={() => navigate('/requests?action=new')}
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRequests.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/requests?id=${r.id}`)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {r.request_number}
                        </span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {r.request_type}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {r.subject}
                      </p>
                    </div>

                    <PriorityBadge priority={r.priority} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
