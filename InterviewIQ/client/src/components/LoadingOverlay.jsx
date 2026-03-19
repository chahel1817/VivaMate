import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, ShieldCheck, Zap, Lock, RefreshCw, Key, UserCheck, Smartphone, Database, Globe, Cpu } from 'lucide-react';

const messageSets = {
    register: {
        title: "Creating Your Account",
        messages: [
            { text: "Securing your account profile...", icon: <ShieldCheck className="w-5 h-5" /> },
            { text: "Setting up your interview dashboard...", icon: <Zap className="w-5 h-5" /> },
            { text: "Initializing real-time AI analytics...", icon: <Sparkles className="w-5 h-5" /> },
            { text: "Preparing your coding workspace...", icon: <Cpu className="w-5 h-5" /> },
            { text: "Implementing state-of-the-art encryption...", icon: <Lock className="w-5 h-5" /> },
            { text: "Syncing career trajectory data...", icon: <RefreshCw className="w-5 h-5" /> },
            { text: "Finalizing personalized details...", icon: <UserCheck className="w-5 h-5" /> },
            { text: "Optimizing dashboard performance...", icon: <Sparkles className="w-5 h-5" /> },
            { text: "Linking database security nodes...", icon: <Database className="w-5 h-5" /> },
            { text: "Preparing your first mock session...", icon: <Loader2 className="w-5 h-5 animate-spin" /> },
            { text: "Authenticating global access rules...", icon: <Globe className="w-5 h-5" /> },
            { text: "Double-checking security protocols...", icon: <Lock className="w-5 h-5" /> },
            { text: "Bootstrapping streak manager...", icon: <Zap className="w-5 h-5" /> },
            { text: "Finalizing cloud synchronization...", icon: <Database className="w-5 h-5" /> },
            { text: "Applying custom theme engine...", icon: <Sparkles className="w-5 h-5" /> },
            { text: "Ready to launch your career...", icon: <UserCheck className="w-5 h-5" /> },
            { text: "Polishing user session nodes...", icon: <Cpu className="w-5 h-5" /> },
            { text: "Verifying real-time sync...", icon: <RefreshCw className="w-5 h-5" /> },
            { text: "Almost there! Almost there...", icon: <Sparkles className="w-5 h-5" /> },
            { text: "Preparing final welcome...", icon: <ShieldCheck className="w-5 h-5" /> },
            { text: "Entering the VivaMate universe...", icon: <Globe className="w-5 h-5" /> },
        ]
    },
    login: {
        title: "Signing You In",
        messages: [
            { text: "Authenticating your credentials...", icon: <ShieldCheck className="w-5 h-5" /> },
            { text: "Loading your interview history...", icon: <Database className="w-5 h-5" /> },
            { text: "Retrieving personalized progress...", icon: <Sparkles className="w-5 h-5" /> },
            { text: "Establishing secure session...", icon: <Lock className="w-5 h-5" /> },
            { text: "Syncing your recent activity...", icon: <RefreshCw className="w-5 h-5" /> },
            { text: "Verifying account health index...", icon: <UserCheck className="w-5 h-5" /> },
            { text: "Optimizing session tunnel...", icon: <Zap className="w-5 h-5" /> },
            { text: "Welcome back! Entering portal...", icon: <ShieldCheck className="w-5 h-5" /> },
            { text: "Preparing today's daily briefing...", icon: <Sparkles className="w-5 h-5" /> },
            { text: "Connecting to mock interview engine...", icon: <Cpu className="w-5 h-5" /> },
            { text: "Scanning for new achievements...", icon: <Zap className="w-5 h-5" /> },
            { text: "Updating global ranking status...", icon: <Globe className="w-5 h-5" /> },
            { text: "Almost there! Fetching stats...", icon: <Loader2 className="w-5 h-5 animate-spin" /> },
            { text: "Refreshing community notifications...", icon: <RefreshCw className="w-5 h-5" /> },
            { text: "Finalizing secure handshake...", icon: <UserCheck className="w-5 h-5" /> },
            { text: "Stabilizing dashboard nodes...", icon: <Database className="w-5 h-5" /> },
            { text: "Opening your workspace...", icon: <Sparkles className="w-5 h-5" /> },
            { text: "Checking for daily goals...", icon: <Zap className="w-5 h-5" /> },
            { text: "Preparing your interview tools...", icon: <Cpu className="w-5 h-5" /> },
            { text: "Syncing with cloud backup...", icon: <RefreshCw className="w-5 h-5" /> },
            { text: "Finalizing session state...", icon: <ShieldCheck className="w-5 h-5" /> },
        ]
    },
    otp: {
        title: "Verifying Identity",
        messages: [
            { text: "Processing 6-digit security code...", icon: <Smartphone className="w-5 h-5" /> },
            { text: "Validating identity authenticity...", icon: <UserCheck className="w-5 h-5" /> },
            { text: "Matching secure session tokens...", icon: <Key className="w-5 h-5" /> },
            { text: "Authorizing account access...", icon: <Lock className="w-5 h-5" /> },
            { text: "Securing connection point...", icon: <ShieldCheck className="w-5 h-5" /> },
            { text: "Granting digital credentials...", icon: <Sparkles className="w-5 h-5" /> },
            { text: "Establishing trust handshake...", icon: <UserCheck className="w-5 h-5" /> },
            { text: "Refreshing security keys...", icon: <Key className="w-5 h-5" /> },
            { text: "Syncing identification data...", icon: <RefreshCw className="w-5 h-5" /> },
            { text: "Encryption complete. Safe...", icon: <Lock className="w-5 h-5" /> },
            { text: "Verifying trusted device status...", icon: <Smartphone className="w-5 h-5" /> },
            { text: "Almost confirmed. Hang tight...", icon: <ShieldCheck className="w-5 h-5" /> },
            { text: "Applying final validation tokens...", icon: <Zap className="w-5 h-5" /> },
            { text: "Confirming secure entry...", icon: <Database className="w-5 h-5" /> },
            { text: "Identity fully verified. Proceeding...", icon: <ShieldCheck className="w-5 h-5" /> },
            { text: "Checking auth integrity...", icon: <UserCheck className="w-5 h-5" /> },
            { text: "Completing secure redirect...", icon: <RefreshCw className="w-5 h-5" /> },
            { text: "Final session authorization...", icon: <Lock className="w-5 h-5" /> },
            { text: "All systems green. Moving on...", icon: <Sparkles className="w-5 h-5" /> },
        ]
    },
    forgot_password: {
        title: "Resetting Security Access",
        messages: [
            { text: "Updating account security layer...", icon: <ShieldCheck className="w-5 h-5" /> },
            { text: "Syncing new access credentials...", icon: <RefreshCw className="w-5 h-5" /> },
            { text: "Encrypting multi-layer security...", icon: <Lock className="w-5 h-5" /> },
            { text: "Refreshing session trust tokens...", icon: <Key className="w-5 h-5" /> },
            { text: "Establishing secure data tunnel...", icon: <Database className="w-5 h-5" /> },
            { text: "Applying protection protocols...", icon: <ShieldCheck className="w-5 h-5" /> },
            { text: "Validating security update status...", icon: <UserCheck className="w-5 h-5" /> },
            { text: "Almost finished! Just a second...", icon: <Sparkles className="w-5 h-5" /> },
            { text: "Restoring account integrity...", icon: <ShieldCheck className="w-5 h-5" /> },
            { text: "Updating master encryption keys...", icon: <Lock className="w-5 h-5" /> },
            { text: "Syncing results with server...", icon: <Database className="w-5 h-5" /> },
            { text: "Verifying secure handshake...", icon: <Key className="w-5 h-5" /> },
            { text: "Success! Reset sequence complete...", icon: <Sparkles className="w-5 h-5" /> },
            { text: "Redirecting to your dashboard...", icon: <Loader2 className="w-5 h-5 animate-spin" /> },
        ]
    }
};

const Star = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

export default function LoadingOverlay({ isVisible, type = "register" }) {
    const currentConfig = useMemo(() => messageSets[type] || messageSets.login, [type]);
    const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setCurrentMsgIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentMsgIndex((prev) => (prev + 1) % currentConfig.messages.length);
        }, 3500); // 3.5s feels dynamic but enough time to read

        return () => clearInterval(interval);
    }, [isVisible, currentConfig.messages.length]);

    const currentMsg = currentConfig.messages[currentMsgIndex];

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

                        <motion.h2
                            key={currentConfig.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-2 text-2xl font-black tracking-tight text-white mt-4"
                        >
                            {currentConfig.title}
                        </motion.h2>

                        <div className="relative h-6 mb-2 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentMsgIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex items-center justify-center gap-2 text-emerald-100/60 font-medium whitespace-nowrap"
                                >
                                    <span className="text-emerald-400">
                                        {currentMsg.icon}
                                    </span>
                                    <span>{currentMsg.text}</span>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 60, ease: "linear", repeat: Infinity }}
                                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                                />
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/20">
                                    Secure Connection
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 animate-pulse">
                                    {Math.round(((currentMsgIndex + 1) / currentConfig.messages.length) * 100)}%
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
