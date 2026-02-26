import { useState, useEffect } from "react";
import api from "../services/api";
import { useTheme } from "../context/themeContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { Bookmark, Trash2, Search, CheckCircle, BookOpen, Filter } from "lucide-react";
import toast from "react-hot-toast";

const TYPE_FILTERS = ["All", "mcq", "coding", "flashcard"];

export default function Bookmarks() {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeType, setActiveType] = useState("All");
    const [removing, setRemoving] = useState(null);

    useEffect(() => { fetchBookmarks(); }, []);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            const res = await api.get("/challenge/bookmarks");
            setBookmarks(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load bookmarks");
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (questionId, questionText) => {
        setRemoving(questionText);
        try {
            await api.post("/challenge/bookmark", { questionId, question: questionText });
            setBookmarks(prev => prev.filter(b => b.question !== questionText));
            toast.success("Bookmark removed");
        } catch (err) {
            toast.error("Failed to remove bookmark");
        } finally {
            setRemoving(null);
        }
    };

    const filtered = bookmarks.filter(b => {
        const matchesSearch = !searchTerm || b.question.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = activeType === "All" || b.type === activeType;
        return matchesSearch && matchesType;
    });

    return (
        <>
            <Navbar />
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>

                {/* Header */}
                <div className={`border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                        <div className="flex items-center gap-3 mb-1">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            >
                                ←
                            </button>
                            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                                <Bookmark className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Saved Questions</h1>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{bookmarks.length} questions saved for review</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

                    {/* Search + Filter */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search saved questions..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
                            />
                        </div>
                        <div className="flex gap-2">
                            {TYPE_FILTERS.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setActiveType(t)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeType === t ? 'bg-yellow-500 text-white border-yellow-500' : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className={`h-40 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`} />)}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className={`rounded-2xl border p-16 text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <BookOpen className={`w-14 h-14 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                {searchTerm ? "No saved questions match" : "No bookmarks yet"}
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                Bookmark questions in the Daily Challenge to review them here
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => navigate('/daily-challenge')}
                                    className="mt-5 px-6 py-2.5 bg-yellow-500 text-white rounded-xl font-semibold text-sm hover:bg-yellow-600 transition-all"
                                >
                                    Go to Daily Challenge
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filtered.map((item, index) => (
                                <div
                                    key={index}
                                    className={`rounded-2xl border relative group transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
                                >
                                    {/* Type Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${item.type === 'mcq' ? 'bg-blue-500/10 text-blue-500' :
                                                item.type === 'coding' ? 'bg-green-500/10 text-green-500' :
                                                    'bg-purple-500/10 text-purple-500'
                                            }`}>
                                            {item.type || 'question'}
                                        </span>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeBookmark(item.questionId, item.question)}
                                        disabled={removing === item.question}
                                        className={`absolute top-4 right-4 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${isDarkMode ? 'hover:bg-red-900/30 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-300 hover:text-red-500'}`}
                                        title="Remove bookmark"
                                    >
                                        {removing === item.question
                                            ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                            : <Trash2 className="w-4 h-4" />
                                        }
                                    </button>

                                    <div className="p-5 pt-10">
                                        <h3 className={`font-bold text-base mb-5 pr-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.question}</h3>

                                        {/* Options */}
                                        {item.options && item.options.length > 0 && (
                                            <div className="space-y-2 mb-4">
                                                {item.options.map((opt, i) => (
                                                    <div
                                                        key={i}
                                                        className={`px-4 py-3 rounded-xl border flex items-center justify-between text-sm ${opt === item.correctAnswer
                                                                ? isDarkMode ? 'bg-green-900/20 border-green-700/50 text-green-300' : 'bg-green-50 border-green-200 text-green-700'
                                                                : isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'
                                                            }`}
                                                    >
                                                        <span>{opt}</span>
                                                        {opt === item.correctAnswer && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className={`flex justify-between items-center text-xs font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                            <span className="uppercase tracking-wider">{item.type}</span>
                                            <span>Saved {new Date(item.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
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
