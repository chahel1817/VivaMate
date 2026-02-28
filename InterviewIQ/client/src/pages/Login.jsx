import { Link, useNavigate, useLocation } from "react-router-dom";
import { AtSign, KeyRound, Eye, EyeOff, CheckCircle, Loader2, Orbit, ArrowUpRight, Lightbulb, LineChart, Medal, Waves, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import AuthBranding from "../components/AuthBranding";

/* Mobile-only hero strips */
const FEATURES = [
  { icon: Lightbulb, label: "AI Feedback", color: "text-green-400", bg: "bg-green-500/10" },
  { icon: LineChart, label: "Analytics", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: Medal, label: "Leaderboard", color: "text-amber-400", bg: "bg-amber-500/10" },
];

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
    setError(""); setSuccessMsg("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (!email.includes("@")) { setError("Enter a valid email address"); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials — please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2 bg-[#080d18]">

      {/* Desktop left panel */}
      <AuthBranding />

      {/* ── Right / full-page panel ── */}
      <div className="flex-1 flex flex-col bg-[#0d1117]">

        {/* ══ MOBILE HERO (hidden md+) ══ */}
        <div className="md:hidden relative overflow-hidden px-6 pt-10 pb-8 bg-[#080d18]">
          {/* glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Logo */}
          <div className="relative flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-900/60">
              <Orbit size={17} className="text-white fill-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">VivaMate</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl font-black text-white leading-snug mb-2">
            Your AI interview<br />coach awaits
          </h1>
          <p className="text-slate-400 text-sm mb-5">Prepare smarter, perform better, get hired.</p>

          {/* Feature pills */}
          <div className="flex gap-2 flex-wrap">
            {FEATURES.map(f => (
              <div key={f.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${f.bg} border border-white/5`}>
                <f.icon size={13} className={f.color} />
                <span className={`text-xs font-bold ${f.color}`}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ FORM AREA ══ */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 sm:py-12">
          <div className="w-full max-w-sm sm:max-w-md">

            {/* Card */}
            <div className="bg-[#161b27] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60">

              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  Welcome back
                  <Waves size={22} className="text-green-400 flex-shrink-0" />
                </h2>
                <p className="text-slate-400 text-sm mt-1">Sign in to continue your prep</p>
              </div>

              {/* Success */}
              {successMsg && (
                <div className="mb-4 flex items-center gap-2.5 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                  <CheckCircle size={15} className="flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={e => { e.preventDefault(); handleLogin(); }} className="space-y-4">

                {/* Email */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email</label>
                  <div className="relative">
                    <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#0d1117] border border-white/8 text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/25 transition-all"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <Link to="/forgot-password" className="text-[11px] text-green-500 hover:text-green-400 font-bold transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0d1117] border border-white/8 text-white placeholder-slate-600 rounded-xl pl-10 pr-11 py-3 text-sm outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/25 transition-all"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-green-900/40 active:scale-[0.98] group text-sm"
                >
                  {loading
                    ? <><Loader2 size={17} className="animate-spin" />Signing in…</>
                    : <>Sign In <ArrowUpRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>
                  }
                </button>
              </form>

              {/* Or divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] text-slate-600 font-bold tracking-wider">NO ACCOUNT YET?</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2 py-3 border border-white/8 hover:border-white/15 hover:bg-white/[0.02] text-slate-300 hover:text-white font-semibold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] group"
              >
                Create a free account <UserPlus size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Footer */}
            <p className="text-center text-[11px] text-slate-600 mt-5 leading-relaxed">
              By continuing, you agree to our{" "}
              <span className="text-slate-500 hover:text-slate-400 cursor-pointer">Terms</span>
              {" & "}
              <span className="text-slate-500 hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
