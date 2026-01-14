import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1
          className="text-xl font-semibold text-green-600 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
        VivaMate
        </h1>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-600">
            Hi, {user?.name}
          </span>
          <button
            onClick={logout}
            className="text-green-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
