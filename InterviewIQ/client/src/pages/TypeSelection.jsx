import { FileText, Settings, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/themeContext";
import Navbar from "../components/Navbar";
import { toast } from "react-hot-toast";
import api from "../services/api";
import { trackEvent } from "../services/analytics";

export default function TypeSelection() {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [isUploading, setIsUploading] = useState(false);

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF resume.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("resume", file);

        try {
            const res = await api.post("/upload/resume", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                toast.success("Resume analyzed successfully!");
                const { skills, projects, domain, experienceLevel } = res.data.data;

                // Track analytics
                trackEvent("resume_uploaded", {
                    skills_count: skills?.length || 0,
                    domain: domain,
                    experience_level: experienceLevel
                });

                // Navigate to config with extracted data
                navigate("/interview/config", {
                    state: {
                        isResumeMode: true,
                        resumeFileName: file.name,
                        extractedSkills: skills,
                        extractedProjects: projects,
                        domain: domain || "Software Development",
                        experienceLevel: experienceLevel || "Mid-level"
                    }
                });
            } else {
                toast.error(res.data.message || "Failed to analyze resume.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error connecting to server. Make sure you are logged in.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black mb-4">Choose Interview Type</h1>
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-lg`}>
                        How would you like to be interviewed today?
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    {/* OPTION 1: SUBJECT BASED */}
                    <div
                        onClick={() => navigate("/interview/select")}
                        className={`group cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${isDarkMode
                            ? 'bg-slate-800 border-slate-700 hover:border-green-500 hover:bg-slate-700'
                            : 'bg-white border-slate-200 hover:border-green-500 hover:bg-green-50/30'
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDarkMode ? 'bg-slate-700 group-hover:bg-green-500/20' : 'bg-slate-100 group-hover:bg-green-100'
                            }`}>
                            <Settings className="text-green-500" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Manual Selection</h3>
                        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-6`}>
                            Select specific subjects like React, Java, or Operating Systems to test your deep knowledge.
                        </p>
                        <div className="flex items-center text-green-500 font-bold group-hover:translate-x-2 transition-transform">
                            Select Subjects →
                        </div>
                    </div>

                    {/* OPTION 2: RESUME BASED */}
                    <div
                        className={`group relative p-8 rounded-3xl border-2 transition-all duration-300 transform hover:-translate-y-2 ${isDarkMode
                            ? 'bg-slate-800 border-slate-700 hover:border-blue-500 hover:bg-slate-700'
                            : 'bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50/30'
                            }`}
                    >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDarkMode ? 'bg-slate-700 group-hover:bg-blue-500/20' : 'bg-slate-100 group-hover:bg-blue-100'
                            }`}>
                            <FileText className="text-blue-500" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Resume Powered</h3>
                        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mb-6`}>
                            Upload your resume and let AI generate realistic questions based on your projects and skills.
                        </p>

                        <label className="cursor-pointer">
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={handleResumeUpload}
                                disabled={isUploading}
                            />
                            <div className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all ${isUploading
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                                }`}>
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Upload Resume
                                    </>
                                )}
                            </div>
                        </label>
                        <p className="text-[10px] text-center mt-3 opacity-50 uppercase tracking-widest font-bold">PDF Format only</p>
                    </div>
                </div>

                {/* INFO TIP */}
                <div className={`mt-12 p-6 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-blue-900/10 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'
                    }`}>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
                        ✨
                    </div>
                    <p className="text-sm font-medium">
                        <strong>Pro Tip:</strong> Resume-powered interviews are 3x more effective for real job preparation as they test your actual experience.
                    </p>
                </div>
            </div>
        </div>
    );
}
