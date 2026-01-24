import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import { User, Mail, Camera, Save, X, MapPin, Briefcase, Plus, Trash2, Github, Linkedin, Globe, Phone, ExternalLink, Award, BookOpen, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    careerStage: user?.careerStage || "",
    geoPresence: user?.geoPresence || "",
    profilePic: user?.profilePic || "",
    linkedin: user?.linkedin || "",
    github: user?.github || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ interviewsTaken: 0, averageScore: 0 });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        careerStage: user.careerStage || "",
        geoPresence: user.geoPresence || "",
        profilePic: user.profilePic || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
      });

      // Fetch real stats for Quick Insights
      const fetchStats = async () => {
        try {
          const res = await api.get("/dashboard/stats");
          setStats(res.data);
        } catch (err) {
          console.error("Failed to fetch profile stats:", err);
        }
      };
      fetchStats();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("image", file);

    try {
      const res = await api.post("/upload/image", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData(prev => ({ ...prev, profilePic: res.data.imageUrl }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} pb-20 transition-colors duration-300`}>
        {/* Profile Header Decor */}
        <div className={`h-56 md:h-80 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-[100px]"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-200 rounded-full blur-[120px]"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/10 to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="relative -mt-24 md:-mt-40">
            <div className="grid lg:grid-cols-12 gap-8 items-start">

              {/* Left Column: Profile Card */}
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-slate-900/50' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} rounded-3xl border p-8 transition-all duration-300`}>

                  {/* Avatar Section */}
                  <div className="relative group mx-auto w-32 h-32 md:w-44 md:h-44 mb-8">
                    <div className={`w-full h-full rounded-3xl overflow-hidden border-4 ${isDarkMode ? 'border-slate-800 shadow-black/40' : 'border-white shadow-xl'} shadow-lg bg-slate-100 flex items-center justify-center relative transform group-hover:scale-[1.02] transition-transform duration-300`}>
                      {formData.profilePic ? (
                        <img
                          src={formData.profilePic.startsWith('http') ? formData.profilePic : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${formData.profilePic}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <User size={64} className="text-slate-300" />
                          <span className="text-xs font-medium text-slate-400">Add Photo</span>
                        </div>
                      )}

                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <button
                        onClick={handleImageClick}
                        className="absolute -bottom-3 -right-3 bg-green-600 text-white p-3.5 rounded-2xl shadow-xl hover:bg-green-700 hover:scale-110 active:scale-95 transition-all duration-200 z-10 border-4 border-white dark:border-slate-800"
                        title="Change Profile Picture"
                      >
                        <Camera size={22} />
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  <div className="text-center mb-8">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                      {user?.name}
                    </h2>
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center justify-center gap-2 mt-2 font-medium`}>
                      <Mail size={16} className="text-green-500" />
                      {user?.email}
                    </p>
                  </div>

                  {/* Summary Stats */}
                  <div className="space-y-5 pt-6 border-t border-slate-700/20 dark:border-slate-700/50">
                    <div className={`flex items-center gap-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                        <MapPin size={18} className="text-green-500" />
                      </div>
                      <span className="font-medium">{formData.geoPresence || "Geo Presence not set"}</span>
                    </div>
                    <div className={`flex items-center gap-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                        <Briefcase size={18} className="text-green-500" />
                      </div>
                      <span className="font-medium">{formData.careerStage ? `${formData.careerStage}` : "Career Stage not set"}</span>
                    </div>
                  </div>

                  {/* Social Links Icons */}
                  <div className="flex justify-center flex-wrap gap-3 mt-8 pt-8 border-t border-slate-700/20 dark:border-slate-700/50">
                    {formData.linkedin && (
                      <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'bg-slate-700 hover:bg-blue-600/20 hover:text-blue-500' : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-600'} p-3 rounded-xl transition-all duration-300 group`}>
                        <Linkedin size={22} className="group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {formData.github && (
                      <a href={formData.github} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 hover:text-white' : 'bg-slate-100 hover:bg-slate-800 hover:text-white'} p-3 rounded-xl transition-all duration-300 group`}>
                        <Github size={22} className="group-hover:scale-110 transition-transform" />
                      </a>
                    )}
                    {!formData.linkedin && !formData.github && !isEditing && (
                      <p className="text-sm text-slate-500 italic">No social links added</p>
                    )}
                  </div>
                </div>

                {/* Achievement Quick View (Real-time Data) */}
                <div className={`mt-8 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-3xl border p-6 transition-all duration-300`}>
                  <h4 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>Real-time Insights</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                        <Award size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {stats.averageScore >= 80 ? 'Top Performer' : stats.averageScore >= 60 ? 'Striving Candidate' : 'Rising Talent'}
                        </p>
                        <p className="text-xs text-slate-500">Average Performance: {stats.averageScore}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Mock Mastery</p>
                        <p className="text-xs text-slate-500">{stats.interviewsTaken} Interviews Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Edit Form */}
              <div className="lg:col-span-8">
                <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-slate-900/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/5'} rounded-3xl border p-6 md:p-10 transition-all duration-300`}>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 pb-6 border-b border-slate-700/10 dark:border-slate-700/40">
                    <div>
                      <h3 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Profile Detail</h3>
                      <p className={`text-base mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Refine your professional narrative and digital presence</p>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto bg-green-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-green-700 hover:shadow-2xl hover:shadow-green-500/40 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                      >
                        Modify Profile
                      </button>
                    ) : (
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          onClick={() => setIsEditing(false)}
                          className={`flex-1 sm:flex-none ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'} px-6 py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center font-bold`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={loading || uploading}
                          className="flex-1 sm:flex-none bg-green-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-green-700 hover:shadow-2xl hover:shadow-green-500/40 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 text-lg"
                        >
                          {loading ? (
                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save size={20} />
                          )}
                          Persist
                        </button>
                      </div>
                    )}
                  </div>

                  <form className="space-y-10">
                    {/* Basic Info Group */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="text-green-500" size={20} />
                        <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Professional Essentials</h4>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Name */}
                        <div className="md:col-span-2">
                          <label className={`block text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Legal Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 ${isDarkMode
                                ? 'bg-slate-900 border-slate-700 text-white disabled:opacity-60 focus:border-green-500 focus:bg-slate-800'
                                : 'bg-slate-50 border-slate-200 disabled:bg-slate-100 focus:border-green-500 focus:bg-white'
                                } focus:ring-8 focus:ring-green-500/10 focus:outline-none text-lg`}
                            />
                          </div>
                        </div>

                        {/* Career Stage */}
                        <div>
                          <label className={`block text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Career Stage
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <select
                              name="careerStage"
                              value={formData.careerStage}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 appearance-none transition-all duration-300 ${isDarkMode
                                ? 'bg-slate-900 border-slate-700 text-white disabled:opacity-60 focus:border-green-500 focus:bg-slate-800'
                                : 'bg-slate-50 border-slate-200 disabled:bg-slate-100 focus:border-green-500 focus:bg-white'
                                } focus:ring-8 focus:ring-green-500/10 focus:outline-none text-lg`}
                            >
                              <option value="">Choose Tenure</option>
                              <option value="Entry Level">Entry Level</option>
                              <option value="1-3 Years">Junior (1-3 Years)</option>
                              <option value="3-5 Years">Intermediate (3-5 Years)</option>
                              <option value="5-10 Years">Senior (5-10 Years)</option>
                              <option value="10+ Years">Expert (10+ Years)</option>
                            </select>
                          </div>
                        </div>

                        {/* Geo Presence */}
                        <div>
                          <label className={`block text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Geo Presence
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                              type="text"
                              name="geoPresence"
                              value={formData.geoPresence}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              placeholder="City, Country"
                              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 ${isDarkMode
                                ? 'bg-slate-900 border-slate-700 text-white disabled:opacity-60 focus:border-green-500 focus:bg-slate-800'
                                : 'bg-slate-50 border-slate-200 disabled:bg-slate-100 focus:border-green-500 focus:bg-white'
                                } focus:ring-8 focus:ring-green-500/10 focus:outline-none text-lg`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Connect Group */}
                    <div className="space-y-6 pt-10 border-t border-slate-700/10 dark:border-slate-700/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="text-blue-500" size={20} />
                        <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Digital Footprint</h4>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        {/* LinkedIn */}
                        <div className="md:col-span-2">
                          <label className={`block text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            LinkedIn Profile URL
                          </label>
                          <div className="relative">
                            <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                            <input
                              type="url"
                              name="linkedin"
                              value={formData.linkedin}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 ${isDarkMode
                                ? 'bg-slate-900 border-slate-700 text-white disabled:opacity-60 focus:border-green-500 focus:bg-slate-800'
                                : 'bg-slate-50 border-slate-200 disabled:bg-slate-100 focus:border-green-500 focus:bg-white'
                                } focus:ring-8 focus:ring-green-500/10 focus:outline-none`}
                            />
                          </div>
                        </div>

                        {/* GitHub */}
                        <div className="md:col-span-2">
                          <label className={`block text-sm font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            GitHub Profile URL
                          </label>
                          <div className="relative">
                            <Github className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} size={20} />
                            <input
                              type="url"
                              name="github"
                              value={formData.github}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              placeholder="https://github.com/yourusername"
                              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 ${isDarkMode
                                ? 'bg-slate-900 border-slate-700 text-white disabled:opacity-60 focus:border-green-500 focus:bg-slate-800'
                                : 'bg-slate-50 border-slate-200 disabled:bg-slate-100 focus:border-green-500 focus:bg-white'
                                } focus:ring-8 focus:ring-green-500/10 focus:outline-none`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>


                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
