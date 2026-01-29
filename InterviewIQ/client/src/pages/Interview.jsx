import { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/themeContext";

export default function Interview() {
  /* ================= ROUTER ================= */
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!state) {
      navigate("/dashboard", { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const { domain, tech, difficulty, totalQuestions } = state;

  /* ================= REFS ================= */
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const speechRef = useRef(null);
  const submittingRef = useRef(false); // Track submitting state to avoid stale closures

  /* ================= STATE ================= */
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [replaying, setReplaying] = useState(false);

  // Tab switch detection
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  const { isDarkMode } = useTheme();

  /* ================= LOAD QUESTIONS ================= */
  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.post("/interview/start-session", {
          domain,
          tech,
          difficulty,
          totalQuestions,
        });

        setSessionId(res.data.sessionId);
        setQuestions(res.data.questions);
      } catch {
        setError("Failed to start interview.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [domain, tech, difficulty, totalQuestions]);

  /* ================= TAB SWITCH DETECTION ================= */
  useEffect(() => {
    if (!interviewStarted || submitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from tab
        setTabSwitchCount(prev => {
          const newCount = prev + 1;

          if (newCount === 1) {
            // First warning
            setShowTabWarning(true);
            setTimeout(() => setShowTabWarning(false), 5000);
          } else if (newCount >= 2) {
            // Second violation - auto submit interview
            setError("Interview terminated due to tab switching!");
            setTimeout(() => {
              // Force submit all remaining questions
              forceEndInterview();
            }, 2000);
          }

          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [interviewStarted, submitting]);

  /* ================= FORCE END INTERVIEW ================= */
  const forceEndInterview = async () => {
    try {
      submittingRef.current = true;
      setSubmitting(true);
      stopSpeech();

      // Submit current answer if any
      const answer = transcript.trim() || "No answer provided.";
      await api.post("/responses", {
        sessionId,
        question: questions[currentIndex],
        transcript: answer,
        domain,
        tech,
        difficulty,
      });

      // Submit empty answers for remaining questions
      for (let i = currentIndex + 1; i < totalQuestions; i++) {
        await api.post("/responses", {
          sessionId,
          question: questions[i],
          transcript: "Interview terminated - No answer provided.",
          domain,
          tech,
          difficulty,
        });
      }

      // Generate summary
      await api.post("/interview/summary", { sessionId });
      navigate("/interview-processing");
    } catch (err) {
      console.error("Force end error:", err);
      navigate("/dashboard");
    }
  };

  /* ================= CAMERA ================= */
  useEffect(() => {
    if (!interviewStarted) return;

    let active = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: false,
        });

        if (!active) return;

        streamRef.current = stream;

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.playsInline = true;
          await video.play();
        }
      } catch {
        setError("Camera access denied.");
      }
    };

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [interviewStarted]);

  /* ================= SPEECH (100% WORKING RESTART) ================= */
  const startSpeech = useCallback(() => {
    if (submittingRef.current) return; // Use ref instead of state

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    // Stop existing if any
    if (speechRef.current) {
      try {
        speechRef.current.stop();
      } catch (e) { }
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setRecording(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += text + " ";
        } else {
          interimText += text;
        }
      }

      if (finalText) {
        setTranscript(prev => (prev + " " + finalText).trim());
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.error("Speech Recognition Error:", event.error);
        setRecording(false);
      }
    };

    recognition.onend = () => {
      // CRITICAL FIX: Use ref to avoid stale closure bug
      // This prevents auto-restart when transitioning between questions
      if (!submittingRef.current) {
        try {
          recognition.start();
        } catch (e) {
          setRecording(false);
        }
      } else {
        setRecording(false);
      }
    };

    speechRef.current = recognition;
    try {
      recognition.start();
    } catch (e) { }
  }, []); // Remove submitting from dependencies since we use ref

  const stopSpeech = () => {
    if (speechRef.current) {
      speechRef.current.onend = null; // Prevent restart
      speechRef.current.stop();
      speechRef.current = null;
    }
    setRecording(false);
  };

  /* ================= REPLAY ================= */
  const replayAnswer = useCallback(() => {
    if (!transcript.trim() || replaying) return;

    setReplaying(true);
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.onend = () => setReplaying(false);
    utterance.onerror = () => setReplaying(false);
    speechSynthesis.speak(utterance);
  }, [transcript, replaying]);

  /* ================= SUBMIT ================= */
  const submitAndNext = async () => {
    if (submitting) return;

    setSubmitting(true);
    submittingRef.current = true; // Update ref immediately
    stopSpeech(); // Properly kill recognition
    setSubmitMessage("Evaluating...");

    try {
      const answer = transcript.trim() || "No answer provided.";

      await api.post("/responses", {
        sessionId,
        question: questions[currentIndex],
        transcript: answer,
        domain,
        tech,
        difficulty,
      });

      setTranscript("");
      setInterimTranscript("");

      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(i => i + 1);
        setSubmitMessage("");
        // Give browser a break before restarting recognition
        // IMPORTANT: Clear submitting AFTER speech starts to prevent race condition
        setTimeout(() => {
          submittingRef.current = false; // Clear ref first
          startSpeech();
          setSubmitting(false);
        }, 800);
      } else {
        setSubmitMessage("Generating Results...");
        await api.post("/interview/summary", { sessionId });
        navigate("/interview-processing");
      }
    } catch (err) {
      console.error(err);
      setError("Submission failed.");
      setSubmitting(false);
      setSubmitMessage("");
    }
  };

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      stopSpeech();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Preparing your interview…</h2>
            <p className="opacity-70 animate-pulse">This might take up to a minute.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDarkMode ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"}`}>
      <Navbar />

      {/* OVERLAY */}
      {!interviewStarted && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[1000] p-6">
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'} max-w-2xl w-full rounded-3xl p-10 shadow-2xl border text-center`}>
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ready to start?</h2>
            <div className={`space-y-4 mb-8 text-left ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <div className="flex gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <p>Ensure you are in a quiet environment.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <p>Camera is active for technical monitoring.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <p>Answer at your own pace; no strict time limit.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setInterviewStarted(true);
                setTimeout(() => startSpeech(), 800);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-xl transition-all shadow-lg active:scale-95"
            >
              Start Interview Now
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 lg:p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">

          {/* LEFT: CAMERA & TRANSCRIPTION */}
          <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden h-full">
            <div className="flex-1 bg-black rounded-3xl overflow-hidden relative shadow-2xl border border-white/5 min-h-0">
              <video
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                autoPlay
                muted
                playsInline
              />

              {recording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  RECORDING
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl max-h-32 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
                    <p className="text-white/60 text-[8px] uppercase font-bold tracking-widest">Live transcription</p>
                  </div>
                  <div className="text-white text-sm lg:text-base font-medium leading-relaxed">
                    <span>{transcript}</span>
                    <span className="text-white/40 italic"> {interimTranscript}</span>
                    {!transcript && !interimTranscript && (
                      <span className="text-white/30 italic font-normal">Listening carefully...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: QUESTION & CONTROLS */}
          <div className="lg:col-span-2 flex flex-col overflow-hidden h-full">
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-3xl p-6 lg:p-8 flex flex-col shadow-xl h-full overflow-hidden`}>
              <div className="flex justify-between items-center mb-6 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-700 ease-out"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
                <h3 className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Current Question</h3>
                <h2 className={`text-xl lg:text-2xl font-bold leading-tight mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {questions[currentIndex] || "Loading..."}
                </h2>

                <div className={`p-4 rounded-2xl border-2 border-dashed ${recording ? 'border-green-500/30 bg-green-500/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'} flex flex-col items-center justify-center text-center space-y-2 transition-colors`}>
                  <div className={`p-3 rounded-full ${recording ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <p className={`text-xs font-bold ${recording ? 'text-green-500' : 'text-slate-500'}`}>
                    {recording ? "Recording Active" : "Microphone Ready"}
                  </p>
                </div>
              </div>

              <div className="mt-auto space-y-3 shrink-0">
                <button
                  onClick={replayAnswer}
                  disabled={!transcript.trim() || replaying || submitting}
                  className={`w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} disabled:opacity-40 active:scale-95`}
                >
                  {replaying ? "Playing..." : "Preview Answer"}
                </button>

                <button
                  onClick={submitAndNext}
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-green-700 transition-all shadow-lg disabled:bg-slate-400 active:scale-95"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {submitMessage}
                    </span>
                  ) : (
                    currentIndex === totalQuestions - 1 ? "Complete Interview" : "Submit & Next"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TAB SWITCH WARNING */}
      {showTabWarning && (
        <div className="fixed inset-0 bg-red-600/20 backdrop-blur-sm flex items-center justify-center z-[3000] animate-pulse">
          <div className="bg-red-600 text-white px-12 py-8 rounded-3xl font-bold shadow-2xl text-center max-w-md animate-bounce">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-black mb-3">WARNING!</h2>
            <p className="text-xl mb-2">Tab switching is not allowed!</p>
            <p className="text-sm opacity-90">One more violation will end your interview.</p>
            <div className="mt-4 text-xs opacity-75">
              Violations: {tabSwitchCount}/2
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl z-[2000] animate-bounce">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
