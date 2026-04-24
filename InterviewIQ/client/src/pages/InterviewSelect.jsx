import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/themeContext";
import { Search, Plus, Sparkles, Code2, Server, Database, Cloud, Shield, Cpu, Brain, Smartphone, BarChart3, GitBranch, Layers, Terminal, Globe, Palette, Workflow, Blocks, Zap, X } from "lucide-react";

/* ================= DOMAIN ICONS & COLORS ================= */
const DOMAIN_META = {
  "Computer Science": { icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  "Backend": { icon: Server, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  "Frontend": { icon: Code2, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  "Database": { icon: Database, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  "Cloud": { icon: Cloud, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  "DevOps": { icon: GitBranch, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  "Data Science & AI": { icon: Brain, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  "Mobile Development": { icon: Smartphone, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20" },
  "System Design": { icon: Layers, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  "Cybersecurity": { icon: Shield, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  "Testing & QA": { icon: BarChart3, color: "text-lime-500", bg: "bg-lime-500/10", border: "border-lime-500/20" },
  "Programming Languages": { icon: Terminal, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  "Web Technologies": { icon: Globe, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  "UI/UX Design": { icon: Palette, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20" },
  "Blockchain & Web3": { icon: Blocks, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  "Custom": { icon: Sparkles, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
};

/* ================= ALL TOPICS ================= */
const TOPICS = [
  // CS CORE
  { domain: "Computer Science", tech: "Operating Systems" },
  { domain: "Computer Science", tech: "Computer Networks" },
  { domain: "Computer Science", tech: "DBMS" },
  { domain: "Computer Science", tech: "Data Structures" },
  { domain: "Computer Science", tech: "Algorithms" },
  { domain: "Computer Science", tech: "OOPs" },
  { domain: "Computer Science", tech: "Compiler Design" },
  { domain: "Computer Science", tech: "Theory of Computation" },

  // BACKEND
  { domain: "Backend", tech: "Node.js" },
  { domain: "Backend", tech: "Java Spring Boot" },
  { domain: "Backend", tech: "Django" },
  { domain: "Backend", tech: "Express.js" },
  { domain: "Backend", tech: "REST APIs" },
  { domain: "Backend", tech: "GraphQL" },
  { domain: "Backend", tech: "FastAPI" },
  { domain: "Backend", tech: "Ruby on Rails" },
  { domain: "Backend", tech: "NestJS" },
  { domain: "Backend", tech: "Go (Golang)" },

  // FRONTEND
  { domain: "Frontend", tech: "JavaScript" },
  { domain: "Frontend", tech: "React.js" },
  { domain: "Frontend", tech: "Next.js" },
  { domain: "Frontend", tech: "HTML & CSS" },
  { domain: "Frontend", tech: "TypeScript" },
  { domain: "Frontend", tech: "Angular" },
  { domain: "Frontend", tech: "Vue.js" },
  { domain: "Frontend", tech: "Svelte" },
  { domain: "Frontend", tech: "Tailwind CSS" },

  // DATABASE
  { domain: "Database", tech: "MySQL" },
  { domain: "Database", tech: "MongoDB" },
  { domain: "Database", tech: "PostgreSQL" },
  { domain: "Database", tech: "Redis" },
  { domain: "Database", tech: "Firebase" },
  { domain: "Database", tech: "Elasticsearch" },
  { domain: "Database", tech: "SQL Fundamentals" },

  // CLOUD
  { domain: "Cloud", tech: "AWS" },
  { domain: "Cloud", tech: "Azure" },
  { domain: "Cloud", tech: "Google Cloud" },
  { domain: "Cloud", tech: "Cloud Computing Fundamentals" },
  { domain: "Cloud", tech: "Serverless Architecture" },

  // DEVOPS
  { domain: "DevOps", tech: "Docker" },
  { domain: "DevOps", tech: "Kubernetes" },
  { domain: "DevOps", tech: "CI/CD" },
  { domain: "DevOps", tech: "Linux" },
  { domain: "DevOps", tech: "Terraform" },
  { domain: "DevOps", tech: "Jenkins" },
  { domain: "DevOps", tech: "Git & GitHub" },

  // DATA SCIENCE & AI
  { domain: "Data Science & AI", tech: "Machine Learning" },
  { domain: "Data Science & AI", tech: "Deep Learning" },
  { domain: "Data Science & AI", tech: "Natural Language Processing" },
  { domain: "Data Science & AI", tech: "Computer Vision" },
  { domain: "Data Science & AI", tech: "Data Analysis (Pandas/NumPy)" },
  { domain: "Data Science & AI", tech: "TensorFlow / PyTorch" },
  { domain: "Data Science & AI", tech: "Generative AI & LLMs" },
  { domain: "Data Science & AI", tech: "Statistics & Probability" },

  // MOBILE
  { domain: "Mobile Development", tech: "React Native" },
  { domain: "Mobile Development", tech: "Flutter" },
  { domain: "Mobile Development", tech: "Swift (iOS)" },
  { domain: "Mobile Development", tech: "Kotlin (Android)" },

  // SYSTEM DESIGN
  { domain: "System Design", tech: "Low-Level Design (LLD)" },
  { domain: "System Design", tech: "High-Level Design (HLD)" },
  { domain: "System Design", tech: "Microservices Architecture" },
  { domain: "System Design", tech: "Message Queues (Kafka/RabbitMQ)" },
  { domain: "System Design", tech: "Caching Strategies" },
  { domain: "System Design", tech: "Load Balancing & Scaling" },
  { domain: "System Design", tech: "API Design & Rate Limiting" },

  // CYBERSECURITY
  { domain: "Cybersecurity", tech: "Network Security" },
  { domain: "Cybersecurity", tech: "OWASP Top 10" },
  { domain: "Cybersecurity", tech: "Ethical Hacking" },
  { domain: "Cybersecurity", tech: "Cryptography" },

  // TESTING
  { domain: "Testing & QA", tech: "Unit Testing" },
  { domain: "Testing & QA", tech: "Selenium / Cypress" },
  { domain: "Testing & QA", tech: "Jest / Vitest" },
  { domain: "Testing & QA", tech: "Manual Testing" },

  // PROGRAMMING LANGUAGES
  { domain: "Programming Languages", tech: "Python" },
  { domain: "Programming Languages", tech: "Java" },
  { domain: "Programming Languages", tech: "C++" },
  { domain: "Programming Languages", tech: "C" },
  { domain: "Programming Languages", tech: "Rust" },

  // WEB TECHNOLOGIES
  { domain: "Web Technologies", tech: "Web Performance Optimization" },
  { domain: "Web Technologies", tech: "Progressive Web Apps (PWA)" },
  { domain: "Web Technologies", tech: "WebSockets" },
  { domain: "Web Technologies", tech: "Authentication (JWT/OAuth)" },

  // UI/UX
  { domain: "UI/UX Design", tech: "Design Principles" },
  { domain: "UI/UX Design", tech: "Figma" },
  { domain: "UI/UX Design", tech: "Accessibility (a11y)" },
  { domain: "UI/UX Design", tech: "Responsive Design" },

  // BLOCKCHAIN
  { domain: "Blockchain & Web3", tech: "Solidity" },
  { domain: "Blockchain & Web3", tech: "Smart Contracts" },
  { domain: "Blockchain & Web3", tech: "Ethereum / EVM" },
];

/* ================= COMPONENT ================= */
export default function InterviewSelect() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [customTech, setCustomTech] = useState("");

  /* ================= DEBOUNCE (400ms) ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.toLowerCase());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FILTER LOGIC ================= */
  const filteredTopics = useMemo(() => {
    if (!debouncedSearch) return TOPICS;
    return TOPICS.filter(
      (t) =>
        t.tech.toLowerCase().includes(debouncedSearch) ||
        t.domain.toLowerCase().includes(debouncedSearch)
    );
  }, [debouncedSearch]);

  /* ================= GROUP BY DOMAIN ================= */
  const groupedTopics = useMemo(() => {
    return filteredTopics.reduce((acc, curr) => {
      acc[curr.domain] = acc[curr.domain] || [];
      acc[curr.domain].push(curr);
      return acc;
    }, {});
  }, [filteredTopics]);

  const handleCustomSubmit = () => {
    if (!customTech.trim()) return;
    navigate("/interview/config", {
      state: {
        domain: customDomain.trim() || "Custom",
        tech: customTech.trim(),
      },
    });
  };

  /* ================= UI ================= */
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className={`text-3xl sm:text-4xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Choose Your <span className="text-green-500">Arena</span>
          </h1>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Pick a topic to interview on, or create your own custom topic.
          </p>
        </div>

        {/* SEARCH & CUSTOM BUTTON */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search 100+ topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all ${isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
            />
          </div>
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-green-900/30 active:scale-95 flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Custom Topic
          </button>
        </div>

        {/* STATS BAR */}
        <div className={`flex flex-wrap gap-4 mb-8 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          <span>{TOPICS.length} Topics</span>
          <span>·</span>
          <span>{Object.keys(DOMAIN_META).length - 1} Domains</span>
          <span>·</span>
          <span className="text-green-500">+ Unlimited Custom</span>
        </div>

        {/* NO RESULTS */}
        {filteredTopics.length === 0 && (
          <div className={`text-center py-16 rounded-3xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            <Search className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              No topics match "{search}"
            </p>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Can't find what you need? Create a custom topic!
            </p>
            <button
              onClick={() => {
                setCustomTech(search);
                setShowCustomModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create "{search}" Topic
            </button>
          </div>
        )}

        {/* TOPIC LIST */}
        <div className="space-y-10">
          {Object.entries(groupedTopics).map(([domain, topics]) => {
            const meta = DOMAIN_META[domain] || DOMAIN_META["Custom"];
            const Icon = meta.icon;

            return (
              <div key={domain}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${meta.bg} ${meta.border} border`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    {domain}
                  </h2>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    {topics.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topics.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        navigate("/interview/config", {
                          state: {
                            domain: t.domain,
                            tech: t.tech,
                          },
                        })
                      }
                      className={`group relative p-4 sm:p-5 rounded-2xl text-left border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isDarkMode
                        ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-900/10'
                        : 'bg-white border-slate-200 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-100'
                        }`}
                    >
                      <p className={`font-bold text-sm sm:text-base ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t.tech}</p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {t.domain}
                      </p>
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${meta.color}`}>
                        <Zap className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM SPACER & FOOTER */}
        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            More coming soon
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Master every domain
          </h3>
          <p className={`text-sm max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            We're constantly adding new topics and questions. If you have a specific request, create a custom topic above!
          </p>
        </div>
      </div>

      {/* CUSTOM TOPIC MODAL */}
      {showCustomModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCustomModal(false)}
        >
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between px-6 py-5 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
                  <Sparkles className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Custom Topic</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Interview on anything you want!</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Topic / Technology *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rust, System Design, Machine Learning..."
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  autoFocus
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all ${isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                />
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Backend, Frontend, AI..."
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all ${isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                />
              </div>

              <div className={`rounded-xl p-4 text-xs ${isDarkMode ? 'bg-green-500/5 border border-green-500/10 text-green-400' : 'bg-green-50 border border-green-100 text-green-700'}`}>
                <p className="font-bold mb-1">💡 Pro Tip</p>
                <p>Our AI can generate expert-level interview questions for <strong>any</strong> topic. Be as specific as you want!</p>
              </div>

              <button
                onClick={handleCustomSubmit}
                disabled={!customTech.trim()}
                className="w-full py-3.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-green-900/30"
              >
                <Zap className="w-4 h-4" />
                Start Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
