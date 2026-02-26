import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck, Trash2, Users, Award, Flame, Info } from 'lucide-react';
import { useTheme } from '../context/themeContext';
import { useNotifications } from '../hooks/useNotifications';

/* ─────────── icon + color per notification type ─────────── */
const TYPE_CONFIG = {
    friend_request: {
        icon: Users,
        ring: 'ring-purple-500/30',
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-500',
        dot: 'bg-purple-500',
    },
    friend_accepted: {
        icon: Users,
        ring: 'ring-green-500/30',
        iconBg: 'bg-green-500/10',
        iconColor: 'text-green-500',
        dot: 'bg-green-500',
    },
    achievement: {
        icon: Award,
        ring: 'ring-yellow-500/30',
        iconBg: 'bg-yellow-500/10',
        iconColor: 'text-yellow-500',
        dot: 'bg-yellow-500',
    },
    streak_warning: {
        icon: Flame,
        ring: 'ring-orange-500/30',
        iconBg: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
        dot: 'bg-orange-500',
    },
    system: {
        icon: Info,
        ring: 'ring-blue-500/30',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-400',
        dot: 'bg-blue-500',
    },
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export default function NotificationBell() {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const { notifications, unreadCount, markRead, markAllRead, deleteOne, clearAll } = useNotifications();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    /* Close on outside click */
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleClick = (notif) => {
        if (!notif.read) markRead(notif._id);
        if (notif.link) {
            setOpen(false);
            navigate(notif.link);
        }
    };

    const cfg = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

    return (
        <div className="relative" ref={containerRef}>
            {/* ── Bell Button ── */}
            <button
                onClick={() => setOpen(o => !o)}
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${open
                        ? isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                        : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white bg-red-500 rounded-full leading-none shadow-lg shadow-red-900/30 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown ── */}
            {open && (
                <div className={`absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border overflow-hidden z-[999] ${isDarkMode
                        ? 'bg-slate-900 border-slate-700 shadow-black/60'
                        : 'bg-white border-slate-200 shadow-slate-300/40'
                    }`}>

                    {/* Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-2">
                            <Bell size={16} className={isDarkMode ? 'text-slate-300' : 'text-slate-700'} />
                            <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Notifications</span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-black bg-red-500 text-white rounded-full">{unreadCount}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    title="Mark all read"
                                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                >
                                    <CheckCheck size={14} /> All read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    title="Clear all"
                                    className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-500 hover:text-red-400 hover:bg-slate-800' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                        }`}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <Bell size={24} className={isDarkMode ? 'text-slate-600' : 'text-slate-300'} />
                                </div>
                                <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>All caught up!</p>
                                <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const c = cfg(notif.type);
                                const Icon = c.icon;
                                return (
                                    <div
                                        key={notif._id}
                                        onClick={() => handleClick(notif)}
                                        className={`relative flex gap-3 px-4 py-3.5 cursor-pointer transition-colors group border-b last:border-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-50'
                                            } ${!notif.read
                                                ? isDarkMode ? 'bg-slate-800/60 hover:bg-slate-800' : 'bg-blue-50/50 hover:bg-blue-50'
                                                : isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        {/* Unread dot */}
                                        {!notif.read && (
                                            <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${c.dot}`} />
                                        )}

                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                                            <Icon size={16} className={c.iconColor} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 pr-6">
                                            <p className={`text-sm font-bold leading-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{notif.title}</p>
                                            <p className={`text-xs mt-0.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{notif.message}</p>
                                            <p className={`text-[10px] font-semibold mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{timeAgo(notif.createdAt)}</p>
                                        </div>

                                        {/* Delete (hover) */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteOne(notif._id); }}
                                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDarkMode ? 'text-slate-500 hover:text-red-400 hover:bg-slate-700' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                                                }`}
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className={`px-4 py-2.5 border-t text-center ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                Showing latest {notifications.length} notifications
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
