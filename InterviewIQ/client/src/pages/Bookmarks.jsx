import { useState, useEffect } from "react";
import api from "../services/api";
import { useTheme } from "../context/themeContext";
import Navbar from "../components/Navbar";
import { Bookmark, Trash2, ArrowLeft, CheckCircle } from "lucide-react";

export default function Bookmarks() {
    const { isDarkMode } = useTheme();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const res = await api.get("/challenge/bookmarks");
            setBookmarks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (questionId, questionText) => {
        try {
            await api.post("/challenge/bookmark", {
                questionId,
                question: questionText // We use question text to identify if ID is missing
            });
            setBookmarks(prev => prev.filter(b => b.question !== questionText));
        } catch (err) {
            console.error("Failed to remove bookmark", err);
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
                        <h1 className="text-3xl font-extrabold">Saved Questions</h1>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                        </div>
                    ) : bookmarks.length === 0 ? (
                        <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                            <Bookmark size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-xl text-slate-500">No saved questions yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {bookmarks.map((item, index) => (
                                <div key={index} className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} relative group`}>
                                    <button
                                        onClick={() => removeBookmark(item.questionId, item.question)}
                                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                        title="Remove Bookmark"
                                    >
                                        <Trash2 size={20} />
                                    </button>

                                    <h3 className="text-xl font-bold mb-6 pr-10">{item.question}</h3>

                                    <div className="space-y-3 mb-6">
                                        {item.options.map((opt, i) => (
                                            <div key={i} className={`p-4 rounded-xl border ${opt === item.correctAnswer ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'border-slate-100 dark:border-slate-700 opacity-60'}`}>
                                                <div className="flex justify-between items-center">
                                                    <span>{opt}</span>
                                                    {opt === item.correctAnswer && <CheckCircle size={18} />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>{item.type}</span>
                                        <span>Saved {new Date(item.savedAt).toLocaleDateString()}</span>
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
