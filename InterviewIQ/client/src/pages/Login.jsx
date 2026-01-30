import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import AuthBranding from "../components/AuthBranding";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      // Clear the state to avoid showing the message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async () => {
    try {
      setError("");
      setSuccessMsg("");
      setLoading(true);

      if (!email || !password) {
        setError("All fields are required");
        setLoading(false);
        return;
      }

      if (!email.includes('@')) {
        setError("Email must contain an '@' symbol");
        setLoading(false);
        return;
      }

      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      <AuthBranding />

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">

          <h2 className="text-2xl font-semibold text-slate-800">Sign in</h2>
          <p className="text-slate-500 text-sm mt-1">
            Continue your interview preparation
          </p>

          {successMsg && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700 text-sm">
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
            className="mt-6 space-y-4"
          >


            {/* Email */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2
                  focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2
                  focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>


          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-green-600 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <p className="text-sm text-slate-500 mt-4 text-center">
            New here?{" "}
            <Link to="/register" className="text-green-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
