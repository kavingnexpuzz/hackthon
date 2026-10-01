import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-200/60 dark:border-indigo-800/60 shadow-inner">
        <Bot className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
        404
      </h1>
      <h2 className="mt-2 text-lg font-bold text-slate-700 dark:text-slate-300">
        Page Not Found
      </h2>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The helpdesk route or ticket resource you are looking for does not exist or has been relocated.
      </p>

      <div className="mt-6">
        <Link to="/">
          <Button icon={ArrowLeft} size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
