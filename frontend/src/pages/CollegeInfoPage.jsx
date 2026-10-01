import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Building2,
  Phone,
  Bus,
  Award,
  ShieldCheck,
  Bot,
  HelpCircle,
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingSpinner } from '../components/common/EmptyState';

const categoryIcons = {
  'College Information': GraduationCap,
  Timings: Clock,
  Admissions: Award,
  Library: BookOpen,
  Hostel: Building2,
  Transport: Bus,
  Examination: ShieldCheck,
  Placement: Award,
  'Contact Information': Phone,
};

const CollegeInfoPage = () => {
  const navigate = useNavigate();
  const [infoList, setInfoList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get('/college/info');
        if (res.success) {
          setInfoList(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load college info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>VET Institute Campus Guide</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          College Policies, Timings & Services
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Verified institutional information directly synchronized with our AI Knowledge Base.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading campus information..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {infoList.map((item) => {
            const Icon = categoryIcons[item.category] || HelpCircle;
            return (
              <div
                key={item.id}
                className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Verified Campus Knowledge</span>
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={Bot}
                    onClick={() => navigate(`/?prompt=${encodeURIComponent(item.title)}`)}
                  >
                    Ask Assistant
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollegeInfoPage;
