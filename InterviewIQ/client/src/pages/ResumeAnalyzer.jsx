import React, { useState } from 'react';
import {
    Upload,
    ChevronDown,
    Layout,
    AlertCircle,
    CheckCircle2,
    RefreshCcw,
    Sparkles,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    XCircle,
    ListChecks,
    Percent,
    Briefcase,
    Terminal,
    Award,
    Activity,
    Edit3,
    AlertTriangle,
    Flag,
    Cpu,
    UserCircle,
    ArrowDown,
    FileText,
    Zap,
    Target
} from 'lucide-react';
import { useTheme } from '../context/themeContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResumeAnalyzer = () => {
    const { isDarkMode } = useTheme();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            toast.error('Please upload a valid PDF file');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const selectedFile = e.dataTransfer.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            toast.error('Please upload a valid PDF file');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await api.post('/upload/resume/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setResult(response.data.analysis);
                toast.success('Analysis complete!');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    const ProgressBar = ({ percent, colorClass = "bg-green-500", label }) => (
        <div className="w-full">
            <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{label}</span>
                <span className="text-[11px] font-black">{percent}%</span>
            </div>
            <div className={`h-1.5 w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'} rounded-full overflow-hidden`}>
                <div
                    className={`h-full transition-all duration-1000 ${colorClass}`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );

    const SectionHeader = ({ title, icon: Icon, color = "text-green-500" }) => (
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <Icon size={20} className={color} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
            <div className="h-[1px] flex-1 bg-current opacity-10"></div>
        </div>
    );

    return (
        <>
            <Navbar />
            <div className={`min-h-screen ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-900'} py-12 px-6 relative overflow-hidden`}>
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">

                    {/* Header */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <Zap size={14} className="fill-current" />
                            <span>Neural ATS Scanner v4.0</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-none">
                            Resume <span className="text-green-500">Clinic.</span>
                        </h1>
                        <p className={`text-lg max-w-2xl mx-auto font-medium opacity-60`}>
                            Simulating recruiter decision-making models to find rejection triggers before they do.
                        </p>
                    </div>

                    {!result ? (
                        /* Upload Stage */
                        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    relative rounded-[48px] border-4 border-dashed p-16 transition-all duration-500
                                    ${isDragging ? 'border-green-500 bg-green-500/5 scale-[1.02]' :
                                        file ? 'border-green-500 bg-green-500/5' :
                                            isDarkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-200 bg-white shadow-2xl shadow-slate-200/40'}
                                `}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`
                                        w-28 h-28 rounded-[32px] flex items-center justify-center mb-10 
                                        transition-all duration-500 relative group
                                        ${file ? 'bg-green-600 text-white rotate-6 scale-110 shadow-2xl shadow-green-500/20' :
                                            isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400 opacity-80'}
                                    `}>
                                        <div className="absolute inset-0 bg-current opacity-10 blur-xl group-hover:opacity-20 transition-opacity" />
                                        {file ? <ShieldCheck size={48} /> : <Upload size={48} />}
                                    </div>

                                    {loading ? (
                                        <div className="space-y-8 w-full max-w-xs">
                                            <div className="flex flex-col items-center gap-4">
                                                <RefreshCcw className="animate-spin text-green-500" size={40} />
                                                <div className="space-y-1">
                                                    <h3 className="text-2xl font-black uppercase tracking-tighter">De-coding Resume</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Running 12-Layer Neural Check</p>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 animate-progress origin-left" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2 mb-12">
                                                <h3 className="text-3xl font-black tracking-tight">{file ? file.name : 'Boost Your Ranking'}</h3>
                                                <p className="text-sm font-bold opacity-40 max-w-xs mx-auto">
                                                    Upload your PDF to reveal the invisible rejection blocks that ATS bots use to shortlist candidates.
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-sm">
                                                <label className="flex-1 w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-xl shadow-green-900/40 flex items-center justify-center gap-2">
                                                    <FileText size={18} />
                                                    {file ? 'Change PDF' : 'Select PDF'}
                                                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                                                </label>
                                                {file && (
                                                    <button
                                                        onClick={handleUpload}
                                                        className={`flex-1 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:-translate-y-1 shadow-xl
                                                            ${isDarkMode ? 'bg-white text-slate-900 shadow-white/10' : 'bg-slate-900 text-white shadow-slate-900/20'}`}
                                                    >
                                                        <Sparkles size={18} />
                                                        Analyze
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mt-12 flex items-center gap-6 opacity-30 grayscale">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase"><ShieldCheck size={14} /> PDF SECURE</div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase"><Target size={14} /> ATS OPTIMIZED</div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase"><Award size={14} /> RECRUITER APPROVED</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Unified Dashboard */
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                            {/* 1. SCORE & SUMMARY */}
                            <div className="grid lg:grid-cols-12 gap-6">
                                <div className={`lg:col-span-4 p-10 rounded-[48px] border relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/30'} flex flex-col items-center justify-center text-center`}>
                                    <div className="absolute top-0 right-0 p-6 opacity-5">
                                        <Award size={120} />
                                    </div>
                                    <div className="relative mb-6">
                                        <svg className="w-48 h-48 transform -rotate-90">
                                            <circle cx="96" cy="96" r="86" className="stroke-slate-100 dark:stroke-slate-700 fill-none" strokeWidth="14" />
                                            <circle cx="96" cy="96" r="86" stroke="currentColor" strokeWidth="14" strokeDasharray={2 * Math.PI * 86} strokeDashoffset={2 * Math.PI * 86 * (1 - result.overallScore / 100)} className={`fill-none ${result.overallScore >= 80 ? 'text-green-500' : result.overallScore >= 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1500`} strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-7xl font-black tracking-tighter leading-none">{result.overallScore}</span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-1">Global Score</span>
                                        </div>
                                    </div>
                                    <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${result.overallScore >= 80 ? 'bg-green-500 shadow-green-500/20' : result.overallScore >= 60 ? 'bg-amber-500 shadow-amber-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
                                        Verdict: {result.verdict}
                                    </div>
                                </div>

                                <div className={`lg:col-span-8 p-10 rounded-[48px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/30'} flex flex-col justify-center relative overflow-hidden`}>
                                    <div className="flex items-center gap-3 text-green-500 mb-4">
                                        <UserCircle size={24} />
                                        <h2 className="text-2xl font-black uppercase tracking-tight">{result.detectedRole?.role}</h2>
                                    </div>
                                    <p className="text-lg font-medium opacity-60 mb-10 leading-relaxed italic">"{result.summary}"</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-slate-500/10">
                                        <ProgressBar percent={result.jdMatch?.overall} label="JD Match" colorClass="bg-green-500" />
                                        <ProgressBar percent={result.jobTitleAlignment?.score} label="Title Fit" colorClass="bg-indigo-500" />
                                        <ProgressBar percent={result.quantification?.score} label="Impact Score" colorClass="bg-amber-500" />
                                        <ProgressBar percent={result.benchmarks?.yourPercentile} label="Market Percentile" colorClass="bg-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            {/* 2. REJECTION BLOCKERS (VITAL) */}
                            <div className="space-y-6">
                                <SectionHeader title="Critical Rejection Blocks" icon={AlertTriangle} color="text-rose-500" />
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Red Flags combined with Missing Sections */}
                                    <div className={`p-8 rounded-[40px] border border-rose-500/20 bg-rose-500/5 backdrop-blur-sm relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-rose-500">
                                            <Flag size={120} />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase text-rose-500 mb-6 tracking-widest flex items-center gap-2">
                                            <Flag size={16} /> Content Traps
                                        </h4>
                                        <div className="space-y-6 relative z-10">
                                            {result.redFlags?.map((flag, i) => (
                                                <div key={i} className="flex gap-4 group">
                                                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                                        <XCircle size={16} className="text-rose-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black mb-1">{flag.message}</p>
                                                        <p className="text-xs opacity-60 leading-relaxed font-medium">{flag.solution}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {result.missingSections?.map((section, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                                        <AlertCircle size={16} className="text-rose-500" />
                                                    </div>
                                                    <p className="text-sm font-black">Missing Required Section: <span className="underline decoration-rose-500/30">{section}</span></p>
                                                </div>
                                            ))}
                                            {(!result.redFlags?.length && !result.missingSections?.length) && (
                                                <div className="flex items-center gap-3 text-green-500 bg-green-500/5 p-4 rounded-2xl border border-green-500/10">
                                                    <CheckCircle2 size={18} />
                                                    <p className="text-sm font-black uppercase tracking-tight">No content rejection triggers found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Formatting Blocks */}
                                    <div className={`p-8 rounded-[40px] border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-amber-500">
                                            <Layout size={120} />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase text-amber-500 mb-6 tracking-widest flex items-center gap-2">
                                            <Layout size={16} /> Machine Readability
                                        </h4>
                                        <div className="space-y-6 relative z-10">
                                            {result.formatting?.issues?.map((issue, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                                        <ShieldCheck size={16} className="text-amber-500" />
                                                    </div>
                                                    <p className="text-sm font-black leading-relaxed">{issue}</p>
                                                </div>
                                            ))}
                                            {(!result.formatting?.issues?.length) && (
                                                <div className="flex items-center gap-3 text-green-500 bg-green-500/5 p-4 rounded-2xl border border-green-500/10">
                                                    <CheckCircle2 size={18} />
                                                    <p className="text-sm font-black uppercase tracking-tight">Formatting is optimized for neural parsing.</p>
                                                </div>
                                            )}
                                            <div className="pt-6 mt-6 border-t border-amber-500/10 grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-1">Parser Type</div>
                                                    <div className="text-xs font-black uppercase">{result.formatting?.fileType || 'PDF Engine'}</div>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-1">Grid Flow</div>
                                                    <div className="text-xs font-black uppercase">{result.formatting?.isOneColumn ? 'Single Column' : 'Hybrid Layout'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. ACTIONABLE FIXES */}
                            <div className="space-y-6">
                                <SectionHeader title="Priority Correction Roadmap" icon={Edit3} color="text-indigo-500" />
                                <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Structural Fixes */}
                                    <div className={`p-10 rounded-[48px] border relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                                            <ListChecks size={120} />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase opacity-40 mb-8 tracking-[0.3em] flex items-center gap-2">
                                            <ListChecks size={16} className="text-indigo-500" /> Roadmap to Shortlist
                                        </h4>
                                        <div className="space-y-8 relative z-10">
                                            {result.improvements?.map((imp, i) => (
                                                <div key={i} className="group relative pl-6 border-l-2 border-slate-500/10 hover:border-indigo-500 transition-colors">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${imp.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                            {imp.priority} Priority
                                                        </span>
                                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-indigo-500" />
                                                    </div>
                                                    <h5 className="font-black text-[15px] mb-1.5 leading-tight">{imp.issue}</h5>
                                                    <p className="text-sm opacity-60 leading-relaxed font-medium">{imp.solution}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bullet Optimization */}
                                    <div className={`p-10 rounded-[48px] border relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'}`}>
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                                            <Percent size={120} />
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase opacity-40 mb-8 tracking-[0.3em] flex items-center gap-2">
                                            <TrendingUp size={16} className="text-green-500" /> Neural Bullet Rewrites
                                        </h4>
                                        <div className="space-y-8 relative z-10">
                                            {result.bulletRewrites?.slice(0, 3).map((rewrite, i) => (
                                                <div key={i} className="space-y-4">
                                                    <div className="p-4 bg-slate-500/5 rounded-2xl text-xs opacity-50 border border-dashed border-slate-500/30 italic leading-relaxed">
                                                        "{rewrite.before}"
                                                    </div>
                                                    <div className="flex justify-center -my-4 relative z-20">
                                                        <div className="bg-green-600 text-white p-1.5 rounded-full shadow-xl ring-4 ring-white dark:ring-slate-800"><TrendingUp size={14} /></div>
                                                    </div>
                                                    <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-2xl text-sm font-black text-green-500 leading-relaxed shadow-inner shadow-green-500/5">
                                                        {rewrite.after}
                                                    </div>
                                                    <div className="text-[10px] font-black uppercase text-indigo-500 tracking-widest px-1 flex items-center gap-2">
                                                        <Sparkles size={12} /> {rewrite.impact}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. TECHNICAL ALIGNMENT (SUPPORTING DATA) */}
                            <div className="grid lg:grid-cols-3 gap-8">
                                <div className={`p-8 rounded-[40px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <h4 className="text-[10px] font-black uppercase opacity-40 mb-6 flex items-center gap-2 tracking-widest">
                                        <Briefcase size={16} className="text-green-500" /> Matched Intelligence
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.keywords?.matched?.slice(0, 10).map((kw, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-green-500/10 text-green-500 border border-green-500/10 uppercase tracking-tighter">
                                                {kw}
                                            </span>
                                        ))}
                                        {result.keywords?.missing?.slice(0, 5).map((kw, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/10 uppercase tracking-tighter">
                                                +{kw.term}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={`p-8 rounded-[40px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <h4 className="text-[10px] font-black uppercase opacity-40 mb-6 flex items-center gap-2 tracking-widest">
                                        <Terminal size={16} className="text-slate-500" /> Neural Extraction
                                    </h4>
                                    <div className={`p-5 rounded-2xl font-mono text-[9px] h-32 overflow-auto ${isDarkMode ? 'bg-black/40' : 'bg-slate-900'} text-green-500/60 scrollbar-hide border border-white/5`}>
                                        <div className="opacity-20 mb-2">// RAW SCAN BUFFER v2.0</div>
                                        {result.atsSimulation?.rawExtraction}
                                    </div>
                                </div>

                                <div className={`p-8 rounded-[40px] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} flex flex-col justify-center`}>
                                    <button onClick={() => setResult(null)} className="group w-full py-6 bg-green-600 hover:bg-green-700 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-green-900/40">
                                        <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                                        New Diagnostic
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes progress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
                .animate-progress {
                    animation: progress 3s cubic-bezier(0.65, 0, 0.35, 1) forwards;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </>
    );
};

export default ResumeAnalyzer;
