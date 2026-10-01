import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  MessageSquare,
  Send,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/EmptyState';

const REQUEST_TYPES = [
  'All',
  'Bonafide Certificate',
  'ID Card',
  'Course Certificate',
  'Permission Request',
  'Leave Request',
  'Document Request',
  'Hostel Request',
  'Transport Request',
  'Other',
];

const STATUSES = ['All', 'Pending', 'In Progress', 'Completed', 'Rejected'];

const Requests = () => {
  const { user, role, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // New Request Modal
  const [isCreateOpen, setIsCreateOpen] = useState(searchParams.get('action') === 'new');
  const [newRequest, setNewRequest] = useState({
    request_type: 'Bonafide Certificate',
    subject: '',
    description: '',
    priority: 'Medium',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Request Detail Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Staff/Admin updates
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (typeFilter !== 'All') params.append('type', typeFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/requests?${params.toString()}`);
      if (res.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    const detailId = searchParams.get('id');
    if (detailId) {
      loadRequestDetails(detailId);
    }
  }, [searchParams]);

  const loadRequestDetails = async (id) => {
    try {
      const res = await api.get(`/requests/${id}`);
      if (res.success) {
        setSelectedRequest(res.data.request);
        setComments(res.data.comments || []);
        setStatusToUpdate(res.data.request.status);
        setAdminNotes(res.data.request.admin_notes || '');
      }
    } catch (err) {
      console.error('Failed to load request details:', err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newRequest.description) {
      setCreateError('Please provide details for your service request');
      return;
    }

    setCreateLoading(true);
    try {
      const res = await api.post('/requests', newRequest);
      if (res.success) {
        setIsCreateOpen(false);
        setNewRequest({
          request_type: 'Bonafide Certificate',
          subject: '',
          description: '',
          priority: 'Medium',
        });
        fetchRequests();
        refreshProfile();
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to submit request');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedRequest) return;

    setCommentLoading(true);
    try {
      const res = await api.post(`/requests/${selectedRequest.id}/comments`, {
        comment: newComment.trim(),
      });
      if (res.success) {
        setComments((prev) => [...prev, res.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/requests/${selectedRequest.id}/status`, {
        status: statusToUpdate,
        admin_notes: adminNotes,
      });
      if (res.success) {
        setSelectedRequest((prev) => ({
          ...prev,
          status: statusToUpdate,
          admin_notes: adminNotes,
        }));
        fetchRequests();
        refreshProfile();
      }
    } catch (err) {
      alert(err.message || 'Failed to update request status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Service Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Apply for bonafide certificates, ID card re-issues, hostel rooms, and permits
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
          size="md"
        >
          New Service Request
        </Button>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchRequests();
            }}
            className="flex-1 relative"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by request # or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {REQUEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  Type: {t}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading service requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No service requests"
            description="You don't have any submitted service requests matching criteria."
            actionLabel="Submit Request"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Request #</th>
                  <th className="py-3 px-4">Service Type</th>
                  <th className="py-3 px-4">Subject & Description</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Officer</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => loadRequestDetails(r.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {r.request_number}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {r.request_type}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {r.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {r.description}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={r.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {r.staff_name ? (
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {r.staff_name}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                        Details →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* New Request Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Apply for Service Request"
      >
        {createError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs">
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Service Type
            </label>
            <select
              value={newRequest.request_type}
              onChange={(e) => setNewRequest({ ...newRequest, request_type: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {REQUEST_TYPES.filter((t) => t !== 'All').map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Subject Summary"
            placeholder="e.g. Bonafide for Passport verification"
            value={newRequest.subject}
            onChange={(e) => setNewRequest({ ...newRequest, subject: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Medium', 'High'].map((pri) => (
                <button
                  key={pri}
                  type="button"
                  onClick={() => setNewRequest({ ...newRequest, priority: pri })}
                  className={`py-2 text-xs rounded-xl border font-medium transition-all ${
                    newRequest.priority === pri
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {pri}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Application Details & Purpose
            </label>
            <textarea
              rows={4}
              placeholder="State the purpose of request, course details, roll number, or reason..."
              value={newRequest.description}
              onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createLoading}>
              Submit Service Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Detail Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title={selectedRequest ? `Request: ${selectedRequest.request_number}` : 'Request Details'}
        maxWidth="max-w-2xl"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Service Type
                </span>
                <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedRequest.request_type}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Processing Officer
                </span>
                <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {selectedRequest.staff_name || 'Pending assignment'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Subject
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedRequest.subject}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Application Details
                </span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800">
                  {selectedRequest.description}
                </div>
              </div>

              {selectedRequest.admin_notes && (
                <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-700 dark:text-indigo-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Administrative Remarks</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {selectedRequest.admin_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Staff/Admin Controls */}
            {(role === 'staff' || role === 'admin') && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                  Update Request Status & Remarks
                </h4>
                <div className="flex items-center gap-2">
                  <select
                    value={statusToUpdate}
                    onChange={(e) => setStatusToUpdate(e.target.value)}
                    className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    {STATUSES.filter((s) => s !== 'All').map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Add approval / processing notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="flex-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />

                  <Button
                    size="xs"
                    variant="primary"
                    onClick={handleStatusUpdate}
                    isLoading={updatingStatus}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Comment Timeline */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>Discussion & Queries ({comments.length})</span>
              </h4>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No comments yet on this request.
                  </p>
                ) : (
                  comments.map((cm) => (
                    <div
                      key={cm.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {cm.user_name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(cm.created_at).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{cm.comment}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Ask a question or add a clarification..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={!newComment.trim() || commentLoading}
                  isLoading={commentLoading}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Requests;
