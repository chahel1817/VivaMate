import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Animated Page Wrapper Component
 * Provides smooth page transitions using Framer Motion
 */
export default function AnimatedPage({ children, className = '' }) {
    const pageVariants = {
        initial: {
            opacity: 0,
            y: 20,
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
            },
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.3,
                ease: 'easeIn',
            },
        },
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
}

AnimatedPage.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

/**
 * Stagger Children Animation
 * Animates children elements with a delay
 */
export function StaggerContainer({ children, className = '', staggerDelay = 0.1 }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </motion.div>
    );
}

StaggerContainer.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    staggerDelay: PropTypes.number,
};

/**
 * Stagger Item
 * Individual item to be used within StaggerContainer
 */
export function StaggerItem({ children, className = '' }) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: 'easeOut',
            },
        },
    };

    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    );
}

StaggerItem.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

/**
 * Fade In Animation
 */
export function FadeIn({ children, delay = 0, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

FadeIn.propTypes = {
    children: PropTypes.node.isRequired,
    delay: PropTypes.number,
    className: PropTypes.string,
};

/**
 * Scale In Animation
 */
export function ScaleIn({ children, delay = 0, className = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

ScaleIn.propTypes = {
    children: PropTypes.node.isRequired,
    delay: PropTypes.number,
    className: PropTypes.string,
};

/**
 * Slide In Animation
 */
export function SlideIn({ children, direction = 'up', delay = 0, className = '' }) {
    const directions = {
        up: { y: 20 },
        down: { y: -20 },
        left: { x: 20 },
        right: { x: -20 },
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directions[direction] }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.4, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

SlideIn.propTypes = {
    children: PropTypes.node.isRequired,
    direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
    delay: PropTypes.number,
    className: PropTypes.string,
};
