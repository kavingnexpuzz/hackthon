import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/EmptyState';

const StaffDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status update modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketType, setTicketType] = useState('complaint'); // 'complaint' | 'request'
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/dashboard');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load staff dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const openUpdateModal = (ticket, type) => {
    setSelectedTicket(ticket);
    setTicketType(type);
    setStatus(ticket.status);
    setNotes(type === 'complaint' ? ticket.resolution_notes || '' : ticket.admin_notes || '');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setUpdating(true);
    try {
      if (ticketType === 'complaint') {
        await api.patch(`/complaints/${selectedTicket.id}/status`, {
          status,
          resolution_notes: notes,
        });
      } else {
        await api.patch(`/requests/${selectedTicket.id}/status`, {
          status,
          admin_notes: notes,
        });
      }
      setSelectedTicket(null);
      fetchStaffData();
    } catch (err) {
      alert(err.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading staff worklist..." />;
  }

  const complaintStats = data?.complaints || { total_assigned: 0, pending: 0, in_progress: 0, completed: 0 };
  const requestStats = data?.requests || { total_assigned: 0, pending: 0, in_progress: 0, completed: 0 };
  const assignedComplaints = data?.assignedComplaints || [];
  const assignedRequests = data?.assignedRequests || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-amber-500" />
          <span>Staff Worklist & Operations</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review tickets assigned to you, inspect issue locations, and update resolution notes
        </p>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Complaints"
          value={complaintStats.total_assigned}
          icon={AlertCircle}
          color="indigo"
          subtitle="Your repair assignments"
        />
        <StatCard
          title="In Progress (Complaints)"
          value={complaintStats.in_progress}
          icon={Sparkles}
          color="amber"
          subtitle="Currently working on"
        />
        <StatCard
          title="Assigned Requests"
          value={requestStats.total_assigned}
          icon={FileText}
          color="blue"
          subtitle="Documents & permits"
        />
        <StatCard
          title="Completed Work"
          value={Number(complaintStats.completed) + Number(requestStats.completed)}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Resolved tickets"
        />
      </div>

      {/* Assigned Complaints Worklist */}
      <Card className="!p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Assigned Active Complaints ({assignedComplaints.length})
            </h3>
          </div>
        </div>

        {assignedComplaints.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active complaints currently pending your resolution!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Issue & Description</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignedComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {c.ticket_number}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{c.user_name}</p>
                      <p className="text-[10px] text-slate-400">{c.user_phone || c.user_email}</p>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{c.subject}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.description}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        {c.location}
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
                        onClick={() => openUpdateModal(c, 'complaint')}
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

      {/* Assigned Requests Worklist */}
      <Card className="!p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Assigned Active Service Requests ({assignedRequests.length})
            </h3>
          </div>
        </div>

        {assignedRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active requests waiting for your action.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignedRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {r.request_number}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{r.user_name}</p>
                      <p className="text-[10px] text-slate-400">{r.user_email}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {r.request_type}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                      {r.subject}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={r.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => openUpdateModal(r, 'request')}
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

      {/* Staff Update Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={
          selectedTicket
            ? `Update ${ticketType === 'complaint' ? selectedTicket.ticket_number : selectedTicket.request_number}`
            : 'Update Ticket'
        }
      >
        {selectedTicket && (
          <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Change Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {ticketType === 'complaint' ? (
                  <>
                    <option value="Open">Open</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </>
                ) : (
                  <>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                {ticketType === 'complaint' ? 'Resolution & Work Notes' : 'Administrative Remarks'}
              </label>
              <textarea
                rows={4}
                placeholder="Enter actions taken, parts replaced, or completion notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={updating}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StaffDashboard;
