import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Home,
    PlayCircle,
    BarChart3,
    User,
    MessageSquare,
    Trophy,
    Bookmark,
    Clock,
    TrendingUp,
} from 'lucide-react';

/**
 * Command Palette Component (Cmd+K / Ctrl+K)
 * Quick navigation and search interface
 */
export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // Define commands
    const commands = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: Home,
            action: () => navigate('/dashboard'),
            keywords: ['home', 'main', 'overview'],
        },
        {
            id: 'start-interview',
            label: 'Start Interview',
            icon: PlayCircle,
            action: () => navigate('/interview/select'),
            keywords: ['mock', 'practice', 'begin'],
        },

        {
            id: 'profile',
            label: 'My Profile',
            icon: User,
            action: () => navigate('/profile'),
            keywords: ['settings', 'account', 'preferences'],
        },
        {
            id: 'forum',
            label: 'Community Forum',
            icon: MessageSquare,
            action: () => navigate('/forum'),
            keywords: ['community', 'discussion', 'posts'],
        },
        {
            id: 'daily-challenge',
            label: 'Daily Challenge',
            icon: Trophy,
            action: () => navigate('/daily-challenge'),
            keywords: ['streak', 'quiz', 'practice'],
        },
        {
            id: 'bookmarks',
            label: 'Saved Bookmarks',
            icon: Bookmark,
            action: () => navigate('/bookmarks'),
            keywords: ['saved', 'favorites', 'marked'],
        },
        {
            id: 'history',
            label: 'Challenge History',
            icon: Clock,
            action: () => navigate('/history'),
            keywords: ['past', 'previous', 'completed'],
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: TrendingUp,
            action: () => navigate('/analytics'),
            keywords: ['insights', 'data', 'trends'],
        },
    ];

    // Filter commands based on search
    const filteredCommands = commands.filter((cmd) => {
        const searchLower = search.toLowerCase();
        return (
            cmd.label.toLowerCase().includes(searchLower) ||
            cmd.keywords.some((keyword) => keyword.includes(searchLower))
        );
    });

    // Open/close with Ctrl+K or Cmd+K
    useHotkeys('ctrl+k, cmd+k', (e) => {
        e.preventDefault();
        setIsOpen(true);
    });

    // Close with Escape
    useHotkeys('esc', () => {
        if (isOpen) {
            setIsOpen(false);
            setSearch('');
            setSelectedIndex(0);
        }
    }, { enableOnFormTags: true });

    // Navigate with arrow keys
    useHotkeys('up', (e) => {
        if (isOpen) {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
        }
    }, { enableOnFormTags: true });

    useHotkeys('down', (e) => {
        if (isOpen) {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
        }
    }, { enableOnFormTags: true });

    // Execute command with Enter
    useHotkeys('enter', () => {
        if (isOpen && filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
        }
    }, { enableOnFormTags: true });

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset selected index when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    const executeCommand = (command) => {
        command.action();
        setIsOpen(false);
        setSearch('');
        setSelectedIndex(0);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh] p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        transition={{ type: 'spring', duration: 0.3 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
                            <Search className="text-slate-400" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search commands..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-lg"
                            />
                            <kbd className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-600">
                                ESC
                            </kbd>
                        </div>

                        {/* Commands List */}
                        <div className="max-h-96 overflow-y-auto">
                            {filteredCommands.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                    <p>No commands found</p>
                                </div>
                            ) : (
                                <div className="p-2">
                                    {filteredCommands.map((command, index) => {
                                        const Icon = command.icon;
                                        const isSelected = index === selectedIndex;

                                        return (
                                            <button
                                                key={command.id}
                                                onClick={() => executeCommand(command)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`
                          w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                          ${isSelected
                                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                                                    }
                        `}
                                            >
                                                <div className={`
                          p-2 rounded-lg
                          ${isSelected
                                                        ? 'bg-green-100 dark:bg-green-900/40'
                                                        : 'bg-slate-100 dark:bg-slate-700'
                                                    }
                        `}>
                                                    <Icon size={18} />
                                                </div>
                                                <span className="flex-1 font-medium">{command.label}</span>
                                                {isSelected && (
                                                    <kbd className="px-2 py-1 text-xs font-semibold bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
                                                        ↵
                                                    </kbd>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">↑</kbd>
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">↓</kbd>
                                    Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">↵</kbd>
                                    Select
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">ESC</kbd>
                                    Close
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
