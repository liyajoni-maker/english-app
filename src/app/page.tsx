"use client";

import React, { useState } from "react";
import { Play, Pause, RotateCcw, Bookmark, Volume2, Sparkles } from "lucide-react";

// מילון בסיסי מובנה לדוגמה עבור הסיפור (בהמשך נחבר אותו ל-API תרגום אוטומטי מלא)
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
  world: "עולם",
  curiosity: "סקרנות",
  courage: "אומץ",
  practice: "תרגול",
  confidence: "ביטחון עצמי",
  fluency: "שטף דיבור",
  discover: "לגלות",
  progress: "התקדמות",
  every: "כל",
  day: "יום",
  mistakes: "טעויות",
  opportunities: "הזדמנויות",
  grow: "לצמוח, לגדול"
};

const SAMPLE_STORY = {
  title: "The Power of Small Steps",
  level: "Intermediate (B1)",
  text: "The journey of a thousand miles begins with a single step. Learning a new language opens doors to a whole new world. With daily practice, curiosity, and courage, your confidence will grow. Do not fear mistakes; they are just opportunities to discover your true fluency."
};

export default function Home() {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);

  // ניקוי מילה מסימני פיסוק (פסיקים, נקודות וכו')
  const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-zA-Z]/g, "");

  // הקראת הטקסט באמצעות מנוע השמע המובנה בדפדפן (0 עלות)
  const handleTogglePlay = () => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(SAMPLE_STORY.text);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // מהירות מעט מתונה ללמידה
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // השמעת מילה בודדת
  const speakWord = (word: string) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleWordClick = (rawWord: string) => {
    const cleaned = cleanWord(rawWord);
    if (!cleaned) return;
    setSelectedWord(cleaned);
  };

  const handleSaveWord = (word: string) => {
    if (!savedWords.includes(word)) {
      setSavedWords((prev) => [...prev, word]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 md:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Header עליון */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              E
            </div>
            <span className="font-semibold text-lg tracking-tight">LinguaPulse</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-slate-300 font-medium">
              מילים שנשמרו: <strong className="text-indigo-400">{savedWords.length}</strong>
            </span>
          </div>
        </header>

        {/* כרטיסיית הסיפור */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-md">
                {SAMPLE_STORY.level}
              </span>
              <h1 className="text-2xl font-bold mt-2 text-white">{SAMPLE_STORY.title}</h1>
            </div>

            {/* כפתור נגן שמע */}
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? "השהה שמע" : "האזן לסיפור"}</span>
            </button>
          </div>

          {/* תוכן הסיפור עם מילים לחיצות */}
          <div className="text-lg md:text-xl leading-relaxed text-slate-300 flex flex-wrap gap-x-1.5 gap-y-1">
            {SAMPLE_STORY.text.split(" ").map((word, idx) => {
              const cleaned = cleanWord(word);
              const isSelected = selectedWord === cleaned;
              const isSaved = savedWords.includes(cleaned);

              return (
                <span
                  key={idx}
                  onClick={() => handleWordClick(word)}
                  className={`cursor-pointer rounded px-1 transition-colors duration-150 ${
                    isSelected
                      ? "bg-indigo-600 text-white font-semibold"
                      : isSaved
                      ? "underline decoration-indigo-400 decoration-2 underline-offset-4 text-white"
                      : "hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* חלונית תרגום אינטראקטיבית למילה שנבחרה */}
        {selectedWord && (
          <div className="bg-slate-900/90 border border-indigo-500/30 backdrop-blur rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white capitalize">{selectedWord}</h3>
                <button
                  onClick={() => speakWord(selectedWord)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="השמע מילה"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleSaveWord(selectedWord)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                  savedWords.includes(selectedWord)
                    ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-400"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {savedWords.includes(selectedWord) ? "שמור ברשימה" : "שמור לתרגול"}
              </button>
            </div>

            <div className="mt-3 text-right" dir="rtl">
              <div className="text-sm text-slate-400">תרגום:</div>
              <div className="text-lg font-semibold text-indigo-300">
                {DICTIONARY[selectedWord] || "לחץ על תרגום מלא (בחיבור ה-API הבא)"}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}