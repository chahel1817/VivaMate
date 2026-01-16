import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Key } from "lucide-react";
import { useAuth } from "../context/authContext";

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
    setError("");
    setLoading(true);

    try {
      await verifyOtp(email, otp);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* LEFT BRANDING */}
      <div className="hidden md:flex flex-col justify-center bg-green-600 text-white px-16">
        <h1 className="text-4xl font-semibold leading-tight">
          Verify your OTP <br /> to continue
        </h1>
        <p className="mt-4 text-green-100 max-w-sm">
          Enter the OTP sent to your email to reset your password.
        </p>
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-slate-800">Verify OTP</h2>
          <p className="text-slate-500 text-sm mt-1">
            Enter the 6-digit OTP sent to {email}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* OTP */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                OTP
              </label>
              <div className="relative">
                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2
                  focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Didn't receive OTP?{" "}
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-green-600 hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
