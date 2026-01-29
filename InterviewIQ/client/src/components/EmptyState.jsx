import PropTypes from 'prop-types';
import {
    FileQuestion,
    Inbox,
    Search,
    Bookmark,
    MessageSquare,
    TrendingUp,
    PlayCircle,
    AlertCircle,
} from 'lucide-react';

/**
 * Reusable Empty State Component
 * Shows helpful messages when no data is available
 */
export default function EmptyState({
    icon: Icon = Inbox,
    title = 'No data available',
    description = 'There is nothing to display at the moment.',
    actionLabel,
    onAction,
    variant = 'default',
}) {
    const variants = {
        default: {
            iconColor: 'text-slate-400',
            bgColor: 'bg-slate-100 dark:bg-slate-800',
        },
        primary: {
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        warning: {
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        },
        info: {
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
    };

    const { iconColor, bgColor } = variants[variant] || variants.default;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
            <div className={`${bgColor} p-6 rounded-full mb-6`}>
                <Icon size={48} className={iconColor} strokeWidth={1.5} />
            </div>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                {title}
            </h3>

            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                {description}
            </p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all-smooth hover-lift"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

EmptyState.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string,
    description: PropTypes.string,
    actionLabel: PropTypes.string,
    onAction: PropTypes.func,
    variant: PropTypes.oneOf(['default', 'primary', 'warning', 'info']),
};

/**
 * Specialized empty state components for common scenarios
 */
export function NoInterviewsEmpty({ onStartInterview }) {
    return (
        <EmptyState
            icon={PlayCircle}
            title="No interviews yet"
            description="Start your first mock interview to practice your skills and get AI-powered feedback."
            actionLabel="Start Interview"
            onAction={onStartInterview}
            variant="primary"
        />
    );
}

NoInterviewsEmpty.propTypes = {
    onStartInterview: PropTypes.func.isRequired,
};

export function NoActivityEmpty() {
    return (
        <EmptyState
            icon={TrendingUp}
            title="No recent activity"
            description="Your recent interview activity will appear here once you complete your first session."
            variant="default"
        />
    );
}

export function NoBookmarksEmpty({ onBrowseQuestions }) {
    return (
        <EmptyState
            icon={Bookmark}
            title="No bookmarks saved"
            description="Bookmark important questions during interviews to review them later."
            actionLabel={onBrowseQuestions ? "Browse Questions" : undefined}
            onAction={onBrowseQuestions}
            variant="info"
        />
    );
}

NoBookmarksEmpty.propTypes = {
    onBrowseQuestions: PropTypes.func,
};

export function NoSearchResultsEmpty({ searchTerm }) {
    return (
        <EmptyState
            icon={Search}
            title="No results found"
            description={
                searchTerm
                    ? `No results match "${searchTerm}". Try adjusting your search or filters.`
                    : 'Try adjusting your search criteria or filters.'
            }
            variant="default"
        />
    );
}

NoSearchResultsEmpty.propTypes = {
    searchTerm: PropTypes.string,
};

export function NoForumPostsEmpty({ onCreatePost }) {
    return (
        <EmptyState
            icon={MessageSquare}
            title="No forum posts yet"
            description="Be the first to start a discussion! Share your interview experiences or ask questions."
            actionLabel="Create Post"
            onAction={onCreatePost}
            variant="primary"
        />
    );
}

NoForumPostsEmpty.propTypes = {
    onCreatePost: PropTypes.func.isRequired,
};

export function NoFeedbackEmpty() {
    return (
        <EmptyState
            icon={FileQuestion}
            title="No feedback available"
            description="Complete an interview to receive detailed AI-powered feedback on your performance."
            variant="default"
        />
    );
}

export function ErrorEmpty({ message, onRetry }) {
    return (
        <EmptyState
            icon={AlertCircle}
            title="Something went wrong"
            description={message || "We couldn't load this content. Please try again."}
            actionLabel={onRetry ? "Try Again" : undefined}
            onAction={onRetry}
            variant="warning"
        />
    );
}

ErrorEmpty.propTypes = {
    message: PropTypes.string,
    onRetry: PropTypes.func,
};
