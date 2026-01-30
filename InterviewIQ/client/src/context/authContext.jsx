import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { login as loginService, register as registerService, requestOtp as requestOtpService, verifyOtp as verifyOtpService } from "../services/authService";


const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount (via cookie)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginService(email, password);
      // Cookie is set by server automatically
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerService(name, email, password);
      // Register might set cookie too if auto-login is enabled in backend (yes it is)
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
      // Force logout on client anyway
      setUser(null);
    }
  };

  // For OTP-based login flows
  const loginWithToken = (token, userData) => {
    // This function is less relevant with cookies unless we manually reload
    // or if the OTP verification returns a set-cookie header (which it does now).
    // So we just update the user state.
    if (userData) {
      setUser(userData);
    }
  };

  const requestOtp = async (email) => {
    try {
      const data = await requestOtpService(email);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const data = await verifyOtpService(email, otp);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put("/auth/profile", profileData);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error("Failed to refresh user", error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loginWithToken,
    requestOtp,
    verifyOtp,
    updateProfile,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
