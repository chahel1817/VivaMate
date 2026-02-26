import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const POLL_INTERVAL = 30_000; // 30 seconds

export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef(null);

    const fetch = useCallback(async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch {
            // silent — not logged in yet or network error
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch().finally(() => setLoading(false));

        // Poll every 30s
        intervalRef.current = setInterval(fetch, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current);
    }, [fetch]);

    const markRead = useCallback(async (id) => {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        try { await api.post(`/notifications/read/${id}`); } catch { }
    }, []);

    const markAllRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        try { await api.post('/notifications/read-all'); } catch { }
    }, []);

    const deleteOne = useCallback(async (id) => {
        const notif = notifications.find(n => n._id === id);
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1));
        try { await api.delete(`/notifications/${id}`); } catch { }
    }, [notifications]);

    const clearAll = useCallback(async () => {
        setNotifications([]);
        setUnreadCount(0);
        try { await api.delete('/notifications'); } catch { }
    }, []);

    return { notifications, unreadCount, loading, markRead, markAllRead, deleteOne, clearAll, refetch: fetch };
}
