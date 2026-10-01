import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, ArrowUp } from 'lucide-react';
import Button from '../common/Button';

const SUGGESTED_PROMPTS = [
  'My classroom projector is not working in CSE Block Room 204.',
  'I need to apply for a bonafide certificate.',
  'When does the library close?',
  'What is the status of my latest complaint?',
  'I need to report a Wi-Fi issue in Library Floor 2.',
  'Show my recent complaints.',
  'How do I request a replacement ID card?',
];

const ChatInput = ({ onSendMessage, onClearChat, isLoading = false }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  return (
    <div className="w-full space-y-3">
      {/* Suggested Prompts Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pl-1 uppercase tracking-wider whitespace-nowrap">
          <Sparkles className="w-3 h-3" />
          Suggested:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePromptClick(prompt)}
            disabled={isLoading}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs transition-colors border border-slate-200/60 dark:border-slate-700/60 active:scale-95 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
          {onClearChat && (
            <button
              type="button"
              onClick={onClearChat}
              title="Clear chat conversation"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your complaint, request, or campus question..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none max-h-32 min-h-[36px]"
          />

          <Button
            type="submit"
            size="sm"
            disabled={!text.trim() || isLoading}
            isLoading={isLoading}
            className="!rounded-xl px-3.5"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
