import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Tag,
  User,
  MessageSquare,
  CheckCircle2,
  X,
  Send,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/EmptyState';

const CATEGORIES = [
  'All',
  'IT',
  'Network',
  'Electrical',
  'Plumbing',
  'Classroom Equipment',
  'Maintenance',
  'Security',
  'Other',
];

const STATUSES = ['All', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];

const Complaints = () => {
  const { user, role, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // New Complaint Modal
  const [isCreateOpen, setIsCreateOpen] = useState(searchParams.get('action') === 'new');
  const [newComplaint, setNewComplaint] = useState({
    category: 'Classroom Equipment',
    subject: '',
    location: '',
    priority: 'Medium',
    description: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Complaint Detail Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Status Update state for Staff/Admin in Detail modal
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (priorityFilter !== 'All') params.append('priority', priorityFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.success) {
        setComplaints(res.data.complaints || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter]);

  // Open detail if query param exists
  useEffect(() => {
    const detailId = searchParams.get('id');
    if (detailId) {
      loadComplaintDetails(detailId);
    }
  }, [searchParams]);

  const loadComplaintDetails = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.success) {
        setSelectedComplaint(res.data.complaint);
        setComments(res.data.comments || []);
        setStatusToUpdate(res.data.complaint.status);
        setResolutionNotes(res.data.complaint.resolution_notes || '');
      }
    } catch (err) {
      console.error('Failed to load complaint details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newComplaint.description || !newComplaint.location) {
      setCreateError('Please provide both a description and location');
      return;
    }

    setCreateLoading(true);
    try {
      const res = await api.post('/complaints', newComplaint);
      if (res.success) {
        setIsCreateOpen(false);
        setNewComplaint({
          category: 'Classroom Equipment',
          subject: '',
          location: '',
          priority: 'Medium',
          description: '',
        });
        fetchComplaints();
        refreshProfile();
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create complaint');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedComplaint) return;

    setCommentLoading(true);
    try {
      const res = await api.post(`/complaints/${selectedComplaint.id}/comments`, {
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
    if (!selectedComplaint) return;
    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/complaints/${selectedComplaint.id}/status`, {
        status: statusToUpdate,
        resolution_notes: resolutionNotes,
      });
      if (res.success) {
        setSelectedComplaint((prev) => ({
          ...prev,
          status: statusToUpdate,
          resolution_notes: resolutionNotes,
        }));
        fetchComplaints();
        refreshProfile();
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
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
            Complaint Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track, report, and monitor facility & technical issues
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
          size="md"
        >
          New Complaint
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="!p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket #, subject, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </form>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
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

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  Priority: {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Complaints Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Fetching complaints from MySQL..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints found"
            description="Try adjusting your search criteria or register a new complaint ticket."
            actionLabel="Register Complaint"
            onAction={() => setIsCreateOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket Number</th>
                  <th className="py-3 px-4">Subject & Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Staff</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => loadComplaintDetails(c.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {c.ticket_number}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {c.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {c.description}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {c.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                      {c.location}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {c.staff_name ? (
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {c.staff_name}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()}
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

      {/* New Complaint Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Complaint"
      >
        {createError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs">
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <select
              value={newComplaint.category}
              onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Location (Room / Building)"
            placeholder="e.g. CSE Block Room 204, Library 2nd Floor"
            value={newComplaint.location}
            onChange={(e) => setNewComplaint({ ...newComplaint, location: e.target.value })}
            required
          />

          <Input
            label="Subject Summary"
            placeholder="Brief title of the issue"
            value={newComplaint.subject}
            onChange={(e) => setNewComplaint({ ...newComplaint, subject: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Medium', 'High', 'Critical'].map((pri) => (
                <button
                  key={pri}
                  type="button"
                  onClick={() => setNewComplaint({ ...newComplaint, priority: pri })}
                  className={`py-2 text-xs rounded-xl border font-medium transition-all ${
                    newComplaint.priority === pri
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
              Detailed Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe what went wrong, symptoms, and urgency..."
              value={newComplaint.description}
              onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createLoading}>
              Submit Complaint
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complaint Detail Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={selectedComplaint ? `Ticket: ${selectedComplaint.ticket_number}` : 'Complaint Details'}
        maxWidth="max-w-2xl"
      >
        {selectedComplaint && (
          <div className="space-y-6">
            {/* Status & Priority Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Current Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={selectedComplaint.status} />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Priority
                </span>
                <div className="mt-1">
                  <PriorityBadge priority={selectedComplaint.priority} />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Assigned Staff
                </span>
                <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {selectedComplaint.staff_name || 'Unassigned'}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Subject
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedComplaint.subject}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Description
                </span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800">
                  {selectedComplaint.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Location
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    {selectedComplaint.location}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Category
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-medium">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    {selectedComplaint.category}
                  </p>
                </div>
              </div>

              {selectedComplaint.resolution_notes && (
                <div className="mt-2 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolution Summary</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">
                    {selectedComplaint.resolution_notes}
                  </p>
                  {selectedComplaint.resolved_at && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Resolved on: {new Date(selectedComplaint.resolved_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Staff / Admin Controls */}
            {(role === 'staff' || role === 'admin') && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                  Update Ticket Status & Notes (Staff/Admin)
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
                    placeholder="Add resolution notes..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="flex-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />

                  <Button
                    size="xs"
                    variant="primary"
                    onClick={handleStatusUpdate}
                    isLoading={updatingStatus}
                  >
                    Save Status
                  </Button>
                </div>
              </div>
            )}

            {/* Activity Comments Timeline */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span>Ticket Discussion ({comments.length})</span>
              </h4>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No comments yet on this ticket.
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

              {/* Add comment input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Post an update or question..."
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

export default Complaints;
