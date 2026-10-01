import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Bot,
  Building2,
  User,
  Hash,
  MapPin,
  Tag,
  Mail,
  Phone,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { StatusBadge, PriorityBadge } from '../common/Badge';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electrical Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Commerce & Management',
  'Science & Humanities',
  'Other',
];

const ComplaintModal = ({ isOpen, onClose, prefillData }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Student ID, 2: Complaint Info, 3: AI Analysis, 4: Success

  // Form State
  const [formData, setFormData] = useState({
    roll_number: '',
    student_name: '',
    student_department: 'Computer Science',
    student_email: '',
    student_phone: '',
    problem: '',
    location: '',
    priority: 'Medium',
    additional_details: '',
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [error, setError] = useState('');

  // Handle pre-fill from chat detection
  useEffect(() => {
    if (prefillData) {
      setFormData((prev) => ({
        ...prev,
        problem: prefillData.problem || prev.problem,
        location: prefillData.location || prev.location,
        priority: prefillData.priority || prev.priority,
      }));
    }
  }, [prefillData, isOpen]);

  // Reset when closed
  const handleClose = () => {
    setStep(1);
    setAiAnalysis(null);
    setCreatedTicket(null);
    setError('');
    onClose();
  };

  // Step 1 Validation
  const handleNextToComplaintInfo = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.roll_number.trim() || !formData.student_name.trim() || !formData.student_department.trim()) {
      setError('Please provide your Roll Number, Name, and Department to proceed.');
      return;
    }
    setStep(2);
  };

  // Step 2: Trigger AI Analysis
  const handleAnalyzeWithAI = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.problem.trim() || !formData.location.trim()) {
      setError('Please provide the problem description and location on campus.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await api.post('/complaints/analyze', {
        problem: formData.problem,
        location: formData.location,
        priority: formData.priority,
        additionalDetails: formData.additional_details,
      });

      if (res.success && res.data) {
        setAiAnalysis(res.data);
        setStep(3);
      }
    } catch (err) {
      console.warn('AI analysis fallback:', err);
      // Fallback analysis
      setAiAnalysis({
        category: 'IT Equipment',
        department_name: 'IT Support',
        priority: formData.priority,
        summary: `${formData.problem} at ${formData.location}`,
        suggested_action: 'Technical inspection and maintenance dispatch required.',
      });
      setStep(3);
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 3: Final Submission
  const handleSubmitComplaint = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/complaints', {
        ...formData,
        ai_analysis: aiAnalysis,
      });

      if (res.success && res.data) {
        setCreatedTicket(res.data);
        setStep(4);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 4
          ? 'Complaint Registered Successfully'
          : `Register Student Complaint — Step ${step} of 3`
      }
      maxWidth="max-w-2xl"
    >
      {/* Step Progress Indicators */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          {[
            { s: 1, title: 'Identification' },
            { s: 2, title: 'Problem Details' },
            { s: 3, title: 'AI Routing Review' },
          ].map((item) => (
            <div key={item.s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === item.s
                    ? 'bg-indigo-600 text-white'
                    : step > item.s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {step > item.s ? '✓' : item.s}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  step === item.s ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                }`}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* STEP 1: Student Identification */}
      {step === 1 && (
        <form onSubmit={handleNextToComplaintInfo} className="space-y-4 text-xs">
          <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 mb-2">
            <p className="text-xs text-indigo-900 dark:text-indigo-300 font-medium">
              No password required! Simply enter your student details to register your issue.
            </p>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  roll_number: '23CS001',
                  student_name: 'Kavin Kumar',
                  student_department: 'Computer Science',
                  student_email: 'kavin@campus.edu',
                  student_phone: '+1-555-0199',
                }))
              }
              className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all"
            >
              Demo Fill
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Roll Number *"
              icon={Hash}
              placeholder="e.g. 23CS001"
              value={formData.roll_number}
              onChange={(e) => setFormData({ ...formData, roll_number: e.target.value.toUpperCase() })}
              required
            />

            <Input
              label="Student Full Name *"
              icon={User}
              placeholder="e.g. Kavin Kumar"
              value={formData.student_name}
              onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Student Department *
            </label>
            <select
              value={formData.student_department}
              onChange={(e) => setFormData({ ...formData, student_department: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address (Optional)"
              type="email"
              icon={Mail}
              placeholder="kavin@campus.edu"
              value={formData.student_email}
              onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
            />

            <Input
              label="WhatsApp / Phone (Optional)"
              icon={Phone}
              placeholder="+1-555-0199"
              value={formData.student_phone}
              onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={ArrowRight}>
              Continue to Complaint Details
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: Complaint Information */}
      {step === 2 && (
        <form onSubmit={handleAnalyzeWithAI} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Problem / Complaint *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Projector lamp is flickering and has no HDMI signal during morning lectures"
              value={formData.problem}
              onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            />
          </div>

          <Input
            label="Location on Campus *"
            icon={MapPin}
            placeholder="e.g. CSE Block Room 204, Library 2nd Floor, Seminar Hall A"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Select Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Medium', 'High', 'Critical'].map((pri) => (
                <button
                  key={pri}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: pri })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    formData.priority === pri
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
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
              Additional Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Needs immediate replacement before 2:00 PM lecture"
              value={formData.additional_details}
              onChange={(e) => setFormData({ ...formData, additional_details: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" variant="primary" icon={Sparkles} isLoading={analyzing}>
              Analyze with Gemini AI
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: Gemini Analysis Review */}
      {step === 3 && aiAnalysis && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-50 via-purple-50 to-indigo-50/30 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Gemini AI Complaint Routing Analysis</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Identified Category
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {aiAnalysis.category}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Routed Department
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                  {aiAnalysis.department_name}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                AI Summary & Assessment
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {aiAnalysis.summary}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Recommended Action
              </span>
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                {aiAnalysis.suggested_action}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1 text-slate-600 dark:text-slate-400">
            <div>Student: <strong>{formData.student_name}</strong> (Roll: {formData.roll_number})</div>
            <div>Location: <strong>{formData.location}</strong></div>
            <div>Problem: {formData.problem}</div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(2)}>
              Edit Info
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={handleSubmitComplaint}
              isLoading={submitting}
            >
              Submit Complaint & Dispatch
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Success & Confirmation */}
      {step === 4 && createdTicket && (
        <div className="text-center py-4 space-y-5 text-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Complaint Registered Successfully!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Your issue has been logged into MySQL and routed to the responsible department.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 max-w-md mx-auto space-y-3 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Ticket Number:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                {createdTicket.ticket_number}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Assigned Department:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {createdTicket.department_name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status:</span>
              <StatusBadge status="Open" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Department Email:</span>
              <span className="text-emerald-600 font-semibold">{createdTicket.email_status}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">WhatsApp Alert:</span>
              <span className="text-emerald-600 font-semibold">{createdTicket.whatsapp_status}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Close
            </Button>
            <Button
              variant="primary"
              icon={ExternalLink}
              onClick={() => {
                handleClose();
                navigate(`/track?ticket=${createdTicket.ticket_number}&roll=${formData.roll_number}`);
              }}
            >
              Track Complaint Status
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ComplaintModal;
