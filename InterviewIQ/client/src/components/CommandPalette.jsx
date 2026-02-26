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
    LogOut,
    Sun,
    Moon,
    Sparkles,
    Briefcase,
    TrendingUp,
    History,
    Zap
} from 'lucide-react';
import { useTheme } from '../context/themeContext';
import { useAuth } from '../context/authContext';

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

    const { isDarkMode, toggleTheme } = useTheme();
    const { logout } = useAuth();

    // Define commands
    const commands = [
        {
            id: 'dashboard',
            group: 'Navigation',
            label: 'Go to Dashboard',
            icon: Home,
            action: () => navigate('/dashboard'),
            keywords: ['home', 'main', 'overview'],
        },
        {
            id: 'profile',
            group: 'Navigation',
            label: 'View My Profile',
            icon: User,
            action: () => navigate('/profile'),
            keywords: ['settings', 'account', 'preferences'],
        },
        {
            id: 'analytics',
            group: 'Navigation',
            label: 'View Performance Analytics',
            icon: BarChart3,
            action: () => navigate('/analytics'),
            keywords: ['insights', 'data', 'trends', 'score'],
        },
        {
            id: 'start-interview',
            group: 'Training',
            label: 'Start New Mock Interview',
            icon: PlayCircle,
            action: () => navigate('/interview/type'),
            keywords: ['mock', 'practice', 'begin', 'ai'],
        },
        {
            id: 'resume-clinic',
            group: 'Training',
            label: 'Analyze Resume (Resume Clinic)',
            icon: Briefcase,
            action: () => navigate('/resume-clinic'),
            keywords: ['upload', 'pdf', 'fix', 'career'],
        },
        {
            id: 'daily-challenge',
            group: 'Training',
            label: "Today's Daily Challenge",
            icon: Trophy,
            action: () => navigate('/daily-challenge'),
            keywords: ['streak', 'quiz', 'practice', 'reward'],
        },
        {
            id: 'questions',
            group: 'Training',
            label: 'Browse Question Bank',
            icon: Sparkles,
            action: () => navigate('/questions-subject'),
            keywords: ['topics', 'subjects', 'bank'],
        },
        {
            id: 'bookmarks',
            group: 'Personal',
            label: 'My Saved Bookmarks',
            icon: Bookmark,
            action: () => navigate('/bookmarks'),
            keywords: ['saved', 'favorites', 'marked'],
        },
        {
            id: 'history',
            group: 'Personal',
            label: 'Challenge History',
            icon: History,
            action: () => navigate('/history'),
            keywords: ['past', 'previous', 'completed'],
        },
        {
            id: 'leaderboard',
            group: 'Community',
            label: 'Global Leaderboard',
            icon: TrendingUp,
            action: () => navigate('/leaderboard'),
            keywords: ['rank', 'top', 'players', 'xp'],
        },
        {
            id: 'forum',
            group: 'Community',
            label: 'Community Forum',
            icon: MessageSquare,
            action: () => navigate('/forum'),
            keywords: ['discussion', 'posts', 'help'],
        },
        {
            id: 'toggle-theme',
            group: 'Settings',
            label: `Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`,
            icon: isDarkMode ? Sun : Moon,
            action: () => toggleTheme(),
            keywords: ['color', 'appearance', 'style', 'brightness'],
        },
        {
            id: 'logout',
            group: 'Settings',
            label: 'Logout Account',
            icon: LogOut,
            action: () => logout(),
            keywords: ['sign out', 'exit', 'leave'],
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

    // Get unique groups from filtered commands
    const groups = [...new Set(filteredCommands.map(cmd => cmd.group))];

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

    // Handle custom open event
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-command-palette', handleOpen);
        return () => window.removeEventListener('open-command-palette', handleOpen);
    }, []);

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
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-start justify-center pt-[15vh] p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-4 p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500">
                                <Search size={24} />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search commands (e.g., 'Practice', 'Leaderboard')..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-xl font-medium"
                            />
                            <div className="flex items-center gap-2">
                                <kbd className="px-2.5 py-1.5 text-xs font-black bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
                                    ESC
                                </kbd>
                            </div>
                        </div>

                        {/* Commands List */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-3">
                            {filteredCommands.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Sparkles size={40} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500">No matching commands</h3>
                                    <p className="text-slate-500 dark:text-slate-600 mt-2">Try searching for symbols or keywords like 'Resume'</p>
                                </div>
                            ) : (
                                <div className="space-y-6 py-2">
                                    {groups.map((group) => (
                                        <div key={group} className="space-y-2">
                                            <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                                                {group}
                                            </h4>
                                            <div className="space-y-1">
                                                {filteredCommands
                                                    .filter(cmd => cmd.group === group)
                                                    .map((command) => {
                                                        const globalIndex = filteredCommands.findIndex(c => c.id === command.id);
                                                        const Icon = command.icon;
                                                        const isSelected = globalIndex === selectedIndex;

                                                        return (
                                                            <button
                                                                key={command.id}
                                                                onClick={() => executeCommand(command)}
                                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                                className={`
                                                                    w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200
                                                                    ${isSelected
                                                                        ? 'bg-yellow-500 text-white shadow-xl shadow-yellow-500/30 -translate-y-0.5'
                                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300'
                                                                    }
                                                                `}
                                                            >
                                                                <div className={`
                                                                    w-11 h-11 rounded-2xl flex items-center justify-center transition-all
                                                                    ${isSelected
                                                                        ? 'bg-white/20'
                                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                                                    }
                                                                `}>
                                                                    <Icon size={22} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <span className="font-bold text-base block">{command.label}</span>
                                                                    <span className={`text-[10px] uppercase font-black tracking-widest opacity-60 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                                                        {command.keywords.slice(0, 3).join(' • ')}
                                                                    </span>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="flex items-center gap-1 opacity-80">
                                                                        <kbd className="px-2 py-1 text-[10px] font-black bg-white/20 rounded-lg border border-white/30">
                                                                            RETURN
                                                                        </kbd>
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
                            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <kbd className="px-1.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">↑</kbd>
                                        <kbd className="px-1.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">↓</kbd>
                                    </div>
                                    Navigate
                                </span>
                                <span className="flex items-center gap-2">
                                    <kbd className="px-1.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">↵</kbd>
                                    Select
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-500">
                                <Zap size={12} className="fill-current" /> Fast Navigation
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
