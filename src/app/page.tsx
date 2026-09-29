"use client";

import React, { useState } from "react";
import { Play, Pause, Bookmark, Volume2, BookOpen, ChevronRight, Loader2, Library, AlertCircle } from "lucide-react";

interface VocabularyItem {
  word: string;
  translation: string;
}

interface ChapterData {
  title: string;
  genre: string;
  chapterNumber: number;
  content: string;
  cliffhanger?: string;
  summaryForNext?: string;
  vocabulary?: VocabularyItem[];
}

const GENRES = [
  { id: "Mystery", label: "תעלומה ומסתורין", icon: "🔍" },
  { id: "Psychological Thriller", label: "מתח פסיכולוגי", icon: "🧠" },
  { id: "Adventure & Travel", label: "הרפתקאות ומסעות", icon: "🧭" },
  { id: "Modern Drama", label: "דרמה עכשווית", icon: "☕" },
];

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState("Mystery");
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);

  const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-zA-Z]/g, "");

  const fetchChapter = async (genreToFetch: string, chapterNum: number, prevSummary: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSelectedWord(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: genreToFetch,
          chapterNumber: chapterNum,
          previousSummary: prevSummary,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch chapter from AI");
      }

      const data: ChapterData = await res.json();
      
      // הגנה לוודא שמערך האוצר מילים קיים תמיד
      data.vocabulary = Array.isArray(data.vocabulary) ? data.vocabulary : [];
      setChapter(data);
    } catch (err: any) {
      console.error("Error generating chapter:", err);
      setErrorMessage("אירעה שגיאה ביצירת הסיפור. ודאי שמפתח ה-API תקין ומוגדר.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBook = (genreId: string) => {
    setSelectedGenre(genreId);
    fetchChapter(genreId, 1, "");
  };

  const handleNextChapter = () => {
    if (!chapter) return;
    fetchChapter(chapter.genre, chapter.chapterNumber + 1, chapter.summaryForNext || "");
  };

  const handleTogglePlay = () => {
    if (!chapter || !("speechSynthesis" in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chapter.content);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const speakWord = (word: string) => {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // בדיקת תרגום מוגנת לחלוטין משגיאות undefined
  const currentTranslation = (chapter?.vocabulary || []).find(
    (item) => cleanWord(item.word) === selectedWord
  )?.translation;

  return (
    <main className="min-h-screen bg-[#07090E] text-slate-100 py-10 px-4 md:px-8 selection:bg-indigo-500/30">
      <div className="w-full max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between bg-slate-900/50 backdrop-blur-md border border-slate-800/80 px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">LinguaPulse</h1>
              <span className="text-xs text-slate-400">ספריית סיפורים בהמשכים</span>
            </div>
          </div>

          <div className="text-xs bg-slate-800/80 border border-slate-700/60 px-3.5 py-1.5 rounded-full text-slate-300 font-medium">
            מילים שנשמרו: <strong className="text-indigo-400">{savedWords.length}</strong>
          </div>
        </header>

        {/* בחירת ז'אנר */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-400 block mb-3 text-right" dir="rtl">
            בחרי ז'אנר כדי להתחיל ספר חדש:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => handleStartBook(g.id)}
                disabled={isLoading}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-medium transition active:scale-95 ${
                  selectedGenre === g.id && chapter
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                    : "bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="text-xl mb-1">{g.icon}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* הודעת שגיאה במקרה של בעיה */}
        {errorMessage && (
          <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* מצב טעינה */}
        {isLoading && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <h3 className="text-lg font-semibold text-white">ה-AI כותב את הפרק עבורך...</h3>
            <p className="text-xs text-slate-400">יוצר עלילה, מתאים שפה ומחלץ מילים לתרגול</p>
          </div>
        )}

        {/* תוכן הפרק */}
        {!isLoading && chapter && (
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/90 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-950/70 text-indigo-300 border border-indigo-800/50 px-3 py-0.5 rounded-full inline-block mb-2">
                  {chapter.genre} · פרק {chapter.chapterNumber}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{chapter.title}</h2>
              </div>

              <button
                onClick={handleTogglePlay}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? "השהה" : "האזן לפרק"}</span>
              </button>
            </div>

            <div className="text-lg md:text-xl leading-[2.1] text-slate-300 flex flex-wrap gap-x-2 gap-y-1">
              {chapter.content.split(" ").map((word, idx) => {
                const cleaned = cleanWord(word);
                const isSelected = selectedWord === cleaned;
                const isVocabulary = (chapter.vocabulary || []).some((v) => cleanWord(v.word) === cleaned);

                return (
                  <span
                    key={idx}
                    onClick={() => cleaned && setSelectedWord(cleaned)}
                    className={`cursor-pointer rounded-md px-1 py-0.5 transition-all select-none ${
                      isSelected
                        ? "bg-indigo-600 text-white font-semibold"
                        : isVocabulary
                        ? "border-b border-amber-400 text-slate-100 hover:bg-slate-800/80"
                        : "hover:bg-slate-800/60"
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>

            {chapter.cliffhanger && (
              <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-4 text-amber-200/90 text-sm">
                <strong>סיום מותח:</strong> {chapter.cliffhanger}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextChapter}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95"
              >
                <span>המשך לפרק {chapter.chapterNumber + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* חלונית תרגום */}
        {selectedWord && (
          <div className="bg-slate-900/95 border border-indigo-500/30 backdrop-blur-xl rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-white capitalize">{selectedWord}</h3>
                <button
                  onClick={() => speakWord(selectedWord)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 transition"
                  title="השמע מילה"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => {
                  if (!savedWords.includes(selectedWord)) {
                    setSavedWords((prev) => [...prev, selectedWord]);
                  }
                }}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                {savedWords.includes(selectedWord) ? "נשמר ברשימה" : "שמור מילה"}
              </button>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-right" dir="rtl">
              <span className="text-xs text-slate-400 block mb-0.5">תרגום לעברית:</span>
              <span className="text-lg font-bold text-indigo-300">
                {currentTranslation || "מילה ללא תרגום מוגדר מראש"}
              </span>
            </div>
          </div>
        )}

        {/* מסך פתיחה */}
        {!chapter && !isLoading && !errorMessage && (
          <div className="text-center py-12 text-slate-400 bg-slate-900/20 border border-slate-800/40 rounded-3xl">
            <Library className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-base font-medium text-slate-300">בחרי אחד מהז'אנרים למעלה כדי להתחיל לקרוא את הפרק הראשון</p>
          </div>
        )}

      </div>
    </main>
  );
}