import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/authContext";
import LoadingOverlay from "../components/LoadingOverlay";
import AuthBranding from "../components/AuthBranding";

const inputClassName =
  "auth-input w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center text-lg font-bold tracking-[0.5em] text-white outline-none transition-all placeholder:text-emerald-100/20 focus:border-emerald-400 focus:bg-white/10 focus:ring-4 focus:ring-emerald-400/10";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();

  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setError("");
    setLoading(true);

    try {
      await verifyOtp(email, otp);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid OTP code. Please try again.");
      setLoading(false);
    }
  };

  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-white">
      <LoadingOverlay isVisible={loading} type="otp" />
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block relative overflow-hidden border-slate-200 lg:border-r">
          <AuthBranding />
        </div>

        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1f5b4d] px-6 py-12 sm:px-8">
          {/* Subtle background patterns */}
          <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(60deg, #ffffff 25%, transparent 25.5%, transparent 75%, #ffffff 75.5%, #ffffff), linear-gradient(60deg, #ffffff 25%, transparent 25.5%, transparent 75%, #ffffff 75.5%, #ffffff)", backgroundSize: "40px 70px" }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-[440px]"
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-10 text-center sm:text-left"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-emerald-400 sm:mx-0 mx-auto">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-[2.5rem] font-black leading-tight tracking-tight text-white sm:text-[2.8rem]">
                Verify Identity
              </h1>
              <p className="mt-3 text-[17px] text-emerald-100/60 leading-relaxed">
                We've sent a 6-digit code to <span className="text-white font-semibold">{email}</span>.
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-medium text-rose-100">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 text-center">
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    placeholder="000000"
                    className={inputClassName}
                  />
                  <div className="absolute -bottom-8 left-0 right-0 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-100/20">
                      Enter 6-digit code
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-sm font-black uppercase tracking-[0.15em] text-white shadow-xl shadow-indigo-900/40 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12 border-t border-white/5 pt-8 text-center"
            >
              <p className="text-[15px] text-emerald-100/40">
                Didn't receive the code?{" "}
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="font-bold text-white underline decoration-emerald-500/30 underline-offset-4 transition-all hover:text-emerald-300 hover:decoration-emerald-500"
                >
                  Try Again
                </button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

