import { useState, useEffect } from "react";

const sentences = [
    "AI-powered interview analysis for real growth.",
    "Get instant, actionable feedback after every session.",
    "Master technical, communication, and confidence skills.",
    "Track your progress with detailed analytics."
];

export default function AuthBranding() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % sentences.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hidden md:flex flex-col justify-center bg-green-600 text-white px-16 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <svg width="100%" height="100%">
                    <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="white" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#pattern)" />
                </svg>
            </div>

            <div className="relative z-10">
                <h1 className="text-5xl font-bold leading-tight mb-4">
                    VivaMate
                </h1>

                <div className="h-25">
                    <p className="text-3xl font-semibold leading-snug animate-fade-in-up transition-all duration-700 ease-in-out" key={index}>
                        {sentences[index]}
                    </p>
                </div>

                <p className="mt-2 text-green-100 max-w-sm text-lg">
                    The ultimate platform to bridge the gap between preparation and performance.
                </p>

                <div className="mt-12 flex gap-2">
                    {sentences.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-white' : 'w-2 bg-green-400'}`}
                        />
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    15% { opacity: 1; transform: translateY(0); }
                    85% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-20px); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 4s infinite;
                }
            `}} />
        </div>
    );
}
