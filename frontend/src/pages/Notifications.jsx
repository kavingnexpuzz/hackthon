import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingSpinner, EmptyState } from '../components/common/EmptyState';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCountState] = useState(0);
  const [loading, setLoading] = useState(true);

  const { setUnreadCount } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications?limit=30');
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCountState(res.data.unreadCount || 0);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkOneRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCountState((c) => Math.max(0, c - 1));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCountState(0);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleItemClick = (notif) => {
    if (!notif.is_read) {
      handleMarkOneRead(notif.id);
    }
    if (notif.type === 'complaint') {
      navigate('/complaints');
    } else if (notif.type === 'request') {
      navigate('/requests');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time updates regarding your complaints and service requests
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      <Card className="!p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <LoadingSpinner label="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up! New status updates will appear here."
          />
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`p-4 flex items-start gap-3.5 cursor-pointer transition-colors ${
                !n.is_read
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70'
                  : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  n.type === 'complaint'
                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {n.type === 'complaint' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>
                {n.reference_id && (
                  <span className="inline-block mt-1 font-mono text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    Ref: {n.reference_id}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};

export default Notifications;
