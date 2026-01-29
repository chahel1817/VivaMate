import PropTypes from 'prop-types';

/**
 * Reusable Skeleton Loader Component
 * Provides loading placeholders with shimmer animation
 */
export default function SkeletonLoader({ variant = 'card', count = 1, className = '' }) {
    const variants = {
        card: 'h-48 w-full rounded-xl',
        list: 'h-16 w-full rounded-lg',
        chart: 'h-64 w-full rounded-xl',
        table: 'h-12 w-full rounded',
        avatar: 'h-12 w-12 rounded-full',
        text: 'h-4 w-3/4 rounded',
        title: 'h-8 w-1/2 rounded',
        button: 'h-10 w-24 rounded-lg',
        stat: 'h-24 w-full rounded-xl',
    };

    const skeletonClass = variants[variant] || variants.card;

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`skeleton ${skeletonClass} ${className}`}
                    aria-label="Loading..."
                    role="status"
                />
            ))}
        </>
    );
}

SkeletonLoader.propTypes = {
    variant: PropTypes.oneOf([
        'card',
        'list',
        'chart',
        'table',
        'avatar',
        'text',
        'title',
        'button',
        'stat',
    ]),
    count: PropTypes.number,
    className: PropTypes.string,
};

/**
 * Specialized skeleton components for common use cases
 */
export function CardSkeleton({ count = 1 }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 space-y-4">
                    <div className="skeleton h-6 w-1/3 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-5/6 rounded" />
                    <div className="flex gap-2 mt-4">
                        <div className="skeleton h-8 w-20 rounded-lg" />
                        <div className="skeleton h-8 w-20 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

CardSkeleton.propTypes = {
    count: PropTypes.number,
};

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <div className="skeleton h-8 w-1/3 rounded-lg" />
                <div className="skeleton h-4 w-1/2 rounded" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-32 rounded-xl" />
                ))}
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-48 rounded-2xl" />
                ))}
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
                <div className="skeleton h-6 w-1/4 rounded" />
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton h-16 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 space-y-4">
            <div className="skeleton h-6 w-1/3 rounded" />
            <div className="skeleton h-64 w-full rounded-xl" />
            <div className="flex gap-4 justify-center">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 5 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg"
                >
                    <div className="skeleton h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-3/4 rounded" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                    </div>
                    <div className="skeleton h-8 w-16 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

ListSkeleton.propTypes = {
    count: PropTypes.number,
};
