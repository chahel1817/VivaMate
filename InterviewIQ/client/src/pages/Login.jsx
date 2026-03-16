import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/authContext";
import AuthBranding from "../components/AuthBranding";

const inputClassName =
  "auth-input w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white outline-none transition-all placeholder:text-emerald-100/30 focus:border-emerald-400 focus:bg-white/10 focus:ring-4 focus:ring-emerald-400/10";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async () => {
    setError("");
    setSuccessMsg("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-white">
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
              <h1 className="text-[2.5rem] font-black leading-tight tracking-tight text-white sm:text-[2.8rem]">
                Welcome back
              </h1>
              <p className="mt-3 text-[17px] text-emerald-100/60">
                Log in to continue your daily preparation.
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {successMsg && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-100">
                    {successMsg}
                  </div>
                </motion.div>
              )}

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

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold uppercase tracking-widest text-emerald-100/50 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold uppercase tracking-widest text-emerald-100/50 ml-1">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[14px] font-semibold text-white-400 hover:text-emerald-300 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className={`${inputClassName} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-emerald-100/40 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-sm font-black uppercase tracking-[0.15em] text-white shadow-xl shadow-indigo-900/40 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Sign In to VivaMate
                      <LogIn size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-10 border-t border-white/5 pt-8 text-center"
            >
              <p className="text-[15px] text-emerald-100/40">
                Don't have an account yet?{" "}
                <Link to="/register" className="font-bold text-white underline decoration-emerald-500/30 underline-offset-4 transition-all hover:text-emerald-300 hover:decoration-emerald-500">
                  Create Account
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

