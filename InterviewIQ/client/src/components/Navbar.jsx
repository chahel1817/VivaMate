import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1
          className="text-xl font-semibold text-green-600 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
        VivaMate
        </h1>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-600 dark:text-slate-300">
            Hi, {user?.name}
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => navigate("/analytics")}
            className="text-green-600 hover:underline"
          >
            Analytics
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="text-green-600 hover:underline"
          >
            Profile
          </button>
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
