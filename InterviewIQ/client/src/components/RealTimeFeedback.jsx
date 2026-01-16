import { useState, useEffect } from "react";
import { useTheme } from "../context/themeContext";
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, Target } from "lucide-react";

export default function RealTimeFeedback({ currentAnswer, questionType, timeRemaining }) {
  const { isDarkMode } = useTheme();
  const [feedback, setFeedback] = useState({
    score: 0,
    tips: [],
    strengths: [],
    improvements: [],
    timeWarning: false
  });

  // Analyze answer in real-time
  useEffect(() => {
    if (!currentAnswer || currentAnswer.length < 10) {
      setFeedback({
        score: 0,
        tips: ["Start speaking to get real-time feedback"],
        strengths: [],
        improvements: [],
        timeWarning: false
      });
      return;
    }

    const analysis = analyzeAnswer(currentAnswer, questionType);
    setFeedback(analysis);
  }, [currentAnswer, questionType]);

  // Time warning
  useEffect(() => {
    if (timeRemaining < 60 && timeRemaining > 0) {
      setFeedback(prev => ({ ...prev, timeWarning: true }));
    } else {
      setFeedback(prev => ({ ...prev, timeWarning: false }));
    }
  }, [timeRemaining]);

  const analyzeAnswer = (answer, type) => {
    const wordCount = answer.split(' ').length;
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    let score = 0;
    const tips = [];
    const strengths = [];
    const improvements = [];

    // Basic scoring based on content
    if (wordCount > 50) score += 2;
    else if (wordCount > 20) score += 1;

    if (sentences > 2) score += 2;
    else if (sentences > 0) score += 1;

    // Check for technical keywords based on question type
    if (type === 'technical') {
      const techKeywords = ['algorithm', 'data', 'function', 'variable', 'complexity', 'solution', 'approach'];
      const foundKeywords = techKeywords.filter(keyword => answer.toLowerCase().includes(keyword));
      if (foundKeywords.length > 2) score += 3;
      else if (foundKeywords.length > 0) score += 1;
    }

    // Behavioral questions
    if (type === 'behavioral') {
      const behavioralKeywords = ['experience', 'learned', 'challenge', 'team', 'situation', 'action', 'result'];
      const foundKeywords = behavioralKeywords.filter(keyword => answer.toLowerCase().includes(keyword));
      if (foundKeywords.length > 2) score += 3;
      else if (foundKeywords.length > 0) score += 1;
    }

    // Generate feedback
    if (wordCount < 20) {
      tips.push("Try to provide more detailed answers");
      improvements.push("Expand on your points with specific examples");
    } else {
      strengths.push("Good level of detail in your response");
    }

    if (sentences < 2) {
      tips.push("Structure your answer with clear sentences");
      improvements.push("Break down your thoughts into complete sentences");
    } else {
      strengths.push("Well-structured response");
    }

    if (score >= 6) {
      tips.push("Excellent! Keep up the great work");
      strengths.push("Strong technical communication");
    } else if (score >= 3) {
      tips.push("Good foundation, focus on adding more depth");
    } else {
      tips.push("Keep practicing - focus on clarity and detail");
    }

    return {
      score: Math.min(score, 10),
      tips,
      strengths,
      improvements,
      timeWarning: false
    };
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 8) return "bg-green-100 dark:bg-green-900";
    if (score >= 6) return "bg-blue-100 dark:bg-blue-900";
    if (score >= 4) return "bg-yellow-100 dark:bg-yellow-900";
    return "bg-red-100 dark:bg-red-900";
  };

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-6 shadow-sm`}>
      <div className="flex items-center gap-2 mb-4">
        <Target size={20} className="text-green-600" />
        <h3 className="text-lg font-semibold">Real-time Feedback</h3>
      </div>

      {/* Live Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Current Score</span>
          <span className={`text-2xl font-bold ${getScoreColor(feedback.score)}`}>
            {feedback.score}/10
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${getScoreBg(feedback.score)}`}
            style={{ width: `${(feedback.score / 10) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Time Warning */}
      {feedback.timeWarning && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Less than 1 minute remaining!
            </span>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={16} className="text-yellow-600" />
          <span className="text-sm font-medium">Tips</span>
        </div>
        <ul className="space-y-1">
          {feedback.tips.map((tip, index) => (
            <li key={index} className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} flex items-start gap-2`}>
              <span className="text-green-600 mt-1">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm font-medium">Strengths</span>
          </div>
          <ul className="space-y-1">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} flex items-start gap-2`}>
                <span className="text-green-600 mt-1">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {feedback.improvements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-blue-600" />
            <span className="text-sm font-medium">Areas for Improvement</span>
          </div>
          <ul className="space-y-1">
            {feedback.improvements.map((improvement, index) => (
              <li key={index} className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} flex items-start gap-2`}>
                <span className="text-blue-600 mt-1">→</span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
