import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, LogOut, Check, ExternalLink } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { Announcement } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAnnouncements();
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Outside click detection for notification dropdown
  useEffect(() => {
    if (!showNotifications) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showNotifications]);

  const loadAnnouncements = async () => {
    try {
      const res = await apiFetch('/announcements');
      if (res.success && res.data) {
        setAnnouncements(res.data);
      }
    } catch {
      // Ignore
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await apiFetch('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
        const unread = res.data.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch {
      // Ignore
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  const markSingleRead = async (id: string) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;

  return (
    <header className="bg-white border-b border-[#E6E8ED] sticky top-0 z-30 flex flex-col">
      {/* Ticker for Department Announcements */}
      {latestAnnouncement && (
        <div className="bg-[#7654B8] text-white text-xs px-4 py-1.5 flex items-center justify-between overflow-hidden">
          <div className="flex items-center space-x-2 truncate">
            <span className="font-semibold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
              Notice
            </span>
            <span className="font-medium truncate">
              {latestAnnouncement.title} — {latestAnnouncement.message}
            </span>
          </div>
          <span className="text-[10px] text-white/80 shrink-0 ml-3 hidden sm:inline">
            Anurag University CSE
          </span>
        </div>
      )}

      {/* Main Bar */}
      <div className="min-h-[4rem] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2.5">
            <Link to="/" title="Go to UniSync Landing Page" className="md:hidden">
              <img
                src="/unisync-logo.png"
                alt="UniSync CSE"
                className="w-7 h-7 object-contain cursor-pointer hover:opacity-90"
              />
            </Link>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[#24232B] flex items-center gap-2">
                <span>Department of Computer Science & Engineering</span>
                <span className="hidden lg:inline text-xs font-normal text-[#737784]">| Anurag University</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-2 relative">
          {/* Notifications Button */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="p-2 rounded-full text-[#737784] hover:text-[#24232B] hover:bg-gray-100 relative focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#D94B4B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-lg shadow-xl border border-[#E6E8ED] py-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2 border-b border-[#E6E8ED] flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#24232B]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-[#7051C8] hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#737784]">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => !n.isRead && markSingleRead(n._id)}
                        className={`p-3 text-xs transition-colors ${
                          n.isRead ? 'bg-white' : 'bg-purple-50/50 hover:bg-purple-50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="font-semibold text-[#24232B]">{n.title}</p>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#7051C8] shrink-0" title="Unread" />
                          )}
                        </div>
                        <p className="text-[#737784] leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Signout */}
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-[#737784] hover:text-[#D94B4B] hover:bg-red-50 rounded-md transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
