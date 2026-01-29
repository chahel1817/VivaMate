import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAuth } from '../context/authContext';
import { X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global Keyboard Shortcuts Handler
 * Provides keyboard navigation throughout the app
 */
export default function KeyboardShortcuts() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showHelp, setShowHelp] = useState(false);

    // Check if keyboard shortcuts are enabled
    const shortcutsEnabled = user?.keyboardShortcutsEnabled !== false;

    // Define shortcuts
    const shortcuts = [
        { key: 'ctrl+d, cmd+d', action: () => navigate('/dashboard'), label: 'Go to Dashboard', category: 'Navigation' },
        { key: 'ctrl+i, cmd+i', action: () => navigate('/interview/select'), label: 'Start Interview', category: 'Navigation' },
        { key: 'ctrl+p, cmd+p', action: () => navigate('/performance'), label: 'View Performance', category: 'Navigation' },
        { key: 'ctrl+shift+p, cmd+shift+p', action: () => navigate('/profile'), label: 'Go to Profile', category: 'Navigation' },
        { key: 'ctrl+shift+f, cmd+shift+f', action: () => navigate('/forum'), label: 'Open Forum', category: 'Navigation' },
        { key: 'ctrl+shift+c, cmd+shift+c', action: () => navigate('/daily-challenge'), label: 'Daily Challenge', category: 'Navigation' },
        { key: 'ctrl+/, cmd+/', action: () => setShowHelp(true), label: 'Show Shortcuts', category: 'Help' },
        { key: 'esc', action: () => setShowHelp(false), label: 'Close Modal', category: 'Help' },
    ];

    // Register shortcuts individually
    useHotkeys('ctrl+d, cmd+d', (e) => { if (shortcutsEnabled) { e.preventDefault(); navigate('/dashboard'); } }, { enableOnFormTags: false });
    useHotkeys('ctrl+i, cmd+i', (e) => { if (shortcutsEnabled) { e.preventDefault(); navigate('/interview/select'); } }, { enableOnFormTags: false });
    useHotkeys('ctrl+p, cmd+p', (e) => { if (shortcutsEnabled) { e.preventDefault(); navigate('/performance'); } }, { enableOnFormTags: false });
    useHotkeys('ctrl+shift+p, cmd+shift+p', (e) => { if (shortcutsEnabled) { e.preventDefault(); navigate('/profile'); } }, { enableOnFormTags: false });
    useHotkeys('ctrl+shift+f, cmd+shift+f', (e) => { if (shortcutsEnabled) { e.preventDefault(); navigate('/forum'); } }, { enableOnFormTags: false });
    useHotkeys('ctrl+shift+c, cmd+shift+c', (e) => { if (shortcutsEnabled) { e.preventDefault(); navigate('/daily-challenge'); } }, { enableOnFormTags: false });
    useHotkeys('ctrl+/, cmd+/', (e) => { if (shortcutsEnabled) { e.preventDefault(); setShowHelp(true); } }, { enableOnFormTags: false });
    useHotkeys('esc', () => { if (shortcutsEnabled) setShowHelp(false); }, { enableOnFormTags: true });

    // Group shortcuts by category
    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        const category = shortcut.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(shortcut);
        return acc;
    }, {});

    if (!shortcutsEnabled) return null;

    return (
        <AnimatePresence>
            {showHelp && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowHelp(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Keyboard className="text-green-600 dark:text-green-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                        Keyboard Shortcuts
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Navigate faster with keyboard commands
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHelp(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        {/* Shortcuts List */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                            {Object.entries(groupedShortcuts).map(([category, items]) => (
                                <div key={category} className="mb-6 last:mb-0">
                                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                        {category}
                                    </h3>
                                    <div className="space-y-2">
                                        {items.map((shortcut, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                            >
                                                <span className="text-slate-700 dark:text-slate-200 font-medium">
                                                    {shortcut.label}
                                                </span>
                                                <kbd className="px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm">
                                                    {shortcut.key.split(',')[0].replace('ctrl', '⌃').replace('cmd', '⌘').replace('shift', '⇧').replace('+', ' ')}
                                                </kbd>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                Press <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs border border-slate-300 dark:border-slate-600">Esc</kbd> to close
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
