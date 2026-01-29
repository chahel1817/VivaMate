import PropTypes from 'prop-types';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

/**
 * Accessible Tooltip Component using Radix UI
 * Supports keyboard navigation and screen readers
 */
export function TooltipProvider({ children }) {
    return (
        <TooltipPrimitive.Provider delayDuration={300}>
            {children}
        </TooltipPrimitive.Provider>
    );
}

TooltipProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default function Tooltip({
    children,
    content,
    side = 'top',
    align = 'center',
    shortcut,
}) {
    if (!content) return children;

    return (
        <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
                {children}
            </TooltipPrimitive.Trigger>

            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={side}
                    align={align}
                    sideOffset={5}
                    className="
            z-50 overflow-hidden rounded-lg
            bg-slate-900 dark:bg-slate-700
            px-3 py-2 text-sm text-white
            shadow-lg animate-fade-in
            max-w-xs
          "
                >
                    <div className="flex items-center gap-2">
                        <span>{content}</span>
                        {shortcut && (
                            <kbd className="
                px-1.5 py-0.5 text-xs font-semibold
                bg-slate-700 dark:bg-slate-600
                rounded border border-slate-600 dark:border-slate-500
              ">
                                {shortcut}
                            </kbd>
                        )}
                    </div>
                    <TooltipPrimitive.Arrow className="fill-slate-900 dark:fill-slate-700" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    );
}

Tooltip.propTypes = {
    children: PropTypes.node.isRequired,
    content: PropTypes.string.isRequired,
    side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
    align: PropTypes.oneOf(['start', 'center', 'end']),
    shortcut: PropTypes.string,
};
