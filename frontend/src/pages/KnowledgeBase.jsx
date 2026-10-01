import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Bot,
  ChevronDown,
  ChevronUp,
  Tag,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingSpinner, EmptyState } from '../components/common/EmptyState';

const KnowledgeBase = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const navigate = useNavigate();

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/faq?${params.toString()}`);
      if (res.success) {
        setFaqs(res.data.faqs || []);
        if (res.data.categories) {
          setCategories(['All', ...res.data.categories]);
        }
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFaqs();
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-200/60 dark:border-indigo-800/60">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Campus Knowledge Base & FAQ
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Verified campus guidelines, office hours, department locations, and procedures.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl mx-auto relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search timings, certificates, library, exam cell, Wi-Fi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-28 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 !rounded-xl"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {loading ? (
          <LoadingSpinner label="Loading knowledge base..." />
        ) : faqs.length === 0 ? (
          <EmptyState
            title="No FAQs found"
            description="We couldn't find an answer matching your query. Ask the AI Helpdesk directly!"
            actionLabel="Ask AI Agent"
            onAction={() => navigate('/chat')}
          />
        ) : (
          faqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <Card
                key={faq.id}
                className="!p-0 overflow-hidden transition-all duration-150"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mt-0.5">
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {faq.question}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Tag className="w-3 h-3" />
                        {faq.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
                    <p className="whitespace-pre-line">{faq.answer}</p>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Verified Campus Organization Policy
                      </span>
                      <button
                        onClick={() => navigate(`/chat?prompt=${encodeURIComponent(faq.question)}`)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Ask AI more about this</span>
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
