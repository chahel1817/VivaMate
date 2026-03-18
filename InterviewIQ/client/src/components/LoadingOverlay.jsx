import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

const messages = [
    { text: "Securing your account...", icon: <ShieldCheck className="w-5 h-5" /> },
    { text: "Optimizing your dashboard...", icon: <Zap className="w-5 h-5" /> },
    { text: "Preparing personalized questions...", icon: <Sparkles className="w-5 h-5" /> },
    { text: "Setting up your streak tracker...", icon: <Loader2 className="w-5 h-5 animate-spin" /> },
    { text: "Almost there! Finalizing details...", icon: <ShieldCheck className="w-5 h-5" /> },
];

export default function LoadingOverlay({ isVisible, type = "register" }) {
    const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

    useEffect(() => {
        if (!isVisible) return;

        const interval = setInterval(() => {
            setCurrentMsgIndex((prev) => (prev + 1) % messages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/80 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl"
                    >
                        <div className="relative mb-8 flex justify-center">
                            {/* Outer Glow */}
                            <div className="absolute inset-0 scale-150 animate-pulse rounded-full bg-emerald-500/20 blur-3xl" />

                            {/* Spinning Logo Container */}
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/20">
                                <Loader2 className="h-10 w-10 animate-spin text-white" strokeWidth={3} />
                            </div>
                        </div>

                        <h2 className="mb-2 text-2xl font-black tracking-tight text-white mt-4">
                            {type === "register" ? "Creating Account" : "Logging in"}
                        </h2>

                        <div className="flex items-center justify-center gap-2 text-emerald-100/60 font-medium h-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentMsgIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-emerald-400">
                                        {messages[currentMsgIndex].icon}
                                    </span>
                                    <span>{messages[currentMsgIndex].text}</span>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 15, ease: "linear", repeat: Infinity }}
                                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                />
                            </div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-100/30">
                                VivaMate Smart Auth
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
