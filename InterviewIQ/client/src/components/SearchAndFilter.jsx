import { useState } from "react";
import { useTheme } from "../context/themeContext";
import { Search, Filter, X, Calendar, Target, Clock } from "lucide-react";

export default function SearchAndFilter({ onSearch, onFilter, interviews = [] }) {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    dateRange: "",
    type: "",
    scoreRange: "",
    difficulty: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      dateRange: "",
      type: "",
      scoreRange: "",
      difficulty: ""
    };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Get unique interview types from the interviews data
  const interviewTypes = [...new Set(interviews.map(interview => interview.type || interview.domain))];

  return (
    <div className={`mb-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-4`}>
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Search interviews, questions, or feedback..."
            value={searchTerm}
            onChange={handleSearch}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-slate-300 placeholder-slate-500'
            } focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            showFilters
              ? 'bg-green-600 text-white border-green-600'
              : isDarkMode
                ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
          } transition`}
        >
          <Filter size={16} />
          Filters
          {hasActiveFilters && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(filters).filter(v => v !== "").length}
            </span>
          )}
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className={`border-t pt-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Date Range */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <Calendar size={14} className="inline mr-1" />
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              >
                <option value="">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="quarter">Last 3 months</option>
                <option value="year">This year</option>
              </select>
            </div>

            {/* Interview Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <Target size={14} className="inline mr-1" />
                Interview Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              >
                <option value="">All types</option>
                {interviewTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Score Range */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Score Range
              </label>
              <select
                value={filters.scoreRange}
                onChange={(e) => handleFilterChange('scoreRange', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              >
                <option value="">All scores</option>
                <option value="excellent">Excellent (8-10)</option>
                <option value="good">Good (6-8)</option>
                <option value="average">Average (4-6)</option>
                <option value="needs-improvement">Needs Improvement (0-4)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-green-500`}
              >
                <option value="">All levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 transition"
              >
                <X size={16} />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;

            const labels = {
              dateRange: { icon: Calendar, label: 'Date' },
              type: { icon: Target, label: 'Type' },
              scoreRange: { icon: Target, label: 'Score' },
              difficulty: { icon: Clock, label: 'Difficulty' }
            };

            const { icon: Icon, label } = labels[key];

            return (
              <span
                key={key}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  isDarkMode
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Icon size={12} />
                {label}: {value}
                <button
                  onClick={() => handleFilterChange(key, "")}
                  className="hover:text-red-500 transition"
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
