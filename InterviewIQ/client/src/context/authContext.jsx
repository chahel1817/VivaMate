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

  useEffect(() => {
  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      setUser(res.data); // ✅ real user
    } catch (err) {
      localStorage.removeItem("token");
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
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await registerService(name, email, password);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // For OTP-based login flows: directly set token + user
  const loginWithToken = (token, userData) => {
    if (token) {
      localStorage.setItem("token", token);
    }
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
      localStorage.setItem('token', data.token);
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

  const value = {
    user,
    login,
    register,
    logout,
    loginWithToken,
    requestOtp,
    verifyOtp,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
