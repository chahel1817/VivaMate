import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import Navbar from "../components/Navbar";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  MessageSquare, Send, Hash, TrendingUp, Clock,
  ChevronDown, ChevronUp, Plus, X, Flame, Star,
  Search, Filter, ArrowUp
} from "lucide-react";

const CATEGORIES = ["All", "Technical", "Behavioral", "System Design", "Salary & Career", "General"];

export default function Forum() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [newComment, setNewComment] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("new"); // new, hot
  const [submitting, setSubmitting] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState({});

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/forum');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      toast.error("Couldn't load posts");
    } finally {
      setLoading(false);
    }
  };

  const addPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }
    setSubmitting(true);
    const tempId = Date.now();
    const optimisticPost = {
      _id: tempId,
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      author: user?.name || "You",
      date: new Date().toISOString(),
      comments: []
    };
    setPosts(prev => [optimisticPost, ...prev]);
    setShowModal(false);
    setNewPost({ title: "", content: "", category: "General" });
    try {
      const res = await api.post('/forum', { ...optimisticPost, author: user?.name || "Anonymous" });
      setPosts(prev => prev.map(p => p._id === tempId ? res.data : p));
      toast.success("Post published!");
    } catch (err) {
      setPosts(prev => prev.filter(p => p._id !== tempId));
      toast.error("Failed to post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const addComment = async (postId) => {
    const text = newComment[postId]?.trim();
    if (!text) return;
    setCommentSubmitting(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await api.post(`/forum/${postId}/comment`, {
        author: user?.name || "Anonymous",
        text
      });
      setPosts(prev => prev.map(p => p._id === postId ? res.data : p));
      setNewComment(prev => ({ ...prev, [postId]: "" }));
      toast.success("Comment added!");
    } catch (err) {
      toast.error("Failed to add comment.");
    } finally {
      setCommentSubmitting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const filteredPosts = posts
    .filter(p => {
      const matchesSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => sortBy === "hot" ? (b.comments?.length - a.comments?.length) : (new Date(b.date) - new Date(a.date)));

  const categoryColors = {
    "Technical": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Behavioral": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "System Design": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "Salary & Career": "bg-green-500/10 text-green-500 border-green-500/20",
    "General": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <>
      <Navbar />
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>

        {/* Hero Banner */}
        <div className={`relative overflow-hidden border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-indigo-600/5 pointer-events-none" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-900/40' : 'bg-purple-50'}`}>
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Community Forum</h1>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Discuss interview experiences, strategies, and tips with fellow candidates
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-900/30 active:scale-95 flex-shrink-0"
              >
                <Plus className="w-4 h-4" /> New Discussion
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("new")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${sortBy === "new" ? 'bg-purple-600 text-white border-purple-600' : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <Clock className="w-3.5 h-3.5" /> New
              </button>
              <button
                onClick={() => setSortBy("hot")}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${sortBy === "hot" ? 'bg-purple-600 text-white border-purple-600' : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <Flame className="w-3.5 h-3.5" /> Hot
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${activeCategory === cat
                    ? 'bg-purple-600 text-white border-purple-600'
                    : isDarkMode ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-32 rounded-2xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className={`rounded-2xl border p-16 text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <MessageSquare className={`w-14 h-14 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
              <p className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {searchTerm ? "No posts match your search" : "No discussions yet"}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {searchTerm ? "Try a different keyword" : "Be the first to start a discussion!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => {
                const isExpanded = expandedPost === post._id;
                const catColor = categoryColors[post.category] || categoryColors["General"];
                return (
                  <div
                    key={post._id}
                    className={`rounded-2xl border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {post.author?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {post.category && (
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${catColor}`}>
                                {post.category}
                              </span>
                            )}
                          </div>
                          <h3 className={`font-bold text-base leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{post.author}</span>
                            <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>·</span>
                            <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                              {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className={`mt-3 text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setExpandedPost(isExpanded ? null : post._id)}
                            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${isDarkMode ? 'text-slate-400 hover:text-purple-400' : 'text-slate-500 hover:text-purple-600'}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {post.comments?.length || 0} comments
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {post.content.length > 120 && (
                          <button
                            onClick={() => setExpandedPost(isExpanded ? null : post._id)}
                            className={`text-xs font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comments Section */}
                    {isExpanded && (
                      <div className={`border-t px-5 py-4 space-y-4 ${isDarkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-100 bg-slate-50'}`}>
                        {post.comments?.length > 0 ? (
                          <div className="space-y-3">
                            {post.comments.map((comment, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                  {comment.author?.charAt(0).toUpperCase()}
                                </div>
                                <div className={`flex-1 rounded-xl px-4 py-3 text-sm ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700 shadow-sm border border-slate-100'}`}>
                                  <span className={`font-semibold text-xs mr-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{comment.author}</span>
                                  {comment.text}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-xs text-center py-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No comments yet. Be the first!</p>
                        )}

                        {/* Add Comment */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Write a comment…"
                            value={newComment[post._id] || ""}
                            onChange={e => setNewComment(prev => ({ ...prev, [post._id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && addComment(post._id)}
                            className={`flex-1 px-4 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
                          />
                          <button
                            onClick={() => addComment(post._id)}
                            disabled={commentSubmitting[post._id] || !newComment[post._id]?.trim()}
                            className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition-all active:scale-95"
                          >
                            {commentSubmitting[post._id]
                              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : <Send className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* New Post Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className={`w-full max-w-lg rounded-2xl border shadow-2xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              onClick={e => e.stopPropagation()}
            >
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>New Discussion</h2>
                <button onClick={() => setShowModal(false)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.filter(c => c !== "All").map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNewPost(p => ({ ...p, category: cat }))}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${newPost.category === cat ? 'bg-purple-600 text-white border-purple-600' : isDarkMode ? 'border-slate-600 text-slate-400' : 'border-slate-200 text-slate-500'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Title</label>
                  <input
                    type="text"
                    placeholder="What's your discussion about?"
                    value={newPost.title}
                    onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Content</label>
                  <textarea
                    placeholder="Share your thoughts, questions, or experiences…"
                    value={newPost.content}
                    onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={addPost}
                    disabled={submitting || !newPost.title.trim() || !newPost.content.trim()}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    Publish
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className={`px-5 py-3 rounded-xl border font-semibold text-sm transition-all ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
