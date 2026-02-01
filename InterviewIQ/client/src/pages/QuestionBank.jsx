import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import {
    Search,
    BookOpen,
    Bookmark,
    BookmarkCheck,
    Play,
    ChevronDown,
    ChevronUp,
    Code2,
    Brain,
    MessageSquare,
    Zap,
    Target,
    Award,
    Download,
    ArrowLeft,
    RefreshCw,
    CheckCircle
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { Copy, Check } from "lucide-react";

export default function QuestionBank() {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
    const [practiceHistory, setPracticeHistory] = useState(new Set());
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    // Get selected subjects from navigation state
    const selectedSubjects = location.state?.selectedSubjects || [];

    useEffect(() => {
        // Redirect if no subjects selected
        if (!selectedSubjects || selectedSubjects.length === 0) {
            navigate('/questions-subject');
            return;
        }

        fetchAIQuestions();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        applyFilters();
    }, [searchTerm, questions]);

    const fetchAIQuestions = async () => {
        try {
            setLoading(true);
            const allQuestions = [];

            // Fetch for each subject in parallel
            const promises = selectedSubjects.map(subject =>
                api.post('/ai/generate', {
                    type: subject,
                    count: 20
                }).then(res => ({ subject, data: res.data.questions }))
                    .catch(err => {
                        console.error(`Failed to fetch for ${subject}`, err);
                        return { subject, data: [] }; // Return empty on error to keep others
                    })
            );

            const results = await Promise.all(promises);

            let idCounter = 1;
            results.forEach(({ subject, data }) => {
                if (data && Array.isArray(data)) {
                    data.forEach(q => {
                        // Transform API response to our question format
                        // The API returns { question: "text" }
                        // We need to add ID, category, etc.
                        allQuestions.push({
                            id: idCounter++,
                            title: q.question || q.text,
                            category: subject, // Use subject as category
                            difficulty: "Medium", // Default difficulty
                            description: `Important interview question for ${subject}`,
                            tips: [], // API doesn't return tips yet
                            sampleAnswer: "", // API doesn't return answer yet
                            createdAt: new Date().toISOString()
                        });
                    });
                }
            });

            if (allQuestions.length === 0) {
                toast.error("Could not generate questions. Please try again.");
            } else {
                toast.success(`Generated ${allQuestions.length} questions!`);
            }

            setQuestions(allQuestions);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching questions:", error);
            toast.error("Failed to load questions");
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...questions];

        // Search filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(q =>
                q.title.toLowerCase().includes(lowerTerm) ||
                q.category.toLowerCase().includes(lowerTerm)
            );
        }

        setFilteredQuestions(filtered);
    };

    const toggleBookmark = (questionId) => {
        const newBookmarks = new Set(bookmarkedQuestions);
        if (newBookmarks.has(questionId)) {
            newBookmarks.delete(questionId);
            toast.success("Removed from bookmarks");
        } else {
            newBookmarks.add(questionId);
            toast.success("Added to bookmarks");
        }
        setBookmarkedQuestions(newBookmarks);
    };

    const togglePractice = (question) => {
        const newHistory = new Set(practiceHistory);
        if (newHistory.has(question.id)) {
            newHistory.delete(question.id);
        } else {
            newHistory.add(question.id);
            toast.success("Marked as completed!");
        }
        setPracticeHistory(newHistory);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Question copied to clipboard");
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const lineHeight = 7;
            let yPosition = margin;

            // Title
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text("Interview Question Bank", margin, yPosition);
            yPosition += 15;

            // Metadata
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
            yPosition += 5;
            doc.text(`Subjects: ${selectedSubjects.join(', ')}`, margin, yPosition);
            yPosition += 5;
            doc.text(`Total Questions: ${filteredQuestions.length}`, margin, yPosition);
            yPosition += 15;

            // Questions
            filteredQuestions.forEach((question, index) => {
                if (yPosition > pageHeight - 30) {
                    doc.addPage();
                    yPosition = margin;
                }

                // Question number and title
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                const questionTitle = `Q${index + 1}. ${question.title}`;
                const titleLines = doc.splitTextToSize(questionTitle, pageWidth - 2 * margin);
                doc.text(titleLines, margin, yPosition);
                yPosition += titleLines.length * lineHeight;

                // Category
                doc.setFontSize(9);
                doc.setFont("helvetica", "italic");
                doc.text(`Subject: ${question.category}`, margin, yPosition);
                yPosition += lineHeight + 5;
            });

            const fileName = `Interview_Questions_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            toast.success("PDF downloaded successfully!");
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error("Failed to export PDF");
        }
    };

    if (!selectedSubjects || selectedSubjects.length === 0) {
        return null; // Will redirect in useEffect
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                        <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            Generating {selectedSubjects.length * 20} interview questions...
                        </p>
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            This may take a moment as we consult our AI expert.
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/questions-subject')}
                        className={`flex items-center gap-2 text-sm mb-4 hover:underline ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}
                    >
                        <ArrowLeft size={16} />
                        Change Subjects
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                📚 Question Bank
                            </h1>
                            <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                {questions.length} questions generated for: <span className="font-semibold text-green-600">{selectedSubjects.join(', ')}</span>
                            </p>
                        </div>

                        <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                        >
                            <Download size={20} />
                            <span>Download PDF</span>
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className={`mb-8 p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Session Progress
                        </h2>
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {practiceHistory.size} of {questions.length} completed
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${questions.length ? (practiceHistory.size / questions.length) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className={`mb-6 relative`}>
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Search within generated questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
                            } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm`}
                    />
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                    {filteredQuestions.length === 0 ? (
                        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-12 text-center`}>
                            <BookOpen size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                No questions match your search
                            </p>
                        </div>
                    ) : (
                        filteredQuestions.map((question, index) => {
                            const isExpanded = expandedQuestion === question.id;
                            const isBookmarked = bookmarkedQuestions.has(question.id);
                            const isPracticed = practiceHistory.has(question.id);

                            return (
                                <div
                                    key={question.id}
                                    className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border transition-all duration-300 hover:shadow-lg`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {question.category}
                                                    </span>
                                                    {isPracticed && (
                                                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                            <CheckCircle size={14} />
                                                            Practiced
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {question.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleBookmark(question.id)}
                                                    className={`p-2 rounded-lg transition-colors ${isBookmarked
                                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                                        : isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                        }`}
                                                    title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                                                >
                                                    {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                                                </button>

                                                <button
                                                    onClick={() => copyToClipboard(question.title)}
                                                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                        }`}
                                                    title="Copy question"
                                                >
                                                    <Copy size={20} />
                                                </button>

                                                <button
                                                    onClick={() => togglePractice(question)}
                                                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${isPracticed
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                                                        : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transform active:scale-95'
                                                        }`}
                                                >
                                                    {isPracticed ? (
                                                        <>
                                                            <CheckCircle size={18} />
                                                            <span>Completed</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check size={18} />
                                                            <span>Mark Complete</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
