import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

/* ================= ALL TOPICS ================= */
const TOPICS = [
  // CS CORE
  { domain: "Computer Science", tech: "Operating Systems" },
  { domain: "Computer Science", tech: "Computer Networks" },
  { domain: "Computer Science", tech: "DBMS" },
  { domain: "Computer Science", tech: "Data Structures" },
  { domain: "Computer Science", tech: "Algorithms" },
  { domain: "Computer Science", tech: "OOPs" },

  // BACKEND
  { domain: "Backend", tech: "Node.js" },
  { domain: "Backend", tech: "Java Spring Boot" },
  { domain: "Backend", tech: "Django" },
  { domain: "Backend", tech: "Express.js" },
  { domain: "Backend", tech: "REST APIs" },
  { domain: "Backend", tech: "GraphQL" },

  // FRONTEND
  { domain: "Frontend", tech: "JavaScript" },
  { domain: "Frontend", tech: "React.js" },
  { domain: "Frontend", tech: "Next.js" },
  { domain: "Frontend", tech: "HTML & CSS" },

  // DATABASE
  { domain: "Database", tech: "MySQL" },
  { domain: "Database", tech: "MongoDB" },
  { domain: "Database", tech: "PostgreSQL" },

  // CLOUD
  { domain: "Cloud", tech: "AWS" },
  { domain: "Cloud", tech: "Azure" },
  { domain: "Cloud", tech: "Google Cloud" },
  { domain: "Cloud", tech: "Cloud Computing Fundamentals" },

  // DEVOPS
  { domain: "DevOps", tech: "Docker" },
  { domain: "DevOps", tech: "Kubernetes" },
  { domain: "DevOps", tech: "CI/CD" },
  { domain: "DevOps", tech: "Linux" },
];

/* ================= COMPONENT ================= */
export default function InterviewSelect() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* ================= DEBOUNCE (1000ms) ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.toLowerCase());
    }, 1000);

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

  /* ================= UI ================= */
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-6xl mx-auto">

          {/* SEARCH BAR */}
          <input
            type="text"
            placeholder="Search topics (OS, Cloud, JavaScript...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-6 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* NO RESULTS */}
          {filteredTopics.length === 0 && (
            <p className="text-center text-slate-500">
              No topics found
            </p>
          )}

          {/* TOPIC LIST */}
          <div className="space-y-8">
            {Object.entries(groupedTopics).map(([domain, topics]) => (
              <div key={domain}>
                <h2 className="text-xl font-semibold mb-4">
                  {domain}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                      className="
                        bg-white p-4 rounded-xl text-left border
                        transition-all duration-200
                        hover:border-green-500 hover:bg-green-50 hover:shadow-md
                      "
                    >
                      <p className="font-semibold">{t.tech}</p>
                      <p className="text-sm text-slate-500">
                        {t.domain}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
