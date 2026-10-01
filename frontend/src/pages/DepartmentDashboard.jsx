import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  User,
  Phone,
  FileCheck,
  Building2,
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/EmptyState';

const DepartmentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Status update modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchDepartmentData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/department/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load department metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setResolutionNotes(complaint.resolution_notes || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    try {
      const res = await api.patch(`/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        resolution_notes: resolutionNotes,
      });

      if (res.success) {
        setSelectedComplaint(null);
        await fetchDepartmentData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update complaint status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Loading departmental tickets & metrics..." />
      </div>
    );
  }

  const dept = data?.department;
  const stats = data?.stats || {
    total_complaints: 0,
    open_complaints: 0,
    in_progress_complaints: 0,
    resolved_complaints: 0,
    critical_complaints: 0,
  };
  const complaints = data?.recentComplaints || [];

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      c.ticket_number?.toLowerCase().includes(query) ||
      (c.student_name || c.user_name || '').toLowerCase().includes(query) ||
      (c.roll_number || '').toLowerCase().includes(query) ||
      (c.problem || c.subject || '').toLowerCase().includes(query) ||
      (c.location || '').toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Department Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200 dark:border-amber-800">
            <Building2 className="w-3.5 h-3.5" />
            <span>{dept?.department_name || 'Department Operations'}</span>
            {dept?.code && <span className="font-mono font-bold">[{dept.code}]</span>}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Department Technician Workbench
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complaints automatically routed to your unit by Gemini AI college analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={fetchDepartmentData}
            isLoading={loading}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Assigned"
          value={stats.total_complaints || 0}
          icon={Briefcase}
          color="indigo"
          subtitle="Department queue"
        />
        <StatCard
          title="Pending / Open"
          value={stats.open_complaints || 0}
          icon={AlertCircle}
          color="amber"
          subtitle="Requires attention"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress_complaints || 0}
          icon={Clock}
          color="blue"
          subtitle="Staff currently working"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved_complaints || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Completed tickets"
        />
        <StatCard
          title="Critical Priority"
          value={stats.critical_complaints || 0}
          icon={AlertCircle}
          color="rose"
          subtitle="Urgent campus issues"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card className="!p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket #, roll number, student name, issue or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {['All', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Department Complaints Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Active Tickets ({filteredComplaints.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Auto-assigned via AI classifier
          </span>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No complaints found matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Student / Roll</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {c.ticket_number}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.student_name || c.user_name || 'Student'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {c.roll_number ? `Roll: ${c.roll_number}` : c.user_email || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {c.problem || c.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Category: {c.category || 'General'}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span className="truncate">{c.location || 'Campus'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => openUpdateModal(c)}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Status Update Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={
          selectedComplaint
            ? `Update ${selectedComplaint.ticket_number}`
            : 'Update Complaint'
        }
      >
        {selectedComplaint && (
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex justify-between font-mono font-bold text-indigo-600">
                <span>{selectedComplaint.ticket_number}</span>
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                {selectedComplaint.problem || selectedComplaint.subject}
              </p>
              <p className="text-slate-400 text-[11px]">
                Student: {selectedComplaint.student_name || 'N/A'} ({selectedComplaint.roll_number || 'N/A'}) &bull; Location: {selectedComplaint.location}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Progress Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Technician / Resolution Notes
              </label>
              <textarea
                rows={4}
                placeholder="Enter actions performed (e.g., 'Replaced HDMI cable and calibrated projector in Room 204')..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setSelectedComplaint(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={updating}
              >
                Save Resolution
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DepartmentDashboard;
