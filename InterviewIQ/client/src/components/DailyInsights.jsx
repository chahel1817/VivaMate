import React, { useState, useEffect, useMemo } from 'react';
import { Lightbulb, Info, Sparkles, Languages, Terminal, Brain, Loader2 } from 'lucide-react';
import { useTheme } from '../context/themeContext';
import api from '../services/api';

const DailyInsights = () => {
    const { isDarkMode } = useTheme();
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchInsight = async () => {
            try {
                setLoading(true);
                const today = new Date();
                const start = new Date(today.getFullYear(), 0, 0);
                const diff = today - start;
                const oneDay = 1000 * 60 * 60 * 24;
                const dayOfYear = Math.floor(diff / oneDay);

                // Fetch tip on even days, fact on odd days
                const type = dayOfYear % 2 === 0 ? 'tip' : 'fact';

                const response = await api.get(`/ai/insight?type=${type}`);
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

    const iconMap = {
        'TIP': {
            icon: <Brain size={24} />,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/30"
        },
        'FACT': {
            icon: <Languages size={24} />,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/30"
        }
    };

    const style = insight ? iconMap[insight.type] : iconMap['TIP'];

    if (loading) {
        return (
            <div className={`mt-12 overflow-hidden rounded-3xl border animate-pulse p-12 flex items-center justify-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-green-500" size={32} />
                    <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Consulting the AI for today's insight...</p>
                </div>
            </div>
        );
    }

    if (error || !insight) {
        return (
            <div className={`mt-12 overflow-hidden rounded-3xl border p-8 ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                <div className="flex items-center gap-4 text-rose-500">
                    <Info size={24} />
                    <p>Failed to load today's AI insight. Keep practicing and stay sharp!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`mt-12 overflow-hidden rounded-3xl border transition-all duration-500 hover:shadow-2xl ${isDarkMode ? 'bg-slate-800/50 border-slate-700 shadow-slate-900/40' : 'bg-white border-slate-200 shadow-slate-200/50'
            }`}>
            <div className="flex flex-col md:flex-row">
                {/* Left Side Highlight */}
                <div className={`flex flex-col justify-center items-center p-8 md:w-1/4 ${style.bgColor} ${style.color}`}>
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md mb-4 animate-bounce">
                        {style.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                        {insight.type === 'TIP' ? 'Daily Tip' : 'Daily Fact'}
                    </span>
                </div>

                {/* Right Side Content */}
                <div className="p-8 md:w-3/4 relative flex flex-col justify-center">
                    {/* Decorative Quote Mark */}
                    <div className={`absolute top-4 right-8 text-8xl font-serif opacity-5 ${style.color} pointer-events-none`}>
                        "
                    </div>

                    <h4 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                        {insight.title}
                    </h4>

                    <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-medium`}>
                        {insight.content}
                    </p>

                    <div className="mt-8 flex items-center justify-between">
                        <div className={`flex items-center gap-2 text-sm font-semibold ${style.color}`}>
                            <Sparkles size={16} />
                            <span>Generated fresh via OpenRouter AI</span>
                        </div>

                        <div className={`text-xs px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
                            }`}>
                            Updated Daily
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyInsights;
