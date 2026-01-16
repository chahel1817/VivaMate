import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "../context/authContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { requestOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await requestOtp(email);
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* LEFT BRANDING */}
      <div className="hidden md:flex flex-col justify-center bg-green-600 text-white px-16">
        <h1 className="text-4xl font-semibold leading-tight">
          Reset your password <br /> securely
        </h1>
        <p className="mt-4 text-green-100 max-w-sm">
          Enter your email to receive an OTP for password reset.
        </p>
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-slate-800">Forgot Password</h2>
          <p className="text-slate-500 text-sm mt-1">
            Enter your email to receive a reset OTP
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                  required
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2
                  focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-green-600 hover:underline"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
