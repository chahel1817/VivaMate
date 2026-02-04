import { useTheme } from "../context/themeContext";
import { Mail, Linkedin, Instagram, Github, Heart, LayoutDashboard } from "lucide-react";

export default function Footer() {
    const { isDarkMode } = useTheme();

    const socialLinks = [
        { name: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/in/chahel-tanna-87300a269/", color: "hover:text-blue-500" },
        { name: "Instagram", icon: Instagram, url: "https://www.instagram.com/chahel_1817/", color: "hover:text-pink-500" },
        { name: "GitHub", icon: Github, url: "https://github.com/chahel1817", color: "hover:text-gray-400" },
        { name: "Email", icon: Mail, url: "mailto:chahe1817@gmail.com", color: "hover:text-green-500" }
    ];

    return (
        <footer className={`bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-all duration-300`}>
            <div className="max-w-7xl mx-auto px-8 py-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-3">

                    {/* About Section - Left Side */}
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 mb-3 group cursor-pointer">
                            <div className="bg-green-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-green-600/20">
                                <LayoutDashboard size={20} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                                VivaMate
                            </h3>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-4 leading-relaxed`}>
                            VivaMate is your AI-powered interview preparation companion. ACE realistic mock interviews, receive instant AI-driven feedback, and track your progress with detailed analytics. Our platform is designed to help you build confidence and master the skills needed to land your dream job.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social, i) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={i}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} p-2 rounded-lg transition-all duration-300 ${social.color} hover:scale-110 hover:shadow-md`}
                                        aria-label={social.name}
                                    >
                                        <Icon size={16} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Links Section - Right Side */}
                    <div className="md:text-right">
                        <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Resources
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { name: "Dashboard", path: "/dashboard" },
                                { name: "Start Mock Interview", path: "/interview/select" },
                                { name: "Performance Analytics", path: "/analytics" },
                                { name: "User Profile", path: "/profile" }
                            ].map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.path}
                                        className={`text-xs ${isDarkMode ? 'text-slate-400 hover:text-green-400' : 'text-slate-600 hover:text-green-600'} transition-colors inline-block hover:translate-x-1 duration-200`}
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex flex-col md:flex-row justify-between items-center gap-3`}>
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} flex items-center gap-1`}>
                        Made with <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" /> by VivaMate Team
                    </p>
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                        © {new Date().getFullYear()} VivaMate. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
