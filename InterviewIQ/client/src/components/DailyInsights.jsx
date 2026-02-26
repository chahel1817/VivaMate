import React, { useState, useEffect } from 'react';
import { Info, Sparkles, Cpu, Brain, Loader2, Calendar } from 'lucide-react';
import { useTheme } from '../context/themeContext';
import api from '../services/api';

const CATEGORY_STYLES = {
    'TIP': {
        icon: <Brain size={22} />,
        label: 'Interview Strategy',
        gradient: 'from-blue-600 to-indigo-600',
        glow: 'shadow-blue-500/20',
        pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        accent: 'text-blue-400',
        bar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    },
    'FACT': {
        icon: <Cpu size={22} />,
        label: 'Tech Origins',
        gradient: 'from-amber-500 to-orange-500',
        glow: 'shadow-amber-500/20',
        pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        accent: 'text-amber-400',
        bar: 'bg-gradient-to-r from-amber-400 to-orange-500',
    }
};

const DailyInsights = () => {
    const { isDarkMode } = useTheme();
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Deterministic day-of-year seeding for unique caption
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const insightType = dayOfYear % 2 === 0 ? 'tip' : 'fact';

    useEffect(() => {
        const fetchInsight = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/ai/insight?type=${insightType}`);
                if (response.data?.success) {
                    setInsight(response.data.insight);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error('Failed to fetch daily insight:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchInsight();
    }, []);

    const style = CATEGORY_STYLES[insight?.type || (insightType === 'tip' ? 'TIP' : 'FACT')];
    const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    if (loading) {
        return (
            <div className={`overflow-hidden rounded-3xl border p-12 flex items-center justify-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-500" size={28} />
                        </div>
                    </div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Fetching today's knowledge drop...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !insight) {
        return (
            <div className={`overflow-hidden rounded-3xl border p-8 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-4 text-rose-500">
                    <Info size={24} />
                    <p className="font-medium">Could not load today's knowledge drop. Check back soon!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`overflow-hidden rounded-3xl border transition-all duration-500 hover:shadow-2xl group ${isDarkMode
            ? 'bg-slate-800/60 border-slate-700/80 shadow-slate-900/30'
            : 'bg-white border-slate-200 shadow-sm hover:shadow-slate-200/70'}`}>

            {/* Top accent bar */}
            <div className={`h-1 w-full ${style.bar}`} />

            <div className="p-8">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        {/* Icon pill */}
                        <div className={`p-2.5 rounded-xl border ${style.pill} transition-transform group-hover:scale-110 duration-300`}>
                            {style.icon}
                        </div>
                        <div>
                            <p className={`text-xs font-black uppercase tracking-[0.18em] ${style.accent}`}>
                                {style.label}
                            </p>
                            <p className={`text-[11px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {insight.type === 'TIP' ? 'Sharpen your approach' : 'Expand your perspective'}
                            </p>
                        </div>
                    </div>

                    {/* Date badge */}
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${isDarkMode
                            ? 'bg-slate-700/60 border-slate-600 text-slate-400'
                            : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                            <Calendar size={11} />
                            {dateLabel}
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDarkMode
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-green-50 border-green-200 text-green-600'}`}>
                            Live
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="relative">
                    {/* Decorative quote */}
                    <div className={`absolute -top-2 -left-1 text-7xl font-serif leading-none pointer-events-none select-none ${isDarkMode ? 'text-slate-700' : 'text-slate-100'}`}>"</div>

                    <div className="pl-6">
                        <h4 className={`text-xl font-black mb-3 leading-snug tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {insight.title}
                        </h4>
                        <p className={`text-base leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            {insight.content}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyInsights;
