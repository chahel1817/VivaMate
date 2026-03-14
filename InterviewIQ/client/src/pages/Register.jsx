import { Link, useNavigate } from "react-router-dom";
import { Check, Eye, EyeOff, Loader2, X, ArrowRight, User, Mail, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/authContext";
import AuthBranding from "../components/AuthBranding";

const inputClassName =
  "auth-input w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3.5 text-sm font-medium text-white outline-none transition-all placeholder:text-emerald-100/30 focus:border-emerald-400 focus:bg-white/10 focus:ring-4 focus:ring-emerald-400/10";

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
      { id: "length", label: "8+ chars", met: password.length >= 8 },
      { id: "uppercase", label: "Uppercase", met: /[A-Z]/.test(password) },
      { id: "number", label: "Number", met: /[0-9]/.test(password) },
      { id: "symbol", label: "Symbol", met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [formData.password]);

  const isPasswordValid = passwordRequirements.every((item) => item.met);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }

    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await register(formData.name, formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-white">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden border-b border-slate-200 lg:border-b-0 lg:border-r">
          <AuthBranding />
        </div>

        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1f5b4d] px-6 py-12 sm:px-8">
          {/* Subtle background patterns */}
          <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(60deg, #ffffff 25%, transparent 25.5%, transparent 75%, #ffffff 75.5%, #ffffff), linear-gradient(60deg, #ffffff 25%, transparent 25.5%, transparent 75%, #ffffff 75.5%, #ffffff)", backgroundSize: "40px 70px" }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-[460px]"
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 text-center sm:text-left"
            >
              <h1 className="text-[2.5rem] font-black leading-tight tracking-tight text-white sm:text-[2.8rem]">
                Start for free
              </h1>
              <p className="mt-3 text-[17px] text-emerald-100/60">
                Join VivaMate and master your interview skills.
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

            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-bold uppercase tracking-widest text-emerald-100/50 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/30" />
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold uppercase tracking-widest text-emerald-100/50 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/30" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold uppercase tracking-widest text-emerald-100/50 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/30" />
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    autoComplete="new-password"
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

              <div className="grid gap-2.5 rounded-xl border border-white/5 bg-white/5 p-4 sm:grid-cols-2">
                {passwordRequirements.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 text-[12px] font-medium transition-opacity">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${item.met ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-emerald-100/20"}`}>
                      {item.met ? <Check size={11} strokeWidth={4} /> : <X size={11} strokeWidth={4} />}
                    </span>
                    <span className={item.met ? "text-emerald-100/90" : "text-emerald-100/40"}>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3">
                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !isPasswordValid}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#7be36b] px-8 py-4 text-sm font-black uppercase tracking-[0.15em] text-[#123229] shadow-xl shadow-green-900/20 transition-all hover:bg-[#8df07d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Create Free Account
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
              className="mt-10 border-t border-white/5 pt-8 text-center"
            >
              <p className="text-[15px] text-emerald-100/40">
                Already have an account?{" "}
                <Link to="/" className="font-bold text-white underline decoration-emerald-500/30 underline-offset-4 transition-all hover:text-emerald-300 hover:decoration-emerald-500">
                  Sign In
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

