import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, Trash2, RefreshCw, AlertCircle, Database, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import { useAuth } from '../context/AuthContext';

const INITIAL_GREETING = {
  id: 'initial-greeting',
  sender: 'ai',
  message:
    "Hello! I am your **AI Campus & Office Helpdesk Agent**.\n\nYou can talk to me in natural language to:\n- **Report a Complaint** (e.g. *\"My classroom projector is not working in CSE Block Room 204\"*)\n- **Request Official Services** (e.g. *\"I need to apply for a bonafide certificate\"*)\n- **Track Status** (e.g. *\"What is the status of my projector complaint?\"*)\n- **Ask Campus FAQs** (e.g. *\"When does the library close?\"* or *\"How do I contact the exam cell?\"*)\n\nHow can I help you today?",
  createdAt: new Date().toISOString(),
};

const AiChat = () => {
  const { user, refreshProfile } = useAuth();
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [pendingAction, setPendingAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await api.get('/ai/history');
        if (res.success && res.data && res.data.length > 0) {
          setMessages([INITIAL_GREETING, ...res.data]);

          // Check if latest AI message had a pending action
          const lastMsg = res.data[res.data.length - 1];
          if (lastMsg && lastMsg.sender === 'ai' && lastMsg.metadata?.newPendingAction) {
            setPendingAction(lastMsg.metadata.newPendingAction);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  const handleSendMessage = async (text, actionOverride = null) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const actionToSend = actionOverride !== null ? actionOverride : pendingAction;

    try {
      const res = await api.post('/ai/chat', {
        message: text,
        pendingAction: actionToSend,
      });

      if (res.success && res.data) {
        const { response, actionType, actionData, pendingAction: nextPending } = res.data;

        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          message: response,
          metadata: {
            actionType,
            actionData,
            newPendingAction: nextPending,
          },
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setPendingAction(nextPending || null);

        // If a complaint or request was registered, refresh profile counts
        if (actionType === 'complaint_created' || actionType === 'request_created') {
          refreshProfile();
        }
      }
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        message:
          '⚠️ I encountered an error connecting to the helpdesk services. Please try again or rephrase your request.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = (action) => {
    handleSendMessage('Yes, please confirm and register this ticket.', action);
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'ai',
        message: 'Action cancelled. Let me know if you need anything else!',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;
    try {
      await api.delete('/ai/history');
      setMessages([INITIAL_GREETING]);
      setPendingAction(null);
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 ai-glow">
            <Bot className="w-5 h-5" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Helpdesk AI Assistant
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Gemini Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Database className="w-3 h-3 text-emerald-500" />
              <span>Real MySQL Database Persistence Active</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            title="Clear Chat History"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onConfirmAction={handleConfirmAction}
            onCancelAction={handleCancelAction}
          />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar Area */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <ChatInput
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AiChat;
