import {
  PlayCircle,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import api from "../services/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Remove dashboardData, use only stats for all dashboard info
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
		interviewsTaken: 0,
		averageScore: null,
		lastInterview: null,
		recentActivity: []
	});

  // Remove fetchDashboardData, setLoading is handled in refreshStats

  async function refreshStats() {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('refreshStats error', e);
    } finally {
      setLoading(false);
    }
  }

	useEffect(() => {
		refreshStats();
		let socket;
		let pollInterval;

		(async () => {
			try {
				const mod = await import('socket.io-client');
				const io = mod?.default ?? mod;
				socket = io(process.env.REACT_APP_API_URL || '/', { transports: ['websocket'] });
				socket.on('connect', () => console.debug('socket connected'));
				socket.on('session:updated', () => refreshStats());
				socket.on('disconnect', () => console.debug('socket disconnected'));
			} catch (err) {
				console.warn('socket.io-client not available, falling back to polling:', err);
				pollInterval = setInterval(refreshStats, 10000);
			}
		})();

		return () => {
			if (socket) { socket.off(); socket.disconnect(); }
			if (pollInterval) clearInterval(pollInterval);
		};
	}, []);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-green-600">
            VivaMate
          </h1>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600">
              Welcome back, {user?.name} 👋
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

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* Intro */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-800">
            Your Dashboard
          </h2>
          <p className="text-slate-500 mt-2 max-w-2xl">
            This is your personal interview preparation space.
            Start mock interviews, review feedback, and track growth.
          </p>
        </section>

        {/* Stats */}
        <section className="grid md:grid-cols-3 gap-6">
          {[
            { label: "Interviews Taken", value: stats.interviewsTaken },
            { label: "Average Score", value: `${(stats.averageScore ?? 0)}%` },
            { label: "Last Interview", value: stats.lastInterview || "None" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-6"
            >
              <h3 className="text-sm text-slate-500">{item.label}</h3>
              <p className="text-3xl font-semibold text-slate-800 mt-2">
                {loading ? "..." : item.value}
              </p>
            </div>
          ))}
        </section>

        {/* Actions */}
        <section>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            What would you like to do?
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {/* CARD */}
            {[
              {
                icon: PlayCircle,
                title: "Start a Mock Interview",
                desc:
                  "Answer real interview-style questions and get structured feedback.",
                action: "Start interview →",
                path: "/interview/select",
              },
              {
                icon: BarChart3,
                title: "View Performance",
                desc:
                  "Track your scores over time and measure your improvement.",
                action: "View performance →",
                path: "/performance",
              },
              {
                icon: MessageSquare,
                title: "Review Feedback",
                desc:
                  "Go through detailed feedback from your past interviews.",
                action: "View feedback →",
                path: "/feedback",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  onClick={() => navigate(card.path)}
                  className="
                    group cursor-pointer
                    bg-white rounded-2xl border border-slate-200 p-6
                    transition-all duration-300
                    hover:bg-green-50
                    hover:border-green-500
                    hover:shadow-lg
                    hover:-translate-y-1
                  "
                >
                  <Icon
                    size={28}
                    className="
                      text-green-600 mb-4
                      transition
                      group-hover:text-green-700
                    "
                  />

                  <h4 className="
                    text-lg font-semibold text-slate-800
                    group-hover:text-green-700 transition
                  ">
                    {card.title}
                  </h4>

                  <p className="
                    text-slate-500 text-sm mt-1
                    group-hover:text-slate-700 transition
                  ">
                    {card.desc}
                  </p>

                  <span className="
                    inline-block mt-4 text-green-600 text-sm
                    group-hover:underline
                  ">
                    {card.action}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h3 className="text-xl font-semibold mb-4">
            Recent Activity
          </h3>

          <div className="bg-white rounded-xl divide-y">
            {stats.recentActivity.length === 0 && (
              <p className="p-4 text-slate-500">No activity yet</p>
            )}

            {stats.recentActivity.map((item, index) => (
              <div
                key={index}
                className="p-4 flex justify-between text-sm"
              >
                <span>{item.role}</span>
                <span className="text-slate-400">{item.date}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
