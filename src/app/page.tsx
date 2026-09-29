"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Bookmark, Volume2, Sparkles, Check, BookOpen } from "lucide-react";

const DICTIONARY: Record<string, string> = {
  journey: "מסע",
  thousand: "אלף",
  miles: "מיילים / מרחקים",
  begins: "מתחיל",
  single: "בודד, יחיד",
  step: "צעד",
  learning: "למידה",
  language: "שפה",
  opens: "פותח",
  doors: "דלתות",
  whole: "שלם, כולו",
  new: "חדש",
  world: "עולם",
  daily: "יומיומי",
  practice: "תרגול",
  curiosity: "סקרנות",
  courage: "אומץ",
  confidence: "ביטחון עצמי",
  grow: "לצמוח, לגדול",
  fear: "לפחד / פחד",
  mistakes: "טעויות",
  opportunities: "הזדמנויות",
  discover: "לגלות",
  true: "אמיתי",
  fluency: "שטף דיבור"
};

const SAMPLE_STORY = {
  title: "The Power of Small Steps",
  level: "Intermediate · B1",
  text: "The journey of a thousand miles begins with a single step. Learning a new language opens doors to a whole new world. With daily practice, curiosity, and courage, your confidence will grow. Do not fear mistakes; they are just opportunities to discover your true fluency."
};

export default function Home() {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(0.85);
  const [savedWords, setSavedWords] = useState<string[]>([]);

  const words = SAMPLE_STORY.text.split(" ");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-zA-Z]/g, "");

  // עצירת השמע בעת מעבר דף
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (!("speechSynthesis" in window)) {
      alert("הדפדפן שלך אינו תומך בהקראה קולית");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentWordIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(SAMPLE_STORY.text);
    utterance.lang = "en-US";
    utterance.rate = playbackRate;

    // זיהוי המילה המוקראת בזמן אמת
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const charIndex = event.charIndex;
        // חישוב אינדקס המילה לפי מיקום התו בטקסט
        const textUpToChar = SAMPLE_STORY.text.substring(0, charIndex);
        const wordIdx = textUpToChar.trim().split(/\s+/).length - 1;
        setCurrentWordIndex(Math.max(0, wordIdx));
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentWordIndex(null);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleResetAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentWordIndex(null);
  };

  const speakWord = (word: string) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleWordClick = (rawWord: string) => {
    const cleaned = cleanWord(rawWord);
    if (!cleaned) return;
    setSelectedWord(cleaned);
  };

  const handleSaveWord = (word: string) => {
    if (savedWords.includes(word)) {
      setSavedWords((prev) => prev.filter((w) => w !== word));
    } else {
      setSavedWords((prev) => [...prev, word]);
    }
  };

  return (
    <main className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col items-center py-10 px-4 md:px-8 selection:bg-indigo-500/30">
      <div className="w-full max-w-2xl space-y-6">

        {/* Header אלגנטי */}
        <header className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-none text-white">LinguaPulse</h1>
              <span className="text-xs text-slate-400">אימון אנגלית אינטראקטיבי</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full text-slate-300 font-medium">
              מילים שנשמרו: <strong className="text-indigo-400 font-semibold">{savedWords.length}</strong>
            </span>
          </div>
        </header>

        {/* כרטיסיית הסיפור המרכזית */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-2xl relative">
          
          {/* כותרת הסיפור ופקדי שמע */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
            <div>
              <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-indigo-300 bg-indigo-950/70 border border-indigo-800/50 px-3 py-1 rounded-full mb-2">
                {SAMPLE_STORY.level}
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">{SAMPLE_STORY.title}</h2>
            </div>

            {/* כפתורי שליטה */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlaybackRate((prev) => (prev === 0.85 ? 1 : 0.85))}
                className="text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 hover:bg-slate-700 text-slate-300 transition"
                title="מהירות הקראה"
              >
                {playbackRate}x
              </button>

              {isPlaying && (
                <button
                  onClick={handleResetAudio}
                  className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 hover:bg-slate-700 text-slate-300 transition"
                  title="אפס שמע"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? "השהה" : "האזן לסיפור"}</span>
              </button>
            </div>
          </div>

          {/* תוכן הסיפור - עם סימון מילה מוקראת ומילים לחיצות */}
          <div className="pt-6 text-xl md:text-2xl leading-[2.2] tracking-wide text-slate-300 flex flex-wrap gap-x-2 gap-y-1">
            {words.map((word, idx) => {
              const cleaned = cleanWord(word);
              const isSpoken = currentWordIndex === idx && isPlaying;
              const isSelected = selectedWord === cleaned;
              const isSaved = savedWords.includes(cleaned);

              return (
                <span
                  key={idx}
                  onClick={() => handleWordClick(word)}
                  className={`cursor-pointer rounded-lg px-1.5 py-0.5 transition-all duration-150 select-none ${
                    isSpoken
                      ? "bg-amber-400 text-slate-950 font-bold scale-105 shadow-md shadow-amber-400/20"
                      : isSelected
                      ? "bg-indigo-600 text-white font-semibold"
                      : isSaved
                      ? "text-indigo-300 border-b-2 border-indigo-400 font-medium"
                      : "hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <span>טיפ: לחצי על כל מילה כדי לראות תרגום ולשמור אותה</span>
            {isPlaying && (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                מקריא כעת...
              </span>
            )}
          </div>
        </div>

        {/* חלונית תרגום תחתונה מעוצבת */}
        {selectedWord && (
          <div className="bg-slate-900/90 border border-indigo-500/30 backdrop-blur-xl rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white capitalize">{selectedWord}</h3>
                <button
                  onClick={() => speakWord(selectedWord)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 transition"
                  title="השמע מילה זו"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => handleSaveWord(selectedWord)}
                className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition ${
                  savedWords.includes(selectedWord)
                    ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-400"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                }`}
              >
                {savedWords.includes(selectedWord) ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>נשמר ברשימה</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>שמור מילה לתרגול</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-3.5 border border-slate-800/80 text-right" dir="rtl">
              <span className="text-xs text-slate-400 block mb-0.5">תרגום לעברית:</span>
              <span className="text-lg font-bold text-indigo-300">
                {DICTIONARY[selectedWord] || "לחץ לתרגום מלא"}
              </span>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}