import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Orbit, Sparkles, Target, TrendingUp } from "lucide-react";

const slides = [
  {
    icon: Orbit,
    title: "Prepare with direction",
    subtitle: "Structured interview practice that stays clear and focused.",
    color: "#10b981"
  },
  {
    icon: Lightbulb,
    title: "Daily reps that stick",
    subtitle: "Small challenge loops that build consistency over time.",
    color: "#f59e0b"
  },
  {
    icon: TrendingUp,
    title: "Track real progress",
    subtitle: "See how your confidence and performance are changing.",
    color: "#3b82f6"
  },
  {
    icon: Target,
    title: "Train for the outcome",
    subtitle: "Sharpen decisions, delivery, and interview readiness.",
    color: "#f43f5e"
  },
];

export default function AuthBranding() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[index];
  const Icon = slide.icon;

  return (
    <div className="relative flex min-h-[450px] w-full flex-col items-center justify-center bg-white px-8 py-16 lg:min-h-screen lg:px-12">
      {/* Background Pattern - Extremely Subtle */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#10b981 0.5px, transparent 0.5px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Small Logo & Text Section */}
      <div className="absolute top-10 left-10 z-20 flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/10"
        >
          <Orbit size={22} className="text-white" />
        </motion.div>
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[1.5rem] font-black tracking-tight text-[#1f2e2a]"
        >
          VivaMate
        </motion.span>
      </div>

      <div className="relative z-10 flex w-full max-w-[500px] flex-col items-center text-center pt-20">
        {/* Slide Content */}
        <div className="flex w-full items-center justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -15 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <div
                className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-emerald-50 text-emerald-600 shadow-sm"
                style={{ backgroundColor: `${slide.color}08`, color: slide.color }}
              >
                <Icon size={44} strokeWidth={1.5} />
              </div>

              <h2 className="mb-4 text-[3rem] font-black leading-[1.05] tracking-tight text-[#1f2e2a] sm:text-[3.6rem]">
                {slide.title}
              </h2>

              <p className="max-w-[32ch] text-[17.5px] font-medium leading-relaxed text-[#64748b] sm:text-[20px]">
                {slide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Indicators */}
        <div className="mt-12 flex gap-2">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: index === i ? 36 : 8,
                backgroundColor: index === i ? "#10b981" : "#e2e8f0"
              }}
              className="h-2 rounded-full transition-all duration-300"
            />
          ))}
        </div>

        {/* Footer Tagline (Less visible/subtle) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-24 flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-500/40"
        >
          <div className="h-px w-8 bg-emerald-500/20" />
          <span>Smart prep, cleaner flow</span>
          <div className="h-px w-8 bg-emerald-500/20" />
        </motion.div>
      </div>
    </div>
  );
}