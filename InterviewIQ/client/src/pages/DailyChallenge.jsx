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
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
                <div className="relative mb-8">
                    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-yellow-500"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="text-yellow-500 animate-pulse" size={32} />
                    </div>
                </div>
                <h2 className="text-3xl font-black mb-4 animate-pulse">Generating Your Challenge</h2>
                <div className="max-w-md space-y-4">
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Our AI is crafting personalized questions just for you...
                    </p>
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
                        <p className="text-sm font-semibold text-yellow-500 uppercase tracking-widest mb-1">Pro Tip</p>
                        <p className="text-sm italic">
                            This might take up to 30 seconds. Perfect time to grab a sip of water! 💧
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- ALREADY COMPLETED VIEW ---
    if (challenge?.completed) {
        return (
            <>
                <Navbar />
                <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'} relative overflow-hidden`}>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 max-w-lg w-full animate-scale-in">
                        <div className="p-8 bg-green-500/10 text-green-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-lg shadow-green-500/10">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-4xl font-black mb-4 tracking-tight">Mission Accomplished!</h2>
                        <p className={`text-lg mb-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                            You've already conquered today's challenge. Rest up and come back tomorrow for a fresh set of questions!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="px-8 py-4 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-2xl font-black hover:scale-105 transition shadow-xl"
                            >
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => window.location.href = '/history'}
                                className={`px-8 py-4 rounded-2xl font-black border-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
                            >
                                View History
                            </button>
                        </div>
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
                <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'} py-12 px-6 relative overflow-hidden`}>
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>

                    <div className="max-w-2xl mx-auto relative z-10">
                        <div className={`rounded-[2.5rem] p-10 border shadow-2xl ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100'} backdrop-blur-xl animate-scale-in text-center`}>
                            <div className="inline-flex p-5 rounded-3xl bg-yellow-500/10 text-yellow-500 mb-8 border border-yellow-500/20 animate-bounce-slow">
                                <Trophy size={64} />
                            </div>

                            <h1 className="text-5xl font-black mb-2 tracking-tight">Challenge Stats</h1>
                            <p className={`text-lg mb-10 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Legendary performance today!</p>

                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className={`p-8 rounded-[2rem] ${isDarkMode ? 'bg-slate-900/50 border border-slate-700' : 'bg-slate-50/80 border border-slate-100'} flex flex-col items-center`}>
                                    <p className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Final Score</p>
                                    <p className="text-4xl font-black mt-1">{result.score} <span className="text-xl text-slate-400">/ {result.total}</span></p>
                                </div>
                                <div className={`p-8 rounded-[2rem] ${isDarkMode ? 'bg-slate-900/50 border border-slate-700' : 'bg-slate-50/80 border border-slate-100'} flex flex-col items-center relative overflow-hidden group`}>
                                    <Zap className="absolute -right-2 -bottom-2 text-yellow-500/10 w-20 h-20" />
                                    <p className="text-xs text-slate-500 uppercase font-black tracking-[0.2em] mb-2">XP Earned</p>
                                    <p className="text-4xl font-black mt-1 text-yellow-500 animate-pulse">+{result.xpGained}</p>
                                </div>
                            </div>

                            {/* Streak Info */}
                            {result.streakBonus > 0 && (
                                <div className={`p-6 rounded-3xl border-2 mb-10 animate-slide-up ${isDarkMode ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50 border-orange-100'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/30">
                                                <Flame size={28} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-lg text-orange-600 dark:text-orange-400 italic">STREAK BONUS!</p>
                                                <p className="text-sm font-bold opacity-60">Current Streak: {result.currentStreak} days</p>
                                            </div>
                                        </div>
                                        <p className="text-3xl font-black text-orange-500">+{result.streakBonus} XP</p>
                                    </div>
                                </div>
                            )}

                            {/* Breakdown */}
                            <div className="text-left space-y-4 mb-10">
                                <h3 className="font-black text-xl mb-6 flex items-center gap-2">
                                    <Star className="text-yellow-500 shrink-0" size={20} />
                                    Detailed Review
                                </h3>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {result.results.map((r, i) => (
                                        <div key={i} className={`p-5 rounded-2xl border-2 transition-all ${r.isCorrect
                                            ? 'border-green-500/20 bg-green-500/5'
                                            : 'border-red-500/20 bg-red-500/5'}`}>
                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                <p className="font-bold text-base leading-tight">
                                                    <span className="opacity-50 mr-2">Q{i + 1}</span> {r.question}
                                                </p>
                                                {r.isCorrect
                                                    ? <div className="p-1.5 bg-green-500 rounded-full shrink-0"><CheckCircle size={16} className="text-white" /></div>
                                                    : <div className="p-1.5 bg-red-500 rounded-full shrink-0"><Zap size={16} className="text-white" /></div>}
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                <div className={`px-3 py-1.5 rounded-lg font-bold ${r.isCorrect ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                                                    Result: {r.isCorrect ? 'Correct' : 'Incorrect'}
                                                </div>
                                                <div className="px-3 py-1.5 rounded-lg font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                    Correct: {r.correctAns}
                                                </div>
                                                {!r.isCorrect && (
                                                    <div className="px-3 py-1.5 rounded-lg font-bold bg-slate-800 text-white">
                                                        You said: {r.yourAns}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="px-10 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-[1.5rem] font-black transition-all shadow-xl shadow-yellow-500/20 hover-lift"
                                >
                                    Return to Training
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
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'} py-12 px-6 relative overflow-hidden`}>
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">

                    {/* Main Quiz Card */}
                    <div className="md:col-span-2 space-y-6 animate-slide-up">

                        {/* Progress Header */}
                        <div className={`rounded-3xl p-6 border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} backdrop-blur-xl`}>
                            <div className="flex justify-between items-center mb-4">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <Target className="text-yellow-500" size={24} />
                                        Daily Challenge
                                    </h2>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        {challenge?.difficulty} Difficulty • Question {currentIndex + 1} of {challenge?.questions.length}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-yellow-500">{Math.round(progress)}%</span>
                                </div>
                            </div>

                            <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-700 ease-out"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-3xl p-8 border min-h-[450px] flex flex-col ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-2xl'} backdrop-blur-xl relative transition-all duration-300`}>

                            {/* Bookmark Button */}
                            <button
                                onClick={handleBookmark}
                                className="absolute top-8 right-8 text-slate-300 hover:text-yellow-500 transition-colors"
                            >
                                <Star size={24} />
                            </button>

                            <div className="flex-grow flex flex-col">
                                <h2 className="text-2xl font-black mb-8 pr-12 leading-tight">
                                    {currentQ?.question}
                                </h2>

                                {/* Options */}
                                <div className="space-y-4">
                                    {currentQ?.options?.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleOptionSelect(opt)}
                                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group flex items-center gap-4 hover-lift
                                                ${selectedOption === opt
                                                    ? "border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500/50 shadow-lg shadow-yellow-500/10"
                                                    : "border-slate-100 dark:border-slate-700/50 hover:border-yellow-400 dark:hover:border-yellow-400 bg-slate-50/50 dark:bg-slate-900/40"
                                                }
                                            `}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-colors shrink-0
                                                ${selectedOption === opt
                                                    ? "bg-yellow-500 text-white"
                                                    : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                                                }
                                            `}>
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <span className={`font-bold text-lg flex-grow ${selectedOption === opt ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                                {opt}
                                            </span>
                                            {selectedOption === opt && (
                                                <div className="p-1 bg-yellow-500 rounded-full animate-scale-in">
                                                    <CheckCircle size={16} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-400 italic">
                                    Select the best answer to earn XP
                                </p>
                                <button
                                    onClick={handleNext}
                                    disabled={!selectedOption || submitting}
                                    className="px-10 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transform active:scale-95"
                                >
                                    <span>
                                        {submitting ? 'Submitting...' : currentIndex === challenge.questions.length - 1 ? 'Finish Challenge' : 'Next Question'}
                                    </span>
                                    {!submitting && <ArrowRight size={22} className="animate-pulse" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Stats (Gamification) */}
                    <div className="space-y-6 animate-slide-in-right">
                        <div className={`rounded-3xl p-8 border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-xl'} backdrop-blur-xl relative overflow-hidden`}>
                            {/* Background accent */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-2xl border border-yellow-500/20">
                                    <Trophy size={28} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-xl leading-tight">Potential Reward</h3>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-tighter">Completion Bonus</p>
                                </div>
                            </div>

                            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/20 overflow-hidden group">
                                <Zap className="absolute -right-4 -bottom-4 text-white/10 w-24 h-24 rotate-12 transition-transform group-hover:scale-110" />
                                <div className="relative">
                                    <p className="text-white/80 font-bold text-sm uppercase tracking-widest mb-1">Total XP</p>
                                    <p className="text-4xl font-black text-white flex items-center gap-2">
                                        +{challenge?.xpReward} <span className="text-lg opacity-80 underline underline-offset-4 decoration-white/30">XP</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Streak</span>
                                    <Flame size={20} className="text-orange-500 animate-pulse" />
                                </div>
                                <div className="flex justify-center flex-col items-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                                    <div className="text-6xl font-black text-orange-500 drop-shadow-sm mb-1">
                                        {user?.streak || 0}
                                    </div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] pl-[0.3em]">
                                        Day Streak
                                    </div>
                                </div>
                                <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed font-medium">
                                    Maintain your streak to earn <span className="text-yellow-500 font-bold">bonus XP multipliers</span> and unlock exclusive achievements!
                                </p>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className={`rounded-3xl p-6 border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-100 border-slate-200'} border-dashed`}>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Star size={14} className="text-yellow-500" />
                                Pro Question Tip
                            </h4>
                            <p className="text-sm italic text-slate-500 leading-relaxed">
                                Read each option carefully. AI-generated questions often have subtle differences between correct and incorrect answers.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
