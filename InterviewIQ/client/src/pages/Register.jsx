import { Link, useNavigate } from "react-router-dom";
import { AtSign, KeyRound, ScanFace, Eye, EyeOff, Check, X, Loader2, Orbit, ArrowUpRight, Lightbulb, LineChart, Medal, Sparkles, UserRoundPlus, LogIn } from "lucide-react";
import { useState, useMemo } from "react";
import AuthBranding from "../components/AuthBranding";
import { useAuth } from "../context/authContext";
import { motion, AnimatePresence } from "framer-motion";

const FEATURES = [
  { icon: Lightbulb, label: "AI Feedback", color: "text-green-400", bg: "bg-green-500/10" },
  { icon: LineChart, label: "Analytics", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Medal, label: "Leaderboard", color: "text-amber-400", bg: "bg-amber-500/10" },
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRequirements = useMemo(() => {
    const { password } = formData;
    return [
      { id: "length", label: "8+ characters", met: password.length >= 8 },
      { id: "uppercase", label: "Uppercase letter", met: /[A-Z]/.test(password) },
      { id: "number", label: "One number", met: /[0-9]/.test(password) },
      { id: "special", label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [formData.password]);

  const isPasswordValid = passwordRequirements.every(r => r.met);
  const passwordStrength = passwordRequirements.filter(r => r.met).length;

  const strengthMeta = [
    null,
    { label: "Weak", color: "bg-red-500", text: "text-red-400" },
    { label: "Fair", color: "bg-orange-500", text: "text-orange-400" },
    { label: "Good", color: "bg-yellow-500", text: "text-yellow-400" },
    { label: "Strong", color: "bg-green-500", text: "text-green-400" },
  ][passwordStrength];

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) { setError("All fields are required"); return; }
    if (!formData.email.includes("@")) { setError("Enter a valid email address"); return; }
    if (!isPasswordValid) { setError("Please meet all password requirements"); return; }
    setLoading(true); setError("");
    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/", { state: { message: "Account created! Sign in to get started." } });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2 bg-[#080d18] selection:bg-green-500/30">

      {/* Desktop left panel */}
      <AuthBranding />

      {/* ── Right / full-page panel ── */}
      <div className="flex-1 flex flex-col bg-[#0d1117] relative overflow-hidden">
        {/* Background decorative glows */}
        <div className="absolute -top-[10%] -right-[10%] w-96 h-96 bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[10%] -left-[10%] w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* ══ MOBILE HERO (hidden md+) ══ */}
        <div className="md:hidden relative overflow-hidden px-6 pt-12 pb-10 bg-[#080d18]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-900/60 transition-transform hover:rotate-6">
              <Orbit size={20} className="text-white fill-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">VivaMate</span>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight mb-3">
            Start your interview<br />preparation today
          </h1>
          <p className="text-slate-400 text-base mb-8 leading-relaxed">Free account. No credit card required.</p>

          <div className="flex gap-2.5 flex-wrap">
            {FEATURES.map(f => (
              <div key={f.label} className={`flex items-center gap-2 px-4 py-2 rounded-full ${f.bg} border border-white/5 backdrop-blur-sm`}>
                <f.icon size={14} className={f.color} />
                <span className={`text-xs font-bold ${f.color}`}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ FORM AREA ══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10 sm:py-20 relative z-10"
        >
          <div className="w-full max-w-[440px] space-y-8">

            {/* Main Card */}
            <div className="bg-[#161b27]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 sm:p-11 shadow-2xl shadow-black/80 relative overflow-hidden group">
              <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

              <div className="mb-10">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                  Create account
                  <UserRoundPlus size={28} className="text-green-400 animate-pulse" />
                </h2>
                <p className="text-slate-500 text-base mt-2.5 font-medium">Join thousands of candidates getting hired.</p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-semibold text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={e => { e.preventDefault(); handleRegister(); }} className="space-y-5">

                {/* Name */}
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] block mb-2 px-1">Full Name</label>
                  <div className="relative group/input">
                    <ScanFace size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-green-500 transition-colors pointer-events-none" />
                    <input
                      name="name"
                      type="text"
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-[#0d1117] border border-white/10 text-white placeholder-slate-600 rounded-[1.25rem] pl-11 pr-4 py-4 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all shadow-inner"
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] block mb-2 px-1">Email Address</label>
                  <div className="relative group/input">
                    <AtSign size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-green-500 transition-colors pointer-events-none" />
                    <input
                      name="email"
                      type="email"
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-[#0d1117] border border-white/10 text-white placeholder-slate-600 rounded-[1.25rem] pl-11 pr-4 py-4 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all shadow-inner"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] block mb-2 px-1">Password</label>
                  <div className="relative group/input">
                    <KeyRound size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-green-500 transition-colors pointer-events-none" />
                    <input
                      name="password"
                      type={showPass ? "text" : "password"}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className="w-full bg-[#0d1117] border border-white/10 text-white placeholder-slate-600 rounded-[1.25rem] pl-11 pr-12 py-4 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all shadow-inner"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors p-1">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength indications */}
                  <AnimatePresence>
                    {formData.password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3 px-1 overflow-hidden"
                      >
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= passwordStrength ? (strengthMeta?.color || 'bg-white/10') : 'bg-white/5'}`} />
                          ))}
                        </div>
                        {strengthMeta && <p className={`text-[11px] font-black uppercase tracking-widest ${strengthMeta.text}`}>{strengthMeta.label} Secret</p>}
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1">
                          {passwordRequirements.map(req => (
                            <div key={req.id} className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${req.met ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-slate-600'}`}>
                                {req.met ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${req.met ? 'text-green-400/80' : 'text-slate-600'}`}>{req.label}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ y: -4, scale: 1.02, boxShadow: "0 15px 35px rgba(34,197,94,0.35)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !isPasswordValid}
                  className="w-full mt-4 flex items-center justify-center gap-3 py-5 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-[1.25rem] transition-all duration-300 shadow-xl shadow-green-900/40 group text-base uppercase tracking-widest"
                >
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" />Onboarding…</>
                    : <>Create Account <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" /></>
                  }
                </motion.button>
              </form>

              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase">──────── OR ────────</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <motion.div whileHover={{ y: -2 }}>
                <Link
                  to="/"
                  className="w-full flex items-center justify-center gap-2 py-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] text-slate-300 hover:text-white font-bold text-sm rounded-[1.25rem] transition-all group"
                >
                  Sign in instead <LogIn size={16} className="opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>

            <p className="text-center text-[11px] text-slate-600 mt-8 font-medium px-4">
              By creating an account, you agree to our{" "}
              <button className="text-slate-500 hover:text-green-500 transition-colors">Terms</button>
              {" and "}
              <button className="text-slate-500 hover:text-green-500 transition-colors">Privacy Policy</button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
