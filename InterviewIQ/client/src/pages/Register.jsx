import { Link, useNavigate } from "react-router-dom";
import { AtSign, KeyRound, ScanFace, Eye, EyeOff, Check, X, Loader2, Orbit, ArrowUpRight, Lightbulb, LineChart, Medal, Sparkles, UserRoundPlus, LogIn } from "lucide-react";
import { useState, useMemo } from "react";
import AuthBranding from "../components/AuthBranding";
import { useAuth } from "../context/authContext";

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
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2 bg-[#080d18]">

      {/* Desktop left panel */}
      <AuthBranding />

      {/* ── Right / full-page panel ── */}
      <div className="flex-1 flex flex-col bg-[#0d1117]">

        {/* ══ MOBILE HERO (hidden md+) ══ */}
        <div className="md:hidden relative overflow-hidden px-6 pt-10 pb-8 bg-[#080d18]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-900/60">
              <Orbit size={17} className="text-white fill-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">VivaMate</span>
          </div>

          <h1 className="text-2xl font-black text-white leading-snug mb-2">
            Start your interview<br />preparation today
          </h1>
          <p className="text-slate-400 text-sm mb-5">Free account. No credit card required.</p>

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

              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  Create account
                  <UserRoundPlus size={20} className="text-green-400 flex-shrink-0" />
                </h2>
                <p className="text-slate-400 text-sm mt-1">Join and start practicing today — it's free</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={e => { e.preventDefault(); handleRegister(); }} className="space-y-4">

                {/* Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
                  <div className="relative">
                    <ScanFace size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      name="name"
                      type="text"
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full bg-[#0d1117] border border-white/8 text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/25 transition-all"
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email</label>
                  <div className="relative">
                    <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      name="email"
                      type="email"
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-[#0d1117] border border-white/8 text-white placeholder-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/25 transition-all"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      name="password"
                      type={showPass ? "text" : "password"}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className="w-full bg-[#0d1117] border border-white/8 text-white placeholder-slate-600 rounded-xl pl-10 pr-11 py-3 text-sm outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/25 transition-all"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Strength bar + checklist — only shown while typing */}
                  {formData.password.length > 0 && (
                    <div className="mt-3 space-y-2.5">
                      {/* Segments */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? (strengthMeta?.color || 'bg-white/10') : 'bg-white/8'}`}
                          />
                        ))}
                      </div>

                      {/* Label */}
                      {strengthMeta && (
                        <p className={`text-[11px] font-bold ${strengthMeta.text}`}>{strengthMeta.label} password</p>
                      )}

                      {/* Checklist — 2-col grid */}
                      <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                        {passwordRequirements.map(req => (
                          <div key={req.id} className="flex items-center gap-1.5">
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${req.met ? 'bg-green-500/20' : 'bg-white/5'}`}>
                              {req.met
                                ? <Check size={9} className="text-green-400" />
                                : <X size={9} className="text-slate-600" />
                              }
                            </div>
                            <span className={`text-[11px] ${req.met ? 'text-green-400' : 'text-slate-500'}`}>{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button
                  type="submit"
                  disabled={loading || !isPasswordValid}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-green-900/40 active:scale-[0.98] group text-sm"
                >
                  {loading
                    ? <><Loader2 size={17} className="animate-spin" />Creating account…</>
                    : <>Create Account <ArrowUpRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>
                  }
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] text-slate-600 font-bold tracking-wider">HAVE AN ACCOUNT?</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 py-3 border border-white/8 hover:border-white/15 hover:bg-white/[0.02] text-slate-300 hover:text-white font-semibold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] group"
              >
                Sign in instead <LogIn size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            <p className="text-center text-[11px] text-slate-600 mt-5 leading-relaxed">
              By creating an account, you agree to our{" "}
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
