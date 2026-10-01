import React from 'react';
import { Bot, User, CheckCircle2, AlertCircle, Clock, MapPin, Tag, ShieldAlert, ArrowRight } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import Button from '../common/Button';

// Simple markdown-style formatter for bold text and list items
const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, idx) => {
    // Process bold tags **bold**
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const lineElements = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-semibold text-slate-900 dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={pIdx} className="italic text-slate-600 dark:text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });

    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      return (
        <li key={idx} className="ml-4 list-disc my-0.5">
          {lineElements}
        </li>
      );
    }

    return (
      <p key={idx} className={line.trim() === '' ? 'h-2' : 'my-1'}>
        {lineElements}
      </p>
    );
  });
};

const ChatMessage = ({ message, onConfirmAction, onCancelAction }) => {
  const isAi = message.sender === 'ai';
  const metadata = message.metadata || {};
  const { actionType, actionData, newPendingAction } = metadata;
  const pending = newPendingAction || metadata.pendingAction;

  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div
      className={`flex items-start gap-3 my-4 animate-in fade-in duration-200 ${
        isAi ? '' : 'flex-row-reverse'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
          isAi
            ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-indigo-500/20'
            : 'bg-gradient-to-tr from-slate-700 to-slate-800'
        }`}
      >
        {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] ${isAi ? 'items-start' : 'items-end flex flex-col'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isAi
              ? 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm rounded-tl-sm'
              : 'bg-indigo-600 text-white rounded-tr-sm shadow-sm shadow-indigo-600/20'
          }`}
        >
          {renderFormattedText(message.message)}

          {/* Action Cards Rendered for AI responses */}
          {isAi && actionType === 'complaint_confirmation_required' && pending && (
            <div className="mt-3 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 text-slate-800 dark:text-slate-200 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Ticket Preview Confirmation</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Category: <strong>{pending.category}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Location: <strong>{pending.location}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span>Priority: <strong>{pending.priority}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60">
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => onConfirmAction && onConfirmAction(pending)}
                >
                  Confirm & Submit
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onCancelAction && onCancelAction()}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isAi && actionType === 'request_confirmation_required' && pending && (
            <div className="mt-3 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 text-slate-800 dark:text-slate-200 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-700 dark:text-indigo-400 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Service Request Preview</span>
              </div>
              <div className="space-y-1 mb-3">
                <div>Type: <strong>{pending.request_type}</strong></div>
                <div>Priority: <strong>{pending.priority}</strong></div>
                <div className="text-slate-600 dark:text-slate-400">{pending.description}</div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60">
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => onConfirmAction && onConfirmAction(pending)}
                >
                  Confirm & Submit Request
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onCancelAction && onCancelAction()}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isAi && actionType === 'complaint_created' && actionData?.ticket && (
            <div className="mt-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complaint Registered</span>
                </div>
                <StatusBadge status="Open" />
              </div>
              <div className="space-y-1 text-slate-700 dark:text-slate-300">
                <div>Ticket: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{actionData.ticket.ticket_number}</strong></div>
                <div>Location: {actionData.ticket.location}</div>
                <div>Category: {actionData.ticket.category}</div>
              </div>
            </div>
          )}

          {isAi && actionType === 'request_created' && actionData?.request && (
            <div className="mt-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Request Created</span>
                </div>
                <StatusBadge status="Pending" />
              </div>
              <div className="space-y-1 text-slate-700 dark:text-slate-300">
                <div>Request Number: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{actionData.request.request_number}</strong></div>
                <div>Type: {actionData.request.request_type}</div>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
