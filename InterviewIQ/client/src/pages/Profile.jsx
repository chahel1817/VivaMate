import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import { User, Mail, Camera, Save, X } from "lucide-react";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    skills: user?.skills || [],
    experience: user?.experience || "",
    location: user?.location || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        skills: user.skills || [],
        experience: user.experience || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Picture & Basic Info */}
          <div className="md:col-span-1">
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 text-center`}>
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-green-600" />
                </div>
                <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition">
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="text-xl font-semibold mb-1">{user?.name}</h2>
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center justify-center gap-2`}>
                <Mail size={16} />
                {user?.email}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="md:col-span-2">
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} px-4 py-2 rounded-lg transition`}
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <Save size={16} className="inline mr-2" />
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white disabled:bg-slate-800'
                        : 'bg-white border-slate-300 disabled:bg-slate-50'
                    } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    } cursor-not-allowed`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Email cannot be changed
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white disabled:bg-slate-800'
                        : 'bg-white border-slate-300 disabled:bg-slate-50'
                    } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Years of Experience
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white disabled:bg-slate-800'
                        : 'bg-white border-slate-300 disabled:bg-slate-50'
                    } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500`}
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="City, Country"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white disabled:bg-slate-800'
                        : 'bg-white border-slate-300 disabled:bg-slate-50'
                    } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Skills
                  </label>
                  {isEditing && (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Add a skill..."
                        className={`flex-1 px-4 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-slate-700 border-slate-600 text-white'
                            : 'bg-white border-slate-300'
                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          isDarkMode
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {skill}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-red-500 transition"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
