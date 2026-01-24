# VivaMate API Postman Collection

This document provides the full list of API endpoints organized by functional modules, including request headers, body examples, and Postman test scripts.

## Base URL
`http://localhost:5000/api`

---

## 📂 01. Auth & Profile

### 1. Register User
- **Method**: `POST`
- **URL**: `{{url}}/auth/register`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body (JSON)**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Registration successful", function () {
      pm.response.to.have.status(201);
      pm.expect(pm.response.json().message).to.include("registered successfully");
  });
  ```

### 2. Login
- **Method**: `POST`
- **URL**: `{{url}}/auth/login`
- **Headers**:
  - `Content-Type`: `application/json`
- **Body (JSON)**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Status code is 200", () => pm.response.to.have.status(200));
  pm.test("Token is returned", function () {
      const jsonData = pm.response.json();
      pm.expect(jsonData.token).to.be.a("string");
      pm.environment.set("token", jsonData.token);
  });
  ```

### 3. Update Profile (New Model)
- **Method**: `PUT`
- **URL**: `{{url}}/auth/profile`
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer {{token}}`
- **Body (JSON)**:
  ```json
  {
    "name": "Jane Smith",
    "bio": "Senior Software Engineer",
    "skills": ["React", "Node.js", "Docker"]
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Profile updated", () => pm.response.to.have.status(200));
  ```

### 4. Get My Data
- **Method**: `GET`
- **URL**: `{{url}}/auth/me`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Tests**:
  ```javascript
  pm.test("User data loaded", function () {
      pm.response.to.have.status(200);
      pm.expect(pm.response.json()).to.have.property("email");
  });
  ```

---

## 📂 02. Interview Flow

### 1. Start Session
- **Method**: `POST`
- **URL**: `{{url}}/interview/start-session`
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer {{token}}`
- **Body (JSON)**:
  ```json
  {
    "domain": "Frontend",
    "tech": "React",
    "difficulty": "Mid-level",
    "totalQuestions": 3
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Session started", function () {
      pm.response.to.have.status(201);
      pm.environment.set("current_session_id", pm.response.json()._id);
  });
  ```

### 2. Save Response
- **Method**: `POST`
- **URL**: `{{url}}/responses/`
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer {{token}}`
- **Body (JSON)**:
  ```json
  {
    "sessionId": "{{current_session_id}}",
    "question": "What is the Virtual DOM?",
    "answer": "It is a lightweight representation of the real DOM.",
    "scores": {
      "technical": 9,
      "clarity": 8,
      "confidence": 10
    }
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Response saved", () => pm.response.to.have.status(201));
  ```

### 3. Generate AI Summary
- **Method**: `POST`
- **URL**: `{{url}}/interview/summary`
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer {{token}}`
- **Body (JSON)**:
  ```json
  {
    "sessionId": "{{current_session_id}}"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Summary generated", () => pm.response.to.have.status(200));
  ```

### 4. Fetch Latest Report
- **Method**: `GET`
- **URL**: `{{url}}/interview/summary`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Tests**:
  ```javascript
  pm.test("Reports fetched", function () {
      pm.response.to.have.status(200);
      pm.expect(pm.response.json()).to.be.an("array");
  });
  ```

---

## 📂 03. Community & Messaging

### 1. Create Forum Post
- **Method**: `POST`
- **URL**: `{{url}}/forum/`
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer {{token}}`
- **Body (JSON)**:
  ```json
  {
    "title": "Tips for System Design",
    "content": "Focus on scalability and reliable transport layers.",
    "author": "Jane Smith"
  }
  ```
- **Tests**:
  ```javascript
  pm.test("Post created", () => pm.response.to.have.status(201));
  ```

### 2. Get All Posts
- **Method**: `GET`
- **URL**: `{{url}}/forum/`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Tests**:
  ```javascript
  pm.test("Posts retrieved", () => pm.response.to.have.status(200));
  ```

### 3. Get Dashboard Stats
- **Method**: `GET`
- **URL**: `{{url}}/dashboard/stats`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Tests**:
  ```javascript
  pm.test("Stats loaded", function () {
      pm.response.to.have.status(200);
      const data = pm.response.json();
      pm.expect(data).to.have.property("skillBreakdown");
      pm.expect(data).to.have.property("performanceTrend");
  });
  ```

---

## 🛠️ Postman Setup Guide

1. **Environment Variables**:
   - `url`: `http://localhost:5000/api`
   - `token`: (Automatically set after a successful Login)
   - `current_session_id`: (Automatically set after starting a session)

2. **Global Headers**:
   - Ensure `Content-Type: application/json` is set for all `POST` and `PUT` requests.
   - For all routes except Register and Login, add `Authorization: Bearer {{token}}`.

3. **Collection Runner**:
   - You can run the entire collection in order: Register -> Login -> Start Session -> Save Response -> Generate Summary.
