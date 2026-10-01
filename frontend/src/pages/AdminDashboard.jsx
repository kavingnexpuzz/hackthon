import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  AlertCircle,
  FileText,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Tag,
  Filter,
  Eye,
  Building2,
  Power,
  MapPin,
  Mail,
  Phone,
  Check,
  X,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { StatusBadge, PriorityBadge, Badge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/EmptyState';

const AdminDashboard = () => {
  // Navigation Tabs: Overview, Complaints, Requests, Users, FAQs, Departments
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Staff members for complaint/request assignment dropdowns
  const [staffList, setStaffList] = useState([]);

  // Tab 2: Complaints
  const [adminComplaints, setAdminComplaints] = useState([]);
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintFilterStatus, setComplaintFilterStatus] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignStaffId, setAssignStaffId] = useState('');
  const [updateStatusVal, setUpdateStatusVal] = useState('');
  const [updateNotesVal, setUpdateNotesVal] = useState('');
  const [updatingComplaint, setUpdatingComplaint] = useState(false);

  // Tab 3: Requests
  const [adminRequests, setAdminRequests] = useState([]);
  const [requestSearch, setRequestSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignRequestStaffId, setAssignRequestStaffId] = useState('');
  const [updateRequestStatusVal, setUpdateRequestStatusVal] = useState('');
  const [updateRequestNotesVal, setUpdateRequestNotesVal] = useState('');
  const [updatingRequest, setUpdatingRequest] = useState(false);

  // Tab 4: User Management (Members)
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    department_id: '',
    role: 'student',
    status: 'active',
    password: '',
  });
  const [savingMember, setSavingMember] = useState(false);

  // Tab 5: FAQs (Knowledge Base)
  const [faqsList, setFaqsList] = useState([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({ id: null, question: '', answer: '', category: 'General', keywords: '' });
  const [savingFaq, setSavingFaq] = useState(false);

  // Tab 6: Department Management (Separate Module)
  const [departmentsList, setDepartmentsList] = useState([]);
  const [deptSearch, setDeptSearch] = useState('');
  const [deptFilterStatus, setDeptFilterStatus] = useState('All');
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [viewingDept, setViewingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    id: null,
    department_name: '',
    code: '',
    description: '',
    email: '',
    phone: '',
    whatsapp_number: '',
    head_of_department: '',
    location: 'Main Campus',
    programs_offered: '',
    faculty_count: 15,
    student_count: 320,
    is_active: true,
  });
  const [savingDept, setSavingDept] = useState(false);

  // Fetch overview stats
  const fetchOverviewStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  // Fetch staff list for assignment dropdowns
  const fetchStaffList = async () => {
    try {
      const res = await api.get('/admin/staff');
      if (res.success) {
        setStaffList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  };

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      const params = new URLSearchParams();
      params.append('all', 'true');
      if (complaintFilterStatus !== 'All') params.append('status', complaintFilterStatus);
      if (complaintSearch.trim()) params.append('search', complaintSearch.trim());

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.success) {
        setAdminComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load admin complaints:', err);
    }
  };

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      params.append('all', 'true');
      if (requestSearch.trim()) params.append('search', requestSearch.trim());

      const res = await api.get(`/requests?${params.toString()}`);
      if (res.success) {
        setAdminRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load admin requests:', err);
    }
  };

  // Fetch users (Members)
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch.trim()) params.append('search', userSearch.trim());

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success && res.data) {
        setUsersList(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  // Fetch FAQs
  const fetchFaqs = async () => {
    try {
      const res = await api.get('/faq');
      if (res.success) {
        setFaqsList(res.data.faqs || []);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    }
  };

  // Fetch departments (with member counts)
  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin/departments');
      if (res.success && res.data) {
        setDepartmentsList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchOverviewStats(), fetchStaffList(), fetchDepartments()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeTab === 'complaints') fetchComplaints();
    if (activeTab === 'requests') fetchRequests();
    if (activeTab === 'users') {
      fetchUsers();
      fetchDepartments();
    }
    if (activeTab === 'faqs') fetchFaqs();
    if (activeTab === 'departments') fetchDepartments();
  }, [activeTab, complaintFilterStatus]);

  // Handle complaint update & assignment
  const handleSaveComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdatingComplaint(true);
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/status`, {
        status: updateStatusVal,
        resolution_notes: updateNotesVal,
        assigned_to: assignStaffId || null,
      });
      setSelectedComplaint(null);
      fetchComplaints();
      fetchOverviewStats();
    } catch (err) {
      alert(err.message || 'Failed to update complaint');
    } finally {
      setUpdatingComplaint(false);
    }
  };

  // Handle request update & assignment
  const handleSaveRequest = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setUpdatingRequest(true);
    try {
      await api.patch(`/requests/${selectedRequest.id}/status`, {
        status: updateRequestStatusVal,
        admin_notes: updateRequestNotesVal,
        assigned_to: assignRequestStaffId || null,
      });
      setSelectedRequest(null);
      fetchRequests();
      fetchOverviewStats();
    } catch (err) {
      alert(err.message || 'Failed to update request');
    } finally {
      setUpdatingRequest(false);
    }
  };

  // ==================== USER MANAGEMENT ACTIONS ====================
  const openAddMemberModal = () => {
    setMemberForm({
      name: '',
      email: '',
      department_id: '',
      role: 'student',
      status: 'active',
      password: '',
    });
    setIsAddMemberModalOpen(true);
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.email.trim()) {
      alert('Full Name and Email are required');
      return;
    }
    setSavingMember(true);
    try {
      const res = await api.post('/admin/users', memberForm);
      if (res.success) {
        setIsAddMemberModalOpen(false);
        fetchUsers();
        fetchDepartments();
        fetchOverviewStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to create member');
    } finally {
      setSavingMember(false);
    }
  };

  const openEditMemberModal = (user) => {
    setSelectedMember(user);
    setMemberForm({
      name: user.name,
      email: user.email,
      department_id: user.department_id ? String(user.department_id) : '',
      role: user.role,
      status: user.status,
      password: '',
    });
    setIsEditMemberModalOpen(true);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setSavingMember(true);
    try {
      const res = await api.put(`/admin/users/${selectedMember.id}`, {
        name: memberForm.name,
        email: memberForm.email,
        department_id: memberForm.department_id || null,
        role: memberForm.role,
        status: memberForm.status,
      });
      if (res.success) {
        setIsEditMemberModalOpen(false);
        setSelectedMember(null);
        fetchUsers();
        fetchDepartments();
      }
    } catch (err) {
      alert(err.message || 'Failed to update member');
    } finally {
      setSavingMember(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      if (res.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle member status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete member "${user.name}" (${user.email})?`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/users/${user.id}`);
      if (res.success) {
        fetchUsers();
        fetchDepartments();
        fetchOverviewStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete member');
    }
  };

  // ==================== DEPARTMENT MANAGEMENT ACTIONS ====================
  const openAddDeptModal = () => {
    setDeptForm({
      id: null,
      department_name: '',
      code: '',
      description: '',
      email: '',
      phone: '',
      whatsapp_number: '',
      head_of_department: '',
      location: 'Main Campus',
      programs_offered: '',
      faculty_count: 15,
      student_count: 320,
      is_active: true,
    });
    setIsDeptModalOpen(true);
  };

  const openEditDeptModal = (dept) => {
    setDeptForm({
      id: dept.id,
      department_name: dept.department_name,
      code: dept.code,
      description: dept.description || '',
      email: dept.email,
      phone: dept.phone || '',
      whatsapp_number: dept.whatsapp_number || '',
      head_of_department: dept.head_of_department || '',
      location: dept.location || 'Main Campus',
      programs_offered: dept.programs_offered || '',
      faculty_count: dept.faculty_count !== undefined ? dept.faculty_count : 15,
      student_count: dept.student_count !== undefined ? dept.student_count : 320,
      is_active: Boolean(dept.is_active),
    });
    setIsDeptModalOpen(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.department_name.trim() || !deptForm.code.trim() || !deptForm.email.trim()) {
      alert('Department Name, Code, and Email are required');
      return;
    }
    setSavingDept(true);
    try {
      if (deptForm.id) {
        await api.put(`/admin/departments/${deptForm.id}`, deptForm);
      } else {
        await api.post('/admin/departments', deptForm);
      }
      setIsDeptModalOpen(false);
      fetchDepartments();
      fetchOverviewStats();
    } catch (err) {
      alert(err.message || 'Failed to save department');
    } finally {
      setSavingDept(false);
    }
  };

  const handleToggleDeptStatus = async (deptId) => {
    try {
      const res = await api.patch(`/admin/departments/${deptId}/status`);
      if (res.success) {
        fetchDepartments();
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle department status');
    }
  };

  const handleDeleteDepartment = async (dept) => {
    if (
      !window.confirm(
        `Are you sure you want to delete department "${dept.department_name}"? Assigned members will have their department safely reset to unassigned.`
      )
    ) {
      return;
    }
    try {
      const res = await api.delete(`/admin/departments/${dept.id}`);
      if (res.success) {
        fetchDepartments();
        fetchUsers();
        fetchOverviewStats();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete department');
    }
  };

  // ==================== FAQ ACTIONS ====================
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    setSavingFaq(true);
    try {
      if (faqForm.id) {
        await api.put(`/faq/${faqForm.id}`, faqForm);
      } else {
        await api.post('/faq', faqForm);
      }
      setIsFaqModalOpen(false);
      setFaqForm({ id: null, question: '', answer: '', category: 'General', keywords: '' });
      fetchFaqs();
    } catch (err) {
      alert(err.message || 'Failed to save FAQ');
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ entry?')) return;
    try {
      await api.delete(`/faq/${id}`);
      fetchFaqs();
    } catch (err) {
      alert(err.message || 'Failed to delete FAQ');
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading admin console metrics..." />;
  }

  const uStats = stats?.users || {};
  const cStats = stats?.complaints || {};
  const rStats = stats?.requests || {};
  const categories = stats?.categoryDistribution || [];

  // Filter departments by search & status
  const filteredDepartments = departmentsList.filter((d) => {
    const matchesStatus =
      deptFilterStatus === 'All' ||
      (deptFilterStatus === 'Active' && d.is_active) ||
      (deptFilterStatus === 'Inactive' && !d.is_active);
    if (!matchesStatus) return false;

    if (!deptSearch.trim()) return true;
    const q = deptSearch.toLowerCase();
    return (
      d.department_name?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.head_of_department?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.programs_offered?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Administrator Control Center</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            System-wide operations, staff dispatch, user roles, and organizational knowledge base
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Top Navigation: Overview | Complaints | Requests | Users | FAQs | Departments) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: Shield },
          { id: 'complaints', label: 'All Complaints', icon: AlertCircle },
          { id: 'requests', label: 'All Requests', icon: FileText },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'faqs', label: 'Knowledge Base (FAQs)', icon: BookOpen },
          { id: 'departments', label: 'Departments', icon: Building2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ==================== TAB 1: OVERVIEW METRICS ==================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={uStats.total_users || 0}
              icon={Users}
              color="indigo"
              subtitle={`${uStats.total_students || 0} students, ${uStats.total_staff || 0} staff`}
            />
            <StatCard
              title="Total Complaints"
              value={cStats.total_complaints || 0}
              icon={AlertCircle}
              color="rose"
              subtitle={`${cStats.open_complaints || 0} open, ${cStats.in_progress_complaints || 0} active`}
            />
            <StatCard
              title="Resolved Complaints"
              value={cStats.resolved_complaints || 0}
              icon={CheckCircle2}
              color="emerald"
              subtitle={`${cStats.closed_complaints || 0} archived`}
            />
            <StatCard
              title="Total Requests"
              value={rStats.total_requests || 0}
              icon={FileText}
              color="blue"
              subtitle={`${rStats.pending_requests || 0} pending, ${rStats.completed_requests || 0} completed`}
            />
          </div>

          {/* Visual Distribution Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                <span>Complaints by Department Category</span>
              </h3>

              <div className="space-y-3">
                {categories.map((cat) => {
                  const percent = Math.min(
                    100,
                    Math.round((cat.count / (cStats.total_complaints || 1)) * 100)
                  );
                  return (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {cat.category}
                        </span>
                        <span className="text-slate-400">
                          {cat.count} tickets ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                <span>Campus Departments & Headcount</span>
              </h3>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {departmentsList.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {d.department_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">[{d.code}]</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
                      {d.member_count || 0} members
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: COMPLAINTS MANAGEMENT ==================== */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <Card className="!p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search ticket #, student, roll number, issue, or location..."
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <select
                value={complaintFilterStatus}
                onChange={(e) => setComplaintFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {['All', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'].map(
                  (s) => (
                    <option key={s} value={s}>
                      Status: {s}
                    </option>
                  )
                )}
              </select>
            </div>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Student / User</th>
                    <th className="py-3 px-4">Subject & Location</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Staff</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adminComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
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
                        <p className="text-[11px] text-slate-400">
                          {c.location} &bull; {c.category || c.department_name || ''}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4">
                        {c.staff_name ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {c.staff_name}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setAssignStaffId(c.assigned_to || '');
                            setUpdateStatusVal(c.status);
                            setUpdateNotesVal(c.resolution_notes || '');
                          }}
                        >
                          Manage Ticket
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ==================== TAB 3: REQUESTS MANAGEMENT ==================== */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <Card className="!p-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search request #, applicant, or subject..."
                value={requestSearch}
                onChange={(e) => setRequestSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchRequests()}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Request #</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {adminRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
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
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 px-4">
                        {r.staff_name ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {r.staff_name}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(r);
                            setAssignRequestStaffId(r.assigned_to || '');
                            setUpdateRequestStatusVal(r.status);
                            setUpdateRequestNotesVal(r.admin_notes || '');
                          }}
                        >
                          Manage Request
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ==================== TAB 4: USER MANAGEMENT (MEMBERS) ==================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <Card className="!p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex-1 relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or department..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Add Member Button */}
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={openAddMemberModal}
                className="w-full sm:w-auto flex-shrink-0"
              >
                Add Member
              </Button>
            </div>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Role Authorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No members found matching your search.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {u.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {u.department_name || u.department || 'General'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              u.role === 'admin'
                                ? 'purple'
                                : u.role === 'staff'
                                ? 'amber'
                                : 'slate'
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 font-semibold ${
                              u.status === 'active' ? 'text-emerald-500' : 'text-slate-400'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'
                              }`}
                            />
                            <span className="capitalize">{u.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Member */}
                            <button
                              title="View Details"
                              onClick={() => setViewingMember(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit Member */}
                            <button
                              title="Edit Member"
                              onClick={() => openEditMemberModal(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Activate / Deactivate Member */}
                            <button
                              title={u.status === 'active' ? 'Deactivate Member' : 'Activate Member'}
                              onClick={() => handleToggleUserStatus(u.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.status === 'active'
                                  ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Delete Member */}
                            <button
                              title="Delete Member"
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ==================== TAB 5: KNOWLEDGE BASE (FAQs) ==================== */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <Card className="!p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Institutional Knowledge Base ({faqsList.length} FAQs)
              </h3>
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => {
                  setFaqForm({ id: null, question: '', answer: '', category: 'General', keywords: '' });
                  setIsFaqModalOpen(true);
                }}
              >
                Add FAQ
              </Button>
            </div>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Question</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Keywords</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {faqsList.map((faq) => (
                    <tr key={faq.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 max-w-sm">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{faq.question}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{faq.answer}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                          {faq.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                        {faq.keywords || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Edit FAQ"
                            onClick={() => {
                              setFaqForm(faq);
                              setIsFaqModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Delete FAQ"
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ==================== TAB 6: DEPARTMENT MANAGEMENT (SEPARATE MODULE) ==================== */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <Card className="!p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex-1 relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search department by name, code, head, or location..."
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Add Department Button */}
              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={openAddDeptModal}
                className="w-full sm:w-auto flex-shrink-0"
              >
                Add Department
              </Button>
            </div>
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Department Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Assigned Members</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Head / Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No departments found. Click "Add Department" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredDepartments.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">
                            {d.department_name}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                            {d.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              {d.member_count || 0} {d.member_count === 1 ? 'member' : 'members'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          <p className="flex items-center gap-1 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{d.email}</span>
                          </p>
                          {d.phone && (
                            <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{d.phone}</span>
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          <p className="font-medium">{d.head_of_department || '—'}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-indigo-500" />
                            <span>{d.location || 'Main Campus'}</span>
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 font-semibold ${
                              d.is_active ? 'text-emerald-500' : 'text-slate-400'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                d.is_active ? 'bg-emerald-500' : 'bg-slate-500'
                              }`}
                            />
                            <span>{d.is_active ? 'Active' : 'Inactive'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Department */}
                            <button
                              title="View Department Details"
                              onClick={() => setViewingDept(d)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit Department */}
                            <button
                              title="Edit Department"
                              onClick={() => openEditDeptModal(d)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Toggle Department Status */}
                            <button
                              title={d.is_active ? 'Deactivate Department' : 'Activate Department'}
                              onClick={() => handleToggleDeptStatus(d.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                d.is_active
                                  ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Delete Department */}
                            <button
                              title="Delete Department"
                              onClick={() => handleDeleteDepartment(d)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* 1. Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add New Member"
      >
        <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
          <Input
            label="Full Name *"
            placeholder="e.g. John Doe"
            value={memberForm.name}
            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. john@campus.edu"
            value={memberForm.email}
            onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Department *
            </label>
            <select
              value={memberForm.department_id}
              onChange={(e) => setMemberForm({ ...memberForm, department_id: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">-- Select Active Department --</option>
              {departmentsList
                .filter((d) => d.is_active)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name} ({d.code})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Role *
              </label>
              <select
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="employee">Employee</option>
                <option value="staff">Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Status *
              </label>
              <select
                value={memberForm.status}
                onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <Input
            label="Initial Password (Optional)"
            type="password"
            placeholder="Default is Password@123"
            value={memberForm.password}
            onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingMember}>
              Create Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Edit Member Modal */}
      <Modal
        isOpen={isEditMemberModalOpen}
        onClose={() => setIsEditMemberModalOpen(false)}
        title={selectedMember ? `Edit Member — ${selectedMember.name}` : 'Edit Member'}
      >
        <form onSubmit={handleUpdateMember} className="space-y-4 text-xs">
          <Input
            label="Full Name *"
            value={memberForm.name}
            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            value={memberForm.email}
            onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Department
            </label>
            <select
              value={memberForm.department_id}
              onChange={(e) => setMemberForm({ ...memberForm, department_id: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">-- No Department Assigned --</option>
              {departmentsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name} ({d.code}) {!d.is_active && '[Inactive]'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Role *
              </label>
              <select
                value={memberForm.role}
                onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="student">Student</option>
                <option value="employee">Employee</option>
                <option value="staff">Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Status *
              </label>
              <select
                value={memberForm.status}
                onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsEditMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingMember}>
              Save Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. View Member Modal */}
      <Modal
        isOpen={Boolean(viewingMember)}
        onClose={() => setViewingMember(null)}
        title="Member Information"
      >
        {viewingMember && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                {viewingMember.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {viewingMember.name}
                </h3>
                <p className="text-slate-400 text-xs">{viewingMember.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      viewingMember.role === 'admin'
                        ? 'purple'
                        : viewingMember.role === 'staff'
                        ? 'amber'
                        : 'slate'
                    }
                  >
                    {viewingMember.role}
                  </Badge>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                      viewingMember.status === 'active' ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        viewingMember.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                    <span className="capitalize">{viewingMember.status}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Department
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {viewingMember.department_name || viewingMember.department || 'General'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Account Created
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {new Date(viewingMember.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setViewingMember(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 4. Add / Edit Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={deptForm.id ? `Edit Department — ${deptForm.department_name}` : 'Add New Department'}
      >
        <form onSubmit={handleSaveDepartment} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Department Name *"
              placeholder="e.g. Information Technology"
              value={deptForm.department_name}
              onChange={(e) => setDeptForm({ ...deptForm, department_name: e.target.value })}
              required
            />

            <Input
              label="Department Code *"
              placeholder="e.g. IT"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Department Email *"
              type="email"
              placeholder="e.g. it.support@campus.edu"
              value={deptForm.email}
              onChange={(e) => setDeptForm({ ...deptForm, email: e.target.value })}
              required
            />

            <Input
              label="Contact Phone"
              placeholder="e.g. +1-555-0199"
              value={deptForm.phone}
              onChange={(e) => setDeptForm({ ...deptForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Head of Department"
              placeholder="e.g. Dr. Robert Vance"
              value={deptForm.head_of_department}
              onChange={(e) => setDeptForm({ ...deptForm, head_of_department: e.target.value })}
            />

            <Input
              label="Campus Location"
              placeholder="e.g. Tech Block 3rd Floor"
              value={deptForm.location}
              onChange={(e) => setDeptForm({ ...deptForm, location: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="dept_active_check"
              checked={deptForm.is_active}
              onChange={(e) => setDeptForm({ ...deptForm, is_active: e.target.checked })}
              className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="dept_active_check" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Active Department (Available for member assignments & complaint dispatch)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingDept}>
              {deptForm.id ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. View Department Modal */}
      <Modal
        isOpen={Boolean(viewingDept)}
        onClose={() => setViewingDept(null)}
        title="Department Details"
      >
        {viewingDept && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {viewingDept.department_name}
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-bold border border-purple-200 dark:border-purple-800/60">
                    {viewingDept.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{viewingDept.location || 'Main Campus'}</span>
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 font-semibold text-xs ${
                  viewingDept.is_active ? 'text-emerald-500' : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    viewingDept.is_active ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                />
                <span>{viewingDept.is_active ? 'Active' : 'Inactive'}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Personnel
                </span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5 block">
                  {viewingDept.member_count || 0} Members
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Head of Department
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {viewingDept.head_of_department || 'Not Assigned'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Contacts
              </span>
              <p className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{viewingDept.email}</span>
              </p>
              {viewingDept.phone && (
                <p className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingDept.phone}</span>
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setViewingDept(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 6. Complaint Management Modal */}
      <Modal
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        title={selectedComplaint ? `Manage ${selectedComplaint.ticket_number}` : 'Manage Ticket'}
      >
        {selectedComplaint && (
          <form onSubmit={handleSaveComplaint} className="space-y-4 text-xs">
            <div>
              <span className="font-semibold text-slate-500 block mb-1">Issue Details</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {selectedComplaint.problem || selectedComplaint.subject}
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Student: {selectedComplaint.student_name || selectedComplaint.user_name || 'N/A'} (
                {selectedComplaint.roll_number || 'N/A'}) &bull; Location: {selectedComplaint.location}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Assign Staff Technician
                </label>
                <select
                  value={assignStaffId}
                  onChange={(e) => setAssignStaffId(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department_name || s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={updateStatusVal}
                  onChange={(e) => setUpdateStatusVal(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                Resolution & Work Notes
              </label>
              <textarea
                rows={3}
                placeholder="Log repairs, parts replaced, or inspection comments..."
                value={updateNotesVal}
                onChange={(e) => setUpdateNotesVal(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setSelectedComplaint(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={updatingComplaint}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 7. Request Management Modal */}
      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={selectedRequest ? `Manage ${selectedRequest.request_number}` : 'Manage Request'}
      >
        {selectedRequest && (
          <form onSubmit={handleSaveRequest} className="space-y-4 text-xs">
            <div>
              <span className="font-semibold text-slate-500 block mb-1">Request Details</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">{selectedRequest.subject}</p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{selectedRequest.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Assign Officer
                </label>
                <select
                  value={assignRequestStaffId}
                  onChange={(e) => setAssignRequestStaffId(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department_name || s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={updateRequestStatusVal}
                  onChange={(e) => setUpdateRequestStatusVal(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {['Pending', 'In Progress', 'Completed', 'Rejected'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                Administrative Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Certificate issued, approved, or rejection reason..."
                value={updateRequestNotesVal}
                onChange={(e) => setUpdateRequestNotesVal(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={updatingRequest}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 8. FAQ Create/Edit Modal */}
      <Modal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        title={faqForm.id ? 'Edit FAQ Entry' : 'Create Knowledge Base Entry'}
      >
        <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
          <Input
            label="Question"
            placeholder="e.g. When does the campus health center close?"
            value={faqForm.question}
            onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              placeholder="e.g. Library, Academic, IT"
              value={faqForm.category}
              onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
            />

            <Input
              label="Keywords (comma separated)"
              placeholder="e.g. timings, open, health"
              value={faqForm.keywords}
              onChange={(e) => setFaqForm({ ...faqForm, keywords: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Verified Organization Answer
            </label>
            <textarea
              rows={4}
              placeholder="Provide exact policy, location, working hours, and contact details..."
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsFaqModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={savingFaq}>
              Save FAQ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
