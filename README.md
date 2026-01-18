# 🚀 VivaMate - AI-Powered Mock Interview Platform

VivaMate is a state-of-the-art MERN stack platform designed to help job seekers master their interview skills through AI-driven simulations, real-time feedback, and community support.

---

## ✨ Key Functionalities

### 1. 🤖 AI-Driven Mock Interviews
- **Adaptive Question Generation**: Uses OpenRouter/OpenAI to generate unique, role-specific interview questions based on domain (e.g., Software Engineering) and technology (e.g., React).
- **Difficulty Scaling**: Users can choose between Junior, Intermediate, and Senior difficulty levels.
- **Real-time Interaction**: Simulates a live interview environment with timed responses and interactive sessions.

### 2. 📊 Intelligent Performance Analytics
- **Instant Evaluation**: AI analyzes answers for technical accuracy, clarity, and confidence.
- **Skill Breakdown**: Visualizes performance across Technical, Communication, and Behavioral categories using dynamic charts (Recharts).
- **Performance Trends**: Tracks progress over time to show improvement across multiple sessions.
- **Consistency Score**: Measures how steady your performance is throughout an interview session.

### 3. 👤 Personalized Dashboard & Profile
- **Recent Activity**: Quickly view your latest interview scores and feedback.
- **Profile Management**: Customize your professional details, skills, and experience.
- **Resume Upload**: Securely upload and manage your professional resume.

### 4. 🤝 Community & Support
- **Interview Forum**: Share tips, ask questions, and interact with other job seekers.
- **Messaging System**: Connect with peers for networking and collaborative learning.
- **Feedback Loop**: Integrated system for users to provide feedback and suggestions for platform improvement.

### 5. 📑 Downloadable Reports
- **Result Export**: Generate and download comprehensive PDF reports of your interview performance, including per-question feedback and AI recommendations.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Real-time & AI**: Socket.io, OpenRouter/OpenAI API.
- **Security**: JWT Authentication, Bcrypt password hashing.

---

## 🚀 Getting Started

1. **Clone the repository**
2. **Install Dependencies**: `npm install` in both `server` and `client` directories.
3. **Setup Environment**: Configure `.env` with your `MONGO_URI`, `JWT_SECRET`, and `OPENROUTER_API_KEY`.
4. **Run Locally**:
   - Backend: `npm start` (in `/server`)
   - Frontend: `npm run dev` (in `/InterviewIQ/client`)

---

## 📘 API Documentation
For detailed API endpoints, request/response formats, and testing scripts, see our [Postman Collection Guide](./POSTMAN_COLLECTION.md).
