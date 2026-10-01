import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  AlertTriangle,
  BookOpen,
  Clock,
  Search,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  Shield,
  HelpCircle,
  Building2,
  Bus,
  Library,
  Zap,
  PhoneCall,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import api from '../services/api';
import Button from '../components/common/Button';
import TypingIndicator from '../components/chat/TypingIndicator';
import ComplaintModal from '../components/complaint/ComplaintModal';

const SUGGESTED_PROMPTS = [
  { label: 'Available Courses', icon: BookOpen, text: 'What courses are offered at VET Institute?' },
  { label: 'College Timings', icon: Clock, text: 'What are the college working hours and class timings?' },
  { label: 'Library Facilities', icon: Library, text: 'What are the library timings and book borrowing rules?' },
  { label: 'Hostel Accommodation', icon: Building2, text: 'Tell me about the hostel facilities, mess timings, and fees.' },
  { label: 'Report Projector Issue', icon: AlertTriangle, text: 'The projector in CSE Block Room 204 is broken and not turning on.' },
  { label: 'Transport & Bus Routes', icon: Bus, text: 'What are the college bus routes and transport timings?' },
];

const INITIAL_MESSAGE = {
  id: 'welcome',
  sender: 'ai',
  text:
    "Hello! Welcome to **VET Institute of Arts and Science**. I am your **Autonomous AI College Assistant**.\n\nAsk me anything about our **degree programs, admissions, campus timings, library, hostel, or transport**—or simply tell me if you have a **classroom, electrical, IT, or facility problem to report**!",
  createdAt: new Date().toISOString(),
};

const PublicHome = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);

  // Complaint Modal state
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintPrefill, setComplaintPrefill] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: text.trim(),
        sessionId,
      });

      if (res.success && res.data) {
        const { response, intent, showComplaintPrompt, extractedComplaint } = res.data;

        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response,
          intent,
          showComplaintPrompt,
          extractedComplaint,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'The AI assistant is temporarily unreachable. Please verify your connection or try again.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRegisterComplaintClick = (extracted) => {
    setComplaintPrefill(extracted);
    setIsComplaintModalOpen(true);
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="aurora-bg" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
              VET Institute Autonomous AI Helpdesk
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Smart Campus Inquiries &{' '}
            <span className="gradient-text">Instant Issue Resolution</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Ask anything about our admissions, degree programs, campus facilities, or report maintenance and technical issues directly to institutional departments.
          </p>
        </div>

        {/* AI Chat Card Container */}
        <div className="glass-card rounded-3xl shadow-2xl shadow-indigo-500/10 dark:shadow-none overflow-hidden flex flex-col h-[620px] transition-all border border-slate-200/90 dark:border-slate-800">
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-slate-200/70 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ44vhfTgtbILqr4iyuXaATJkCOpUtfW0JfUQXbrIgImQ&s=10"
                  alt="VET Logo"
                  className="w-10 h-10 rounded-2xl object-contain bg-white p-1 border border-slate-200 dark:border-slate-700 shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    VET Institute AI Assistant
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Real-time MySQL Knowledge Base & Automatic Ticket Dispatch
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 animate-in fade-in duration-200 ${
                    isAi ? '' : 'flex-row-reverse'
                  }`}
                >
                  {/* Sender Avatar */}
                  <div className="flex-shrink-0">
                    {isAi ? (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                        <Bot className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        You
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[85%] sm:max-w-[78%] ${isAi ? '' : 'items-end'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                        isAi
                          ? 'bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                          : 'bg-indigo-600 text-white rounded-tr-sm'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* Complaint Detected Action Box */}
                      {isAi && msg.showComplaintPrompt && (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-200 dark:border-slate-700/80 space-y-3">
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <p className="font-bold text-[11px] text-amber-800 dark:text-amber-300">
                                Campus Problem Detected:
                              </p>
                              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                "{msg.extractedComplaint?.problem}"
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              onClick={() => handleRegisterComplaintClick(msg.extractedComplaint)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Register Complaint Now</span>
                            </button>

                            <button
                              onClick={() =>
                                setMessages((prev) => [
                                  ...prev,
                                  {
                                    id: `continue-${Date.now()}`,
                                    sender: 'ai',
                                    text: 'Understood! What other queries regarding VET Institute can I help you with?',
                                    createdAt: new Date().toISOString(),
                                  },
                                ])
                              }
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              No, Continue Chatting
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts & Input Bar */}
          <div className="p-4 sm:p-5 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 backdrop-blur-md space-y-3">
            {/* Quick Prompt Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <Sparkles className="w-3 h-3" />
                Quick Ask:
              </span>
              {SUGGESTED_PROMPTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.text)}
                    disabled={isLoading}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all active:scale-95"
                  >
                    <Icon className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2.5"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ask anything about VET Institute courses, timings, hostel, or report a broken facility..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-5 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div
            onClick={() => navigate('/courses')}
            className="glass-card p-5 rounded-3xl hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer transition-all border border-slate-200/80 dark:border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center justify-between">
              <span>Academic Programs</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore B.Sc, BCA, B.Com, BBA, M.Sc, and MCA programs with full eligibility criteria.
            </p>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => navigate('/track')}
            className="glass-card p-5 rounded-3xl hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer transition-all border border-slate-200/80 dark:border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center justify-between">
              <span>Track Complaint</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Check live status timeline stepper using your Ticket # and Student Roll Number.
            </p>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => navigate('/college-info')}
            className="glass-card p-5 rounded-3xl hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer transition-all border border-slate-200/80 dark:border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center justify-between">
              <span>Campus Guide</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Timings, library policies, hostel rules, bus routes, and key office contacts.
            </p>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => setIsComplaintModalOpen(true)}
            className="glass-card p-5 rounded-3xl hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10 cursor-pointer transition-all border border-slate-200/80 dark:border-slate-800 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center justify-between">
              <span>Report Issue</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Submit maintenance or technical complaints with automatic department dispatch.
            </p>
          </div>
        </div>

        {/* Campus Metrics Highlights */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                100%
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                Automated Routing
              </p>
              <p className="text-[11px] text-slate-400">Gemini AI Department Classifier</p>
            </div>

            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                &lt; 2 hrs
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                Avg. Staff Dispatch
              </p>
              <p className="text-[11px] text-slate-400">Immediate Ticket Assignment</p>
            </div>

            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                10 Depts
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                Connected Units
              </p>
              <p className="text-[11px] text-slate-400">IT, Electrical, Library, Civil, etc.</p>
            </div>

            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                24 / 7
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                Public Access
              </p>
              <p className="text-[11px] text-slate-400">No login required for inquiries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-step Complaint Modal */}
      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        prefillData={complaintPrefill}
      />
    </div>
  );
};

export default PublicHome;
