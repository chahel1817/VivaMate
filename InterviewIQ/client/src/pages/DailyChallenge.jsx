import { useState, useEffect } from "react";
import { Trophy, Star, Target, CheckCircle, Zap, ArrowRight, Award, Flame } from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";

export default function DailyChallenge() {
    const { user, refreshUser } = useAuth();
    const { isDarkMode } = useTheme();

    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);

    // Quiz State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // Array<String>
    const [selectedOption, setSelectedOption] = useState(null);

    // Result State
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDailyChallenge();
    }, []);

    const fetchDailyChallenge = async () => {
        try {
            setLoading(true);
            const res = await api.get("/challenge/daily");
            setChallenge(res.data);
            // Initialize answers array
            if (res.data.questions) {
                setAnswers(new Array(res.data.questions.length).fill(null));
            }
        } catch (err) {
            console.error("Failed to fetch challenge", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (opt) => {
        setSelectedOption(opt);
    };

    const handleNext = () => {
        // Save current answer
        const newAnswers = [...answers];
        newAnswers[currentIndex] = selectedOption;
        setAnswers(newAnswers);

        // Reset selection for next question
        setSelectedOption(null);

        // Move next
        if (currentIndex < (challenge.questions.length - 1)) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // It was the last question, trigger submit
            handleSubmit(newAnswers);
        }
    };

    const handleSubmit = async (finalAnswers) => {
        try {
            setSubmitting(true);
            const res = await api.post("/challenge/submit", {
                challengeId: challenge._id,
                answers: finalAnswers
            });
            setResult(res.data);
            // Refresh user data to update streak and XP in the UI
            await refreshUser();
        } catch (err) {
            console.error("Submit failed", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    // --- ALREADY COMPLETED VIEW ---
    if (challenge?.completed) {
        return (
            <>
                <Navbar />
                <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                    <div className="p-6 bg-green-100 text-green-600 rounded-full mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-extrabold mb-4 text-slate-800 dark:text-white">Challenge Completed!</h2>
                    <p className="max-w-md text-lg mb-8">
                        You have already attempted today's challenge. Come back later for the next one!
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => window.location.href = '/dashboard'} className="px-8 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-900 transition shadow-lg">
                            Back to Dashboard
                        </button>
                        <button onClick={() => window.location.href = '/history'} className="px-8 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-300 transition shadow-lg">
                            View History
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // --- RESULT VIEW ---
    if (result) {
        return (
            <>
                <Navbar />
                <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'} py-12 px-6`}>
                    <div className="max-w-2xl mx-auto text-center">

                        <div className={`rounded-3xl p-10 border shadow-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} animate-fade-in-up`}>
                            <div className="inline-flex p-4 rounded-full bg-yellow-100 text-yellow-600 mb-6">
                                <Trophy size={48} />
                            </div>

                            <h1 className="text-4xl font-extrabold mb-2">Challenge Complete!</h1>
                            <p className={`text-lg mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Here is how you performed today</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                    <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Score</p>
                                    <p className="text-3xl font-black mt-1">{result.score} / {result.total}</p>
                                </div>
                                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                    <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">XP Earned</p>
                                    <p className="text-3xl font-black mt-1 text-yellow-500">+{result.xpGained} XP</p>
                                </div>
                            </div>

                            {/* Streak Info */}
                            {result.streakBonus > 0 && (
                                <div className={`p-4 rounded-xl border mb-6 ${isDarkMode ? 'bg-orange-900/20 border-orange-700/50' : 'bg-orange-50 border-orange-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-orange-500">
                                                <Flame size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Streak Bonus!</p>
                                                <p className="text-xs text-slate-500">Current Streak: {result.currentStreak} days</p>
                                            </div>
                                        </div>
                                        <p className="text-xl font-black text-orange-500">+{result.streakBonus} XP</p>
                                    </div>
                                </div>
                            )}

                            {/* Breakdown */}
                            <div className="text-left space-y-3 mb-8">
                                <h3 className="font-bold text-lg mb-4">Question Review</h3>
                                {result.results.map((r, i) => (
                                    <div key={i} className={`p-4 rounded-xl border ${r.isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-sm mb-1">Q{i + 1}: {r.question}</p>
                                            {r.isCorrect ? <CheckCircle size={18} className="text-green-500 shrink-0" /> : <Target size={18} className="text-red-500 shrink-0" />}
                                        </div>
                                        <p className="text-xs mt-1 opacity-80">
                                            Answer: <span className="font-semibold">{r.correctAns}</span>
                                            {!r.isCorrect && <> (You said: <span className="line-through opacity-70">{r.yourAns}</span>)</>}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 justify-center">
                                <button onClick={() => window.location.href = '/dashboard'} className="px-8 py-3 bg-slate-200 text-slate-800 rounded-xl font-bold hover:bg-slate-300 transition">
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // --- QUIZ VIEW ---
    if (!challenge || !challenge.questions || challenge.questions.length === 0) {
        return (
            <>
                <Navbar />
                <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                    <div className="p-4 bg-red-100 text-red-600 rounded-full mb-4">
                        <Trophy size={32} />
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Challenge Not Available</h2>
                    <p className="max-w-md mb-6">We couldn't load today's challenge. Please try again later or check your connection.</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        Retry
                    </button>
                </div>
            </>
        );
    }

    const currentQ = challenge.questions[currentIndex];
    // Calculate progress percentage
    const progress = ((currentIndex) / (challenge?.questions?.length || 1)) * 100;


    // Bookmark handler
    const handleBookmark = async () => {
        try {
            await api.post("/challenge/bookmark", {
                questionId: currentQ._id, // Might get undefined if AI gen, using text fallback
                question: currentQ.question,
                options: currentQ.options,
                correctAnswer: currentQ.correctAnswer,
                type: currentQ.type
            });
            // Show toast or visual feedback? For now, we assume success
            // Ideal: Add isBookmarked state locally
        } catch (err) {
            console.error("Bookmark failed", err);
        }
    };

    return (
        <>
            <Navbar />
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'} py-12 px-6`}>
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">

                    {/* Main Quiz Card */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Progress Bar */}
                        <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <span>Question {currentIndex + 1} of {challenge?.questions.length}</span>
                            <span>{challenge?.difficulty} Difficulty</span>
                        </div>

                        <div className={`rounded-3xl p-8 border min-h-[400px] flex flex-col ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-xl'} relative`}>

                            {/* Bookmark Button */}
                            <button
                                onClick={handleBookmark}
                                className="absolute top-8 right-8 text-slate-300 hover:text-yellow-500 transition-colors"
                            >
                                <Star size={24} />
                            </button>

                            <div className="flex-grow">
                                <h2 className="text-2xl font-bold mb-6 pr-10">{currentQ?.question}</h2>

                                {/* Options */}
                                <div className="space-y-3">
                                    {currentQ?.options?.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleOptionSelect(opt)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group flex items-center justify-between
                        ${selectedOption === opt
                                                    ? "border-green-500 bg-green-50/10 ring-1 ring-green-500"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-green-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                }
                      `}
                                        >
                                            <span className={`font-medium ${selectedOption === opt ? 'text-green-600 dark:text-green-400' : ''}`}>{opt}</span>
                                            {selectedOption === opt && <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={!selectedOption || submitting}
                                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? 'Submitting...' : currentIndex === challenge.questions.length - 1 ? 'Finish Challenge' : 'Next Question'}
                                    {!submitting && <ArrowRight size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats (Gamification) */}
                    <div className="space-y-6">
                        <div className={`rounded-3xl p-6 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-lg'}`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Daily Reward</h3>
                                    <p className="text-sm text-slate-500">Complete to earn</p>
                                </div>
                            </div>

                            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                                <p className="text-3xl font-black text-yellow-500 flex items-center justify-center gap-2">
                                    <Zap fill="currentColor" /> {challenge?.xpReward} XP
                                </p>
                            </div>

                            <div className="mt-6">
                                <p className="text-xs text-slate-400 text-center uppercase tracking-widest mb-3">Today's Streak</p>
                                <div className="flex justify-center gap-2 items-center">
                                    <div className="text-4xl font-black text-orange-500">
                                        {user?.streak || 0}
                                    </div>
                                    <div className="text-sm font-bold text-slate-500">DAYS</div>
                                </div>
                                <p className="text-xs text-center text-slate-400 mt-2">Come back tomorrow to keep it going!</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
