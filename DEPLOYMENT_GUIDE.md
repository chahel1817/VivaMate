# VivaMate Deployment Guide

This guide outlines the steps to deploy your MERN stack application to **Render (Backend)** and **Vercel (Frontend)**.

## Prerequisites
- A GitHub repository with your latest code pushed.
- A **MongoDB Atlas** database URI.
- **API Keys** for OpenRouter/OpenAI and Email credentials (if using email features).

---

## Part 1: Deploy Backend to Render

1.  **Create Service**:
    -   Log in to [Render.com](https://render.com).
    -   Click **New +** -> **Web Service**.
    -   Connect your GitHub repository `vivamate` (or whatever you named it).

2.  **Configuration**:
    -   **Name**: `vivamate-api` (or similar).
    -   **Region**: Choose one close to you (e.g., Singapore, Frankfurt, Oregon).
    -   **Branch**: `main` (or your working branch).
    -   **Root Directory**: `server` (⚠️ **CRITICAL**: Do not leave this blank).
    -   **Runtime**: `Node`.
    -   **Build Command**: `npm install`.
    -   **Start Command**: `node server.js`.

3.  **Environment Variables**:
    -   Scroll down to **Environment Variables** and add the following:
        -   `MONGO_URI`: Your MongoDB connection string (e.g., `mongodb+srv://...`).
        -   `JWT_SECRET`: A long random string for security.
        -   `OPENROUTER_API_KEY`: Your OpenRouter API key.
        -   `EMAIL_USER`: Your email address (for nodemailer).
        -   `EMAIL_PASS`: Your email app password.
        -   `PORT`: `5000` (Optional, Render sets this automatically, but good to have).

4.  **Deploy**:
    -   Click **Create Web Service**.
    -   Wait for the deployment to finish. You should see "Server running on port..." in the logs.
    -   **Copy the URL**: It will look like `https://vivamate-api.onrender.com`. You need this for the frontend!

---

## Part 2: Deploy Frontend to Vercel

1.  **Import Project**:
    -   Log in to [Vercel.com](https://vercel.com).
    -   Click **Add New ...** -> **Project**.
    -   Import your `vivamate` repository.

2.  **Project Settings**:
    -   **Framework Preset**: Vite (should be detected automatically).
    -   **Root Directory**: Click "Edit" and select `InterviewIQ/client` (⚠️ **CRITICAL**: Assumes your client code is here).

3.  **Build Settings** (should be auto-filled, but verify):
    -   **Build Command**: `npm run build` (⚠️ **CRITICAL**: Use this instead of `vite build` to avoid "command not found" errors).
    -   **Output Directory**: `dist`
    -   **Install Command**: `npm install`

4.  **Environment Variables**:
    -   Expand the **Environment Variables** section.
    -   Add:
        -   **Key**: `VITE_API_URL`
        -   **Value**: The Render Backend URL you copied earlier (e.g., `https://vivamate-api.onrender.com/api`).
        -   *Note: Make sure to include `/api` at the end if your backend routes are prefixed with it (which they are!).*

5.  **Deploy**:
    -   Click **Deploy**.
    -   Vercel will build your project. Once done, you will get a live URL (e.g., `https://vivamate.vercel.app`).

---

## Verification

1.  Open your Vercel URL.
2.  Open the **Developer Tools** (F12) -> **Network** tab.
3.  Try to Login or Signup.
4.  Check if the request goes to your Render URL (not localhost).
5.  If you see a "CORS" error, ensure your Backend allows the Vercel domain (currently set to allow all `*`, so it should work).

## Troubleshooting

-   **White Screen on Frontend**:
    -   Check the Console for errors.
    -   I added a `vercel.json` file to handle routing, so refreshing pages should work.
-   **Backend Connection Failed**:
    -   Check if `VITE_API_URL` is correct in Vercel.
    -   Check Render logs to see if the server crashed (often due to wrong `MONGO_URI`).
