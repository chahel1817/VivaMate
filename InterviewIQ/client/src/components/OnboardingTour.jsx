import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import api from '../services/api';

/**
 * Simple Onboarding Welcome Component
 * Replaces react-joyride for React 19 compatibility
 */
export default function OnboardingTour() {
    const { user } = useAuth();
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        // Check if user has completed onboarding
        if (user && !user.hasCompletedOnboarding) {
            // Delay welcome message to let page load
            const timer = setTimeout(() => {
                setShowWelcome(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleClose = async () => {
        setShowWelcome(false);

        // Mark onboarding as complete
        if (user) {
            try {
                await api.put('/preferences/onboarding', { completed: true });
            } catch (error) {
                console.error('Failed to update onboarding status:', error);
            }
        }
    };

    if (!showWelcome) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-slideUp">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome to VivaMate!
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300">
                        Your AI-powered interview preparation platform
                    </p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                    <FeatureItem
                        icon="🎤"
                        title="Mock Interviews"
                        description="Practice with AI-generated questions tailored to your role"
                    />
                    <FeatureItem
                        icon="📊"
                        title="Performance Analytics"
                        description="Track your progress with detailed insights and feedback"
                    />
                    <FeatureItem
                        icon="🔥"
                        title="Daily Challenges"
                        description="Maintain your streak and improve your skills daily"
                    />
                    <FeatureItem
                        icon="💬"
                        title="Community Forum"
                        description="Connect with other job seekers and share tips"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95"
                    >
                        Get Started 🚀
                    </button>
                </div>

                {/* Pro Tip */}
                <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        <strong className="text-green-600 dark:text-green-400">Pro tip:</strong> Start with an easy interview to get familiar with the platform!
                    </p>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, description }) {
    return (
        <div className="flex gap-4 items-start">
            <div className="text-3xl flex-shrink-0">{icon}</div>
            <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    {description}
                </p>
            </div>
        </div>
    );
}
