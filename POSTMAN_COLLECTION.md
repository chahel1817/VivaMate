# VivaMate API Postman Collection

This document provides a comprehensive list of API endpoints with request examples, Postman tests, and sample responses.

## Base URL
`http://localhost:5000/api`

---

## 🔐 Authentication (`/auth`)

### 1. Register User
- **Method**: `POST`
- **URL**: `/auth/register`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 201", function () {
      pm.response.to.have.status(201);
  });
  ```
- **Response**: `{"message": "User registered successfully"}`

### 2. Login User
- **Method**: `POST`
- **URL**: `/auth/login`
- **Request Body**: `{"email": "john@example.com", "password": "password123"}`
- **Tests**:
  ```javascript
  pm.test("Token exists", () => pm.expect(pm.response.json().token).to.be.a("string"));
  pm.environment.set("token", pm.response.json().token);
  ```
- **Response**: `{"token": "...", "user": {...}}`

### 3. Update Profile
- **Method**: `PUT`
- **URL**: `/auth/profile`
- **Protected**: Yes
- **Request Body**:
  ```json
  {
    "bio": "Full Stack Developer",
    "skills": ["React", "Express", "MongoDB"],
    "location": "New York"
  }
  ```
- **Response**: `{"message": "Profile updated successfully", "user": {...}}`

---

## 👨‍💼 Interview Sessions (`/interview`)

### 1. Start Session
- **Method**: `POST`
- **URL**: `/interview/start`
- **Protected**: Yes
- **Request Body**:
  ```json
  {
    "domain": "Software Engineering",
    "tech": "React",
    "difficulty": "Intermediate",
    "totalQuestions": 5
  }
  ```
- **Response**: `{"sessionId": "session_1705600000_..."}`

### 2. Create Session Summary (Finish)
- **Method**: `POST`
- **URL**: `/interview/summary`
- **Request Body**: `{"sessionId": "session_..."}`
- **Response**: Full JSON object of the completed session with scores and feedback.

---

## 🤖 AI Interaction (`/ai`)

### 1. Generate Questions
- **Method**: `POST`
- **URL**: `/ai/generate-questions`
- **Request Body**: `{"type": "Node.js", "count": 5}`
- **Response**: `{"success": true, "questions": [...]}`

### 2. Analyze Answer
- **Method**: `POST`
- **URL**: `/ai/analyze-answer`
- **Request Body**:
  ```json
  {
    "question": "What is JSX?",
    "answer": "JSX is a syntax extension for JavaScript that looks like HTML."
  }
  ```
- **Response**:
  ```json
  {
    "technicalScore": 9,
    "clarityScore": 10,
    "confidenceScore": 8,
    "feedback": "Perfect and concise definition."
  }
  ```

---

## 📊 Dashboard (`/dashboard`)

### 1. Overview
- **Method**: `GET`
- **URL**: `/api/dashboard`
- **Response**: `{"interviewsTaken": 5, "averageScore": 82, "recentActivity": [...]}`

### 2. Detailed Stats
- **Method**: `GET`
- **URL**: `/api/dashboard/stats`
- **Response**: Includes `skillBreakdown` (Technical, Communication, Behavioral) and `performanceTrend`.

---

## 💬 Forum & Messages

### 1. Get Forum Posts
- **Method**: `GET`
- **URL**: `/forum`
- **Response**: Array of post objects.

### 2. Create Post
- **Method**: `POST`
- **URL**: `/forum`
- **Request Body**: `{"title": "Title", "content": "Body", "author": "Name"}`

---

## 📁 File Uploads (`/upload`)

### 1. Resume Upload
- **Method**: `POST`
- **URL**: `/upload/resume`
- **Body Type**: `form-data` (Key: `resume`)
- **Response**: `{"message": "Resume uploaded successfully", "resumeUrl": "..."}`

---

## Setup Instructions

1. **Authorization**: Use **Bearer Token** with the value from login.
2. **Environment Variable**: Set `url` as `http://localhost:5000/api`.
3. **Automated Tests**: Every endpoint includes basic status code checks in the collection.
