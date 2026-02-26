import { useState, useEffect } from "react";
import { Zap, Brain, BarChart3, Trophy, Target } from "lucide-react";

const slides = [
    {
        icon: Brain,
        headline: "AI-Powered\nInterview Coach",
        sub: "Get instant feedback on every answer — technical depth, clarity, and confidence scored in seconds.",
        accent: "#22c55e",
    },
    {
        icon: BarChart3,
        headline: "Track Every\nImprovement",
        sub: "Detailed analytics reveal exactly where you're growing and which skills need the most attention.",
        accent: "#818cf8",
    },
    {
        icon: Trophy,
        headline: "Compete &\nStay Motivated",
        sub: "Climb the leaderboard, keep your streak alive, and unlock badges as you master new skills.",
        accent: "#f59e0b",
    },
    {
        icon: Target,
        headline: "Practice Smarter,\nNot Harder",
        sub: "Targeted question sets built around your weak spots, so every session moves the needle.",
        accent: "#06b6d4",
    },
];

export default function AuthBranding() {
    const [index, setIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const t = setInterval(() => {
            setAnimating(true);
            setTimeout(() => {
                setIndex(p => (p + 1) % slides.length);
                setAnimating(false);
            }, 300);
        }, 4500);
        return () => clearInterval(t);
    }, []);

    const { icon: Icon, headline, sub, accent } = slides[index];

    return (
        <div className="hidden md:flex flex-col bg-[#080d18] text-white px-12 lg:px-16 py-14 relative overflow-hidden select-none">

            {/* Deep layered background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
                />
                {/* Grid */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
                {/* Glow blobs */}
                <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-[140px]"
                    style={{ background: `${accent}12`, transition: 'background 1s ease' }} />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[100px] bg-white/[0.02]" />
            </div>

            {/* Logo */}
            <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-900/60">
                    <Zap size={20} className="text-white fill-white" />
                </div>
                <span className="text-2xl font-black tracking-tight">VivaMate</span>
            </div>

            {/* Slide */}
            <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
                <div
                    className="space-y-6 transition-all duration-300"
                    style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(16px)' : 'translateY(0)' }}
                >
                    {/* Icon badge */}
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center border"
                        style={{
                            background: `${accent}15`,
                            borderColor: `${accent}30`,
                            boxShadow: `0 0 40px ${accent}15`
                        }}
                    >
                        <Icon size={30} style={{ color: accent }} />
                    </div>

                    {/* Headline — preserves \n line breaks */}
                    <h2 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight whitespace-pre-line">
                        {headline}
                    </h2>

                    <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                        {sub}
                    </p>
                </div>

                {/* Dot indicators */}
                <div className="flex gap-2 mt-12">
                    {slides.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => { setAnimating(true); setTimeout(() => { setIndex(i); setAnimating(false); }, 300); }}
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                                width: i === index ? '32px' : '8px',
                                background: i === index ? accent : '#ffffff18',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom tagline — no fake metrics */}
            <div className="relative z-10 pt-8 border-t border-white/5">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    The platform built to bridge the gap between{" "}
                    <span className="text-slate-400">preparation</span> and{" "}
                    <span className="text-slate-400">peak performance</span>.
                </p>
            </div>
        </div>
    );
}
