import { useState, useEffect } from "react";
import api from "../services/api";
import { useTheme } from "../context/themeContext";
import Navbar from "../components/Navbar";
import { Calendar, Award, Star, ArrowLeft } from "lucide-react";

export default function ChallengeHistory() {
    const { isDarkMode } = useTheme();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get("/challenge/history");
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'} py-12 px-6`}>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => window.location.href = '/dashboard'} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-extrabold">Challenge History</h1>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-xl text-slate-500">No challenges completed yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {history.map((item, index) => (
                                <div key={item.id || index} className={`p-6 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} hover:shadow-md transition-shadow`}>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                        <p className="text-sm text-slate-500 flex items-center gap-2">
                                            <Calendar size={14} /> {new Date(item.date).toLocaleDateString()}
                                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                                            <span>{item.difficulty}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {item.score !== undefined && item.total !== undefined ? (
                                            <p className="text-2xl font-black text-green-500">{item.score}/{item.total}</p>
                                        ) : (
                                            <p className="text-lg font-bold text-slate-400">Completed</p>
                                        )}
                                        <p className="text-xs font-bold text-yellow-500 flex items-center justify-end gap-1">
                                            <Award size={12} /> +{item.xpEarned || 0} XP
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
