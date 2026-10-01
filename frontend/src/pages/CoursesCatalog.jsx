import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Clock, Award, Building2, Bot, Search } from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingSpinner } from '../components/common/EmptyState';

const CoursesCatalog = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [degreeFilter, setDegreeFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/college/courses');
        if (res.success) {
          setCourses(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const matchesDegree = degreeFilter === 'All' || c.degree_type === degreeFilter;
    const matchesSearch =
      search.trim() === '' ||
      c.course_name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    return matchesDegree && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 px-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Academic Programs & Degrees</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Explore Our Academic Courses
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Accredited undergraduate and postgraduate programs designed for industry excellence.
        </p>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {['All', 'Undergraduate', 'Postgraduate'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDegreeFilter(d)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  degreeFilter === d
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <LoadingSpinner label="Fetching academic catalog..." />
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          No courses found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {course.degree_type}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-400">
                    {course.code}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                  {course.course_name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                  {course.description}
                </p>

                <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duration:</span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {course.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Department:</span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {course.department_name || 'General'}
                    </span>
                  </div>

                  <div className="pt-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                      Eligibility:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      {course.eligibility}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Annual Tuition</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                    {course.fees_per_year || 'Contact Office'}
                  </span>
                </div>

                <Button
                  size="xs"
                  variant="ghost"
                  icon={Bot}
                  onClick={() => navigate(`/?prompt=Tell me more about ${encodeURIComponent(course.course_name)}`)}
                >
                  Ask AI
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesCatalog;
