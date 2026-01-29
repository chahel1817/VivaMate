import { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';
import api from '../services/api';

/**
 * Interactive Onboarding Tour Component
 * Guides new users through key features
 */
export default function OnboardingTour() {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [run, setRun] = useState(false);

    useEffect(() => {
        // Check if user has completed onboarding
        if (user && !user.hasCompletedOnboarding) {
            // Delay tour start to let page load
            const timer = setTimeout(() => {
                setRun(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const steps = [
        {
            target: 'body',
            content: (
                <div>
                    <h2 className="text-xl font-bold mb-2">Welcome to VivaMate! 🎉</h2>
                    <p>Let's take a quick tour to help you get started with your interview preparation journey.</p>
                </div>
            ),
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: '[data-tour="dashboard"]',
            content: 'This is your Dashboard - your command center for tracking progress and accessing all features.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="start-interview"]',
            content: 'Click here to start a mock interview. Choose your domain, technology, and difficulty level.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="daily-challenge"]',
            content: 'Take the Daily Challenge to maintain your streak and earn XP! 🔥',
            placement: 'bottom',
        },
        {
            target: '[data-tour="performance"]',
            content: 'View detailed analytics of your interview performance and track your improvement over time.',
            placement: 'bottom',
        },
        {
            target: '[data-tour="profile"]',
            content: 'Customize your profile, update your career stage, and manage your preferences here.',
            placement: 'left',
        },
        {
            target: 'body',
            content: (
                <div>
                    <h2 className="text-xl font-bold mb-2">You're all set! 🚀</h2>
                    <p className="mb-3">Start practicing and ace your next interview!</p>
                    <p className="text-sm text-slate-500">
                        <strong>Pro tip:</strong> Press <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl+K</kbd> anytime to open the command palette.
                    </p>
                </div>
            ),
            placement: 'center',
        },
    ];

    const handleJoyrideCallback = async (data) => {
        const { status } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);

            // Mark onboarding as complete - only if user is logged in
            if (user) {
                try {
                    await api.put('/preferences/onboarding', { completed: true });
                } catch (error) {
                    console.error('Failed to update onboarding status:', error);
                }
            }
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: '#16a34a',
                    textColor: isDarkMode ? '#f1f5f9' : '#1e293b',
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    arrowColor: isDarkMode ? '#1e293b' : '#ffffff',
                    overlayColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 10000,
                },
                tooltip: {
                    borderRadius: 12,
                    padding: 20,
                },
                buttonNext: {
                    backgroundColor: '#16a34a',
                    borderRadius: 8,
                    padding: '8px 16px',
                },
                buttonBack: {
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    marginRight: 10,
                },
                buttonSkip: {
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                },
            }}
            locale={{
                back: 'Back',
                close: 'Close',
                last: 'Finish',
                next: 'Next',
                skip: 'Skip Tour',
            }}
        />
    );
}
