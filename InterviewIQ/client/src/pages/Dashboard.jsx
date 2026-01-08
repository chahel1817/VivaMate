import {
  PlayCircle,
  BarChart3,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import api from "../services/api";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    interviewsTaken: 0,
    averageScore: 0,
    lastInterview: null,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-green-600">
            InterviewIQ
          </h1>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600">Welcome back, {user?.name} 👋</span>
            <button onClick={logout} className="text-green-600 hover:underline">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* Intro Section */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-800">
            Your Dashboard
          </h2>
          <p className="text-slate-500 mt-2 max-w-2xl">
            This is your personal interview preparation space. From here,
            you can start mock interviews, review your past performance,
            and understand where you need to improve.
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm text-slate-500">
              Interviews Taken
            </h3>
            <p className="text-3xl font-semibold text-slate-800 mt-2">
              {loading ? '...' : dashboardData.interviewsTaken}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm text-slate-500">
              Average Score
            </h3>
            <p className="text-3xl font-semibold text-slate-800 mt-2">
              {loading ? '...' : `${dashboardData.averageScore}%`}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm text-slate-500">
              Last Interview
            </h3>
            <p className="text-slate-800 mt-2">
              {loading ? '...' : dashboardData.lastInterview || 'None'}
            </p>
          </div>
        </section>

        {/* Main Actions */}
        <section>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">
            What would you like to do?
          </h3>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Start Interview */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
              <PlayCircle className="text-green-600 mb-4" size={28} />
              <h4 className="text-lg font-semibold text-slate-800">
                Start a Mock Interview
              </h4>
              <p className="text-slate-500 text-sm mt-1">
                Answer real interview-style questions and get
                structured feedback on your responses.
              </p>
              <button
  onClick={() => navigate("/interview")}
  className="mt-4 text-green-600 hover:underline text-sm"
>
  Start interview →
</button>

            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
              <BarChart3 className="text-green-600 mb-4" size={28} />
              <h4 className="text-lg font-semibold text-slate-800">
                View Performance
              </h4>
              <p className="text-slate-500 text-sm mt-1">
                Track your scores over time and see how your
                interview skills are improving.
              </p>
              <button
  onClick={() => navigate("/performance")}
  className="mt-4 text-green-600 hover:underline text-sm"
>
  View performance →
</button>


            </div>

            {/* Feedback */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
              <MessageSquare className="text-green-600 mb-4" size={28} />
              <h4 className="text-lg font-semibold text-slate-800">
                Review Feedback
              </h4>
              <p className="text-slate-500 text-sm mt-1">
                Go through detailed feedback from your past
                interviews to understand your weak areas.
              </p>
              <button
  onClick={() => navigate("/feedback")}
  className="mt-4 text-green-600 hover:underline text-sm"
>
  View feedback →
</button>
            </div>

          </div>
        </section>

        {/* Recent Activity */}
        <section>
  <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>

  <div className="bg-white rounded-xl divide-y">
    {dashboardData.recentActivity.length === 0 && (
      <p className="p-4 text-slate-500">No activity yet</p>
    )}

    {dashboardData.recentActivity.map((item, index) => (
      <div key={index} className="p-4 flex justify-between text-sm">
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
