import { useState, useEffect } from "react";
import { Orbit, Lightbulb, LineChart, Medal, Target, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
    {
        icon: Lightbulb,
        headline: "Your AI interview\ncoach awaits",
        sub: "Get instant feedback on every answer — technical depth, clarity, and confidence scored in seconds.",
        accent: "#22c55e",
        features: ["Real-time AI feedback", "Technical depth scoring", "Confidence tracking"]
    },
    {
        icon: LineChart,
        headline: "Start your interview\nprep today",
        sub: "Detailed analytics reveal exactly where you're growing and which skills need the most attention.",
        accent: "#818cf8",
        features: ["Skill gap analysis", "Progress visualization", "Personalized roadmaps"]
    },
    {
        icon: Medal,
        headline: "Compete &\nStay Motivated",
        sub: "Climb the leaderboard, keep your streak alive, and unlock badges as you master new skills.",
        accent: "#f59e0b",
        features: ["Weekly challenges", "Global rankings", "Unlockable skill badges"]
    },
    {
        icon: Target,
        headline: "Practice Smarter,\nNot Harder",
        sub: "Targeted question sets built around your weak spots, so every session moves the needle.",
        accent: "#06b6d4",
        features: ["Targeted question sets", "Mock simulations", "Performance history"]
    },
];

export default function AuthBranding() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const t = setInterval(() => {
            setIndex(p => (p + 1) % slides.length);
        }, 6000);
        return () => clearInterval(t);
    }, []);

    const { icon: Icon, headline, sub, accent, features } = slides[index];

    return (
        <div className="hidden md:flex flex-col bg-[#080d18] text-white px-12 lg:px-20 py-16 relative overflow-hidden select-none">

            {/* ── BACKGROUND LAYERS ── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Noise */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
                />
                {/* Grid */}
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '64px 64px' }} />

                {/* Dynamic Glow Blobs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full blur-[140px]"
                    style={{ background: accent }}
                />
                <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[120px] bg-blue-500/5" />
            </div>

            {/* ── LOGO ── */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-10 flex items-center gap-3.5 mb-12"
            >
                <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center shadow-2xl shadow-green-900/60 transition-transform hover:rotate-6">
                    <Orbit size={24} className="text-white fill-white" />
                </div>
                <span className="text-3xl font-black tracking-tighter">VivaMate</span>
            </motion.div>

            {/* ── CONTENT AREA (Stable layout via justify-start) ── */}
            <div className="relative z-10 flex-1 flex flex-col justify-start pt-10">
                <div className="min-h-[520px] relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-8 w-full"
                        >
                            {/* Featured Graphic/Badge */}
                            <div className="relative inline-block group mb-2">
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center border relative z-10 backdrop-blur-md"
                                    style={{
                                        background: `${accent}15`,
                                        borderColor: `${accent}40`,
                                        boxShadow: `0 0 60px ${accent}25`
                                    }}
                                >
                                    <Icon size={44} style={{ color: accent }} />
                                </motion.div>
                                {/* Outer pulsing ring */}
                                <div className="absolute inset-0 rounded-[2.5rem] border animate-ping opacity-20" style={{ borderColor: accent }} />
                            </div>

                            {/* Text Content */}
                            <div className="space-y-4">
                                <h2 className="text-5xl lg:text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight whitespace-pre-line drop-shadow-sm">
                                    {headline}
                                </h2>
                                <p className="text-slate-400 text-xl lg:text-2xl font-medium opacity-90 leading-relaxed max-w-lg">
                                    {sub}
                                </p>
                            </div>

                            {/* Feature Points — conversion boost */}
                            <div className="grid gap-3.5 pt-4">
                                {features.map((feat, i) => (
                                    <motion.div
                                        key={feat}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (i * 0.1) }}
                                        className="flex items-center gap-3 group/feat"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover/feat:bg-green-500/20 transition-colors">
                                            <CheckCircle2 size={14} className="text-green-500" />
                                        </div>
                                        <span className="text-slate-300 font-bold tracking-wide uppercase text-[11px] lg:text-xs tracking-[0.05em] group-hover/feat:text-white transition-colors">{feat}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dot indicators — fixed position relative to content above */}
                <div className="flex gap-3 mt-10">
                    {slides.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className="h-2 rounded-full transition-all duration-700 relative overflow-hidden group"
                            style={{
                                width: i === index ? '48px' : '10px',
                                background: i === index ? accent : '#ffffff10',
                            }}
                        >
                            {i === index && (
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "0%" }}
                                    transition={{ duration: 6, ease: "linear" }}
                                    className="absolute inset-0 bg-white/20"
                                />
                            )}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
