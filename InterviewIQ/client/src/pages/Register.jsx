import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Check, X } from "lucide-react";
import { useState, useMemo } from "react";
import AuthBranding from "../components/AuthBranding";
import { useAuth } from "../context/authContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const passwordRequirements = useMemo(() => {
    const { password } = formData;
    return [
      { id: "length", label: "At least 8 characters", met: password.length >= 8 },
      { id: "uppercase", label: "One uppercase letter", met: /[A-Z]/.test(password) },
      { id: "number", label: "One number", met: /[0-9]/.test(password) },
      { id: "special", label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [formData.password]);

  const isPasswordValid = passwordRequirements.every((req) => req.met);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    if (!formData.email.includes('@')) {
      setError("Email must contain an '@' symbol");
      return;
    }

    try {
      setError("");
      await register(formData.name, formData.email, formData.password);

      // Redirect to login with success state
      navigate("/", { state: { message: "You're registered, login to access." } });
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      <AuthBranding />

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">

          <h2 className="text-2xl font-semibold text-slate-800">
            Create account
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Start your interview preparation journey
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); handleRegister(); }}
            className="mt-6 space-y-4"
          >

            {/* Name */}
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="name"
                placeholder="Full name"
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2
                focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2
                focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2
                  focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Password Requirements UI */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {passwordRequirements.map((req) => (
                  <div key={req.id} className="flex items-center space-x-2 text-xs">
                    {req.met ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <X size={14} className="text-red-500" />
                    )}
                    <span className={req.met ? "text-green-600" : "text-red-600"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className={`w-full py-2 rounded-lg transition text-white ${isPasswordValid ? "bg-green-600 hover:bg-green-700" : "bg-slate-400 cursor-not-allowed"
                }`}
              disabled={!isPasswordValid}
            >
              Register
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            Already have an account?{" "}
            <Link to="/" className="text-green-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
