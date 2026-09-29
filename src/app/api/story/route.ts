import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { genre = "Mystery", chapterNumber = 1, previousSummary = "" } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined");
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const prompt = `You are a bestselling fiction author writing an engaging, serialized novel for English learners at B1-B2 level.
Genre: ${genre}
Chapter Number: ${chapterNumber}
${previousSummary ? `Previous chapter summary: "${previousSummary}"` : "This is Chapter 1. Start an intriguing mystery or adventure."}

Requirements:
1. Write Chapter ${chapterNumber} of the story (around 250 to 350 words). Make it exciting with natural dialogue and rich vocabulary.
2. The chapter MUST end with a compelling cliffhanger.
3. Extract 6-10 useful vocabulary words from the story and provide accurate Hebrew translations.

Return ONLY a valid JSON object matching this schema without any markdown formatting or backticks:
{
  "title": "Story or Chapter Title",
  "genre": "${genre}",
  "chapterNumber": ${chapterNumber},
  "content": "The full story chapter text here...",
  "cliffhanger": "A brief sentence describing what happens at the end",
  "summaryForNext": "A 2-sentence summary of this chapter to maintain plot continuity",
  "vocabulary": [
    { "word": "example", "translation": "דוגמה" }
  ]
}`;

    // שימוש במודל העדכני של גוגל: gemini-3.8-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json({ error: errText }, { status: response.status });
    }

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    const cleanedText = candidateText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const data = JSON.parse(cleanedText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Story generation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate story chapter" },
      { status: 500 }
    );
  }
}