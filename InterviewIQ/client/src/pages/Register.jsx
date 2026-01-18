import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import AuthBranding from "../components/AuthBranding";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Registration successful");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
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

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
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
