import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import RealTimeFeedback from "../components/RealTimeFeedback";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function Interview() {
  /* ================= ROUTE STATE ================= */
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate("/dashboard");
    return null;
  }

  const { domain, tech, difficulty, totalQuestions } = state;

  /* ================= REFS ================= */
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const speechRef = useRef(null);

  /* ================= STATE ================= */
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [timerActive, setTimerActive] = useState(false);
  const [timePressureMode, setTimePressureMode] = useState(false); // Toggle for time pressure mode
  const [replaying, setReplaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  /* ================= CAMERA & MIC ================= */
  useEffect(() => {
    if (loading) return;

    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true,
        });

        if (!mounted) return;

        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        await video.play();
      } catch (err) {
        console.error("CAMERA ERROR:", err);
        setError("Unable to access camera");
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [loading]);

  /* ================= START SESSION ================= */
  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await api.post("/interview/start-session", {
          domain,
          tech,
          difficulty,
          totalQuestions,
        });
        setSessionId(res.data.sessionId);
      } catch (err) {
        console.error("Session error:", err);
        setError("Failed to start interview session");
      }
    };

    startSession();
  }, [domain, tech, difficulty, totalQuestions]);

  /* ================= LOAD UNIQUE QUESTIONS ================= */
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const unique = new Set();
        const list = [];

        while (list.length < totalQuestions) {
          console.log(`Requesting question ${list.length + 1}/${totalQuestions} for type: ${domain} ${tech} ${difficulty}`);
          const res = await api.post("/ai/question", {
            type: `${domain} ${tech} ${difficulty}`,
            count: 1,
          });

          console.log('API Response:', res.data);
          const q = res.data?.questions?.[0]?.question?.trim();
          console.log('Extracted question:', q);
          if (q && !unique.has(q)) {
            unique.add(q);
            list.push(q);
            console.log(`Added question ${list.length}: ${q}`);
          } else {
            console.log('Question was duplicate or empty, skipping');
          }
        }

        setQuestions(list);
      } catch (err) {
        console.error("Question load error:", err);
        setError("Failed to load interview questions");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [domain, tech, difficulty, totalQuestions]);

  /* ================= TIMER ================= */
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Time's up - auto submit with penalty
      if (recording) {
        stopAnswer();
        alert("Time's up! Your answer will be penalized for being over time.");
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, recording]);

  // Reset timer when moving to next question
  useEffect(() => {
    setTimeLeft(120);
    setTimerActive(false);
  }, [currentIndex]);

  /* ================= SPEECH TO TEXT ================= */
  const startSpeech = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          text += event.results[i][0].transcript + " ";
        }
      }
      if (text) {
        setTranscript((prev) => (prev + " " + text).trim());
      }
    };

    recognition.start();
    speechRef.current = recognition;
  };

  const stopSpeech = () => {
    speechRef.current?.stop();
  };

  /* ================= REPLAY ANSWER ================= */
  const replayAnswer = useCallback(() => {
    if (!transcript.trim() || replaying) return;

    setReplaying(true);
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.onend = () => setReplaying(false);
    utterance.onerror = () => setReplaying(false);
    speechSynthesis.speak(utterance);
  }, [transcript, replaying]);

  /* ================= ANSWER CONTROLS ================= */
  const startAnswer = () => {
    setRecording(true);
    if (timePressureMode) {
      setTimerActive(true);
    }
    startSpeech();
  };

  const stopAnswer = () => {
    setRecording(false);
    setTimerActive(false);
    stopSpeech();
  };

  /* ================= SUBMIT & NEXT ================= */
  const submitAndNext = async () => {
    stopSpeech();
    setRecording(false);

    if (!transcript.trim()) {
      alert("Please answer the question");
      return;
    }

    setSubmitting(true);
    setSubmitMessage("Evaluating your answer...");

    try {
      const question = questions[currentIndex];

      const evalRes = await api.post("/ai/evaluate", {
        question,
        answer: transcript,
      });

      setSubmitMessage("Saving your response...");

      // Map AI evaluation response to scores object
      const scores = {
        technical: evalRes.data.technicalScore || 0,
        clarity: evalRes.data.clarityScore || 0,
        confidence: evalRes.data.confidenceScore || 0,
      };

      const responseRes = await api.post("/responses", {
        sessionId,
        question,
        transcript,
        feedback: evalRes.data.feedback,
        scores: scores,
        domain,
        tech,
        difficulty,
        timeTaken: timePressureMode ? (120 - timeLeft) : null,
        timePenalty: timePressureMode && timeLeft === 0,
      });

      console.log("Response saved:", responseRes.data);
      setSubmitMessage("Answer submitted successfully!");

      // Brief delay to show success message
      await new Promise(resolve => setTimeout(resolve, 500));

      setTranscript("");
      setSubmitting(false);
      setSubmitMessage("");

      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
        setTimeLeft(120); // Reset timer for next question
      } else {
        setSubmitMessage("Generating summary...");
        await api.post("/interview/summary", { sessionId });
        navigate("/interview-processing");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitting(false);
      setSubmitMessage("");
      alert(`Failed to submit answer: ${err.response?.data?.message || err.message || "Unknown error"}`);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen text-slate-500">
          Preparing your interview…
        </div>
      </>
    );
  }

  /* ================= UI ================= */
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* VIDEO */}
          <div className="lg:col-span-3 bg-black rounded-xl overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-[560px] object-cover"
            />

            {recording && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                ● Recording
              </div>
            )}
          </div>

          {/* QUESTION */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 flex flex-col">
            <p className="text-sm text-slate-500 mb-2">
              Question {currentIndex + 1} of {totalQuestions}
            </p>

            {/* TIME PRESSURE TOGGLE + TIMER */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setTimePressureMode((prev) => !prev)}
                className={`text-xs px-3 py-1 rounded-full border ${
                  timePressureMode
                    ? "bg-red-50 border-red-400 text-red-700"
                    : "bg-slate-50 border-slate-300 text-slate-600"
                }`}
              >
                {timePressureMode ? "Time Pressure Mode: ON" : "Time Pressure Mode: OFF"}
              </button>

              <div
                className={`text-xs font-mono px-3 py-1 rounded-full ${
                  !timePressureMode
                    ? "bg-slate-100 text-slate-500"
                    : timeLeft <= 15
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : timeLeft <= 45
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                ⏱ {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                {String(timeLeft % 60).padStart(2, "0")}
              </div>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full mb-4">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {questions[currentIndex] || "Loading question..."}
            </h3>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="flex-1 border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Speak or type your answer..."
            />

            <div className="mt-4 flex gap-3">
              {!recording ? (
                <button
                  onClick={startAnswer}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                >
                  Start Answer
                </button>
              ) : (
                <button
                  onClick={stopAnswer}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                >
                  Stop Answer
                </button>
              )}

              <button
                onClick={replayAnswer}
                disabled={!transcript.trim() || replaying || submitting}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replaying ? "Replaying..." : "Replay Answer"}
              </button>
            </div>

            {submitMessage && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${
                submitMessage.includes("success") 
                  ? "bg-green-100 text-green-800" 
                  : submitMessage.includes("error") || submitMessage.includes("Failed")
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}>
                {submitMessage}
              </div>
            )}

            <button
              onClick={submitAndNext}
              disabled={!transcript.trim() || submitting}
              className="mt-3 w-full bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting 
                ? "Submitting..." 
                : currentIndex === totalQuestions - 1
                ? "Submit & Finish Interview"
                : "Submit & Next Question"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-center text-red-500 mt-6">{error}</p>
        )}
      </div>
    </>
  );
}
