import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import { MessageSquare, Send, User } from "lucide-react";
import api from "../services/api";

export default function Forum() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [newComment, setNewComment] = useState({});
  const [postSubmitted, setPostSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/forum');
      setPosts(res.data);
      console.log('Fetched posts from database:', res.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const addPost = async () => {
    if (newPost.title && newPost.content) {
      // Optimistic Update
      const tempId = Date.now();
      const optimisticPost = {
        _id: tempId,
        title: newPost.title,
        content: newPost.content,
        author: user?.name || "You",
        date: new Date().toISOString(),
        comments: []
      };

      setPosts([optimisticPost, ...posts]);
      setPostSubmitted(true);
      setShowModal(false);

      // Reset form immediately
      setNewPost({ title: "", content: "" });
      setTimeout(() => setPostSubmitted(false), 3000);

      try {
        const res = await api.post('/forum', {
          ...optimisticPost,
          author: user?.name || user?.username || "Anonymous"
        });

        // Replace optimistic post with real server response
        setPosts((currentPosts) =>
          currentPosts.map(p => p._id === tempId ? res.data : p)
        );
      } catch (err) {
        console.error('Failed to add post:', err);
        // Revert on failure
        setPosts((currentPosts) => currentPosts.filter(p => p._id !== tempId));
        alert('Failed to create post. Please try again.');
      }
    }
  };

  const addComment = async (postId, text) => {
    if (text) {
      try {
        const res = await api.post(`/forum/${postId}/comment`, {
          author: user?.name || user?.username || "Anonymous",
          text
        });
        console.log('Comment added to database:', res.data);
        setPosts(posts.map(post => post._id === postId ? res.data : post));
        setNewComment({ ...newComment, [postId]: "" });
      } catch (err) {
        console.error('Failed to add comment:', err);
        alert('Failed to add comment. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} py-8`}>
      <div className="max-w-4xl mx-auto px-6">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Community Forum</h1>

        {/* New Post Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <MessageSquare size={20} />
            Start a New Discussion
          </button>
        </div>

        {/* Success Message */}
        {postSubmitted && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Post submitted successfully!
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-8 text-center`}>
              <MessageSquare size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>No posts yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{post.title}</h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  By {post.author} on {new Date(post.date).toLocaleDateString()}
                </p>
                <p className={`mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{post.content}</p>

                {/* Comments */}
                <div className="space-y-3 mb-4">
                  {post.comments && post.comments.map((comment, index) => (
                    <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{comment.author}</p>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{comment.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment[post._id] || ""}
                    onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                    className={`flex-1 p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
                  />
                  <button
                    onClick={() => addComment(post._id, newComment[post._id])}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Post Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <div
              className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 w-full max-w-md mx-4`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Start a New Discussion</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className={`text-2xl ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-800'}`}
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Post Title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className={`w-full p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
              />
              <textarea
                placeholder="Share your thoughts..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className={`w-full p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={addPost}
                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Send size={16} className="inline mr-2" /> Post
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className={`px-6 py-2 rounded-lg border transition ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-slate-100 border-slate-300 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
