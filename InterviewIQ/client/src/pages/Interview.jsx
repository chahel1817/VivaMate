import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
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
          const res = await api.post("/ai/question", {
            domain,
            tech,
            difficulty,
          });

          const q = res.data?.question?.trim();
          if (q && !unique.has(q)) {
            unique.add(q);
            list.push(q);
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

  /* ================= ANSWER CONTROLS ================= */
  const startAnswer = () => {
    setRecording(true);
    startSpeech();
  };

  const stopAnswer = () => {
    setRecording(false);
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

    try {
      const question = questions[currentIndex];

      const evalRes = await api.post("/ai/evaluate", {
        question,
        answer: transcript,
      });

      await api.post("/responses", {
        sessionId,
        question,
        transcript,
        feedback: evalRes.data.feedback,
        scores: evalRes.data.scores,
        domain,
        tech,
        difficulty,
      });

      setTranscript("");

      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        await api.post("/interview/summary", { sessionId });
        navigate("/interview-summary");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit answer");
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
                onClick={submitAndNext}
                className="flex-1 bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-900"
              >
                {currentIndex === totalQuestions - 1
                  ? "Finish Interview"
                  : "Next Question"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-center text-red-500 mt-6">{error}</p>
        )}
      </div>
    </>
  );
}
