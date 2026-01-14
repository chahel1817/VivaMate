import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/authContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      
      {/* LEFT BRANDING */}
      <div className="hidden md:flex flex-col justify-center bg-green-600 text-white px-16">
        <h1 className="text-4xl font-semibold leading-tight">
          Practice interviews <br /> with confidence
        </h1>
        <p className="mt-4 text-green-100 max-w-sm">
          VivaMate helps you prepare smarter with structured practice.
        </p>
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
          
          <h2 className="text-2xl font-semibold text-slate-800">Sign in</h2>
          <p className="text-slate-500 text-sm mt-1">
            Continue your interview preparation
          </p>

          <div className="mt-6 space-y-4">
            
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
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Login
            </button>
          </div>

          <p className="text-sm text-slate-500 mt-6 text-center">
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
