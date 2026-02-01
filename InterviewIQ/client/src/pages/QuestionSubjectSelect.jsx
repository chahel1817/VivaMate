import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/themeContext";
import {
    Search,
    BookOpen,
    CheckCircle,
    ChevronRight,
    Code2,
    Database,
    Cloud,
    Server,
    Layout,
    Cpu,
    Layers
} from "lucide-react";
import Navbar from "../components/Navbar";

// All available subjects from InterviewSelect
const SUBJECTS = [
    // CS CORE
    { domain: "Computer Science", subject: "Operating Systems", icon: Cpu },
    { domain: "Computer Science", subject: "Computer Networks", icon: Layers },
    { domain: "Computer Science", subject: "DBMS", icon: Database },
    { domain: "Computer Science", subject: "Data Structures", icon: Code2 },
    { domain: "Computer Science", subject: "Algorithms", icon: Code2 },
    { domain: "Computer Science", subject: "OOPs", icon: Code2 },

    // BACKEND
    { domain: "Backend", subject: "Node.js", icon: Server },
    { domain: "Backend", subject: "Java Spring Boot", icon: Server },
    { domain: "Backend", subject: "Django", icon: Server },
    { domain: "Backend", subject: "Express.js", icon: Server },
    { domain: "Backend", subject: "REST APIs", icon: Server },
    { domain: "Backend", subject: "GraphQL", icon: Server },

    // FRONTEND
    { domain: "Frontend", subject: "JavaScript", icon: Code2 },
    { domain: "Frontend", subject: "React.js", icon: Layout },
    { domain: "Frontend", subject: "Next.js", icon: Layout },
    { domain: "Frontend", subject: "HTML & CSS", icon: Layout },

    // DATABASE
    { domain: "Database", subject: "MySQL", icon: Database },
    { domain: "Database", subject: "MongoDB", icon: Database },
    { domain: "Database", subject: "PostgreSQL", icon: Database },

    // CLOUD
    { domain: "Cloud", subject: "AWS", icon: Cloud },
    { domain: "Cloud", subject: "Azure", icon: Cloud },
    { domain: "Cloud", subject: "Google Cloud", icon: Cloud },
    { domain: "Cloud", subject: "Cloud Computing Fundamentals", icon: Cloud },

    // DEVOPS
    { domain: "DevOps", subject: "Docker", icon: Layers },
    { domain: "DevOps", subject: "Kubernetes", icon: Layers },
    { domain: "DevOps", subject: "CI/CD", icon: Layers },
    { domain: "DevOps", subject: "Linux", icon: Cpu },
];

export default function QuestionSubjectSelect() {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const [search, setSearch] = useState("");
    const [selectedSubjects, setSelectedSubjects] = useState(new Set());

    // Filter subjects based on search
    const filteredSubjects = useMemo(() => {
        if (!search) return SUBJECTS;

        const searchLower = search.toLowerCase();
        return SUBJECTS.filter(
            (s) =>
                s.subject.toLowerCase().includes(searchLower) ||
                s.domain.toLowerCase().includes(searchLower)
        );
    }, [search]);

    // Group by domain
    const groupedSubjects = useMemo(() => {
        return filteredSubjects.reduce((acc, curr) => {
            acc[curr.domain] = acc[curr.domain] || [];
            acc[curr.domain].push(curr);
            return acc;
        }, {});
    }, [filteredSubjects]);

    const toggleSubject = (subject) => {
        const newSelected = new Set(selectedSubjects);
        if (newSelected.has(subject)) {
            newSelected.delete(subject);
        } else {
            newSelected.add(subject);
        }
        setSelectedSubjects(newSelected);
    };

    const handleContinue = () => {
        if (selectedSubjects.size === 0) {
            return;
        }

        // Navigate to question bank with selected subjects
        navigate("/questions", {
            state: {
                selectedSubjects: Array.from(selectedSubjects)
            }
        });
    };

    const getDomainColor = (domain) => {
        switch (domain) {
            case "Computer Science": return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
            case "Backend": return "text-green-600 bg-green-100 dark:bg-green-900/30";
            case "Frontend": return "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
            case "Database": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
            case "Cloud": return "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30";
            case "DevOps": return "text-orange-600 bg-orange-100 dark:bg-orange-900/30";
            default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
        }
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        📚 Select Subjects
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Choose the subjects you want to practice. We'll generate 20 important questions for each subject.
                    </p>
                </div>

                {/* Selection Summary */}
                {selectedSubjects.size > 0 && (
                    <div className={`mb-6 p-4 rounded-xl border ${isDarkMode ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-900'}`}>
                                    {selectedSubjects.size} subject{selectedSubjects.size !== 1 ? 's' : ''} selected
                                </p>
                                <p className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
                                    {selectedSubjects.size * 20} questions will be generated
                                </p>
                            </div>
                            <button
                                onClick={handleContinue}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
                            >
                                Continue
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Search subjects (React, AWS, Algorithms...)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${isDarkMode
                                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                            } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    />
                </div>

                {/* No Results */}
                {filteredSubjects.length === 0 && (
                    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-12 text-center`}>
                        <BookOpen size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            No subjects found
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            Try a different search term
                        </p>
                    </div>
                )}

                {/* Subject List */}
                <div className="space-y-8">
                    {Object.entries(groupedSubjects).map(([domain, subjects]) => (
                        <div key={domain}>
                            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                {domain}
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subjects.map((subject, idx) => {
                                    const Icon = subject.icon;
                                    const isSelected = selectedSubjects.has(subject.subject);

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => toggleSubject(subject.subject)}
                                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${isSelected
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                                                    : isDarkMode
                                                        ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                                                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className={`p-2 rounded-lg ${getDomainColor(domain)}`}>
                                                    <Icon size={20} />
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle size={24} className="text-green-600" />
                                                )}
                                            </div>
                                            <p className={`font-semibold mb-1 ${isSelected
                                                    ? 'text-green-700 dark:text-green-400'
                                                    : isDarkMode ? 'text-white' : 'text-slate-800'
                                                }`}>
                                                {subject.subject}
                                            </p>
                                            <p className={`text-sm ${isSelected
                                                    ? 'text-green-600 dark:text-green-500'
                                                    : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                                }`}>
                                                {domain}
                                            </p>
                                            {isSelected && (
                                                <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                                                    ✓ 20 questions will be generated
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                {selectedSubjects.size > 0 && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleContinue}
                            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold mx-auto text-lg shadow-lg hover:shadow-xl"
                        >
                            Generate {selectedSubjects.size * 20} Questions
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
