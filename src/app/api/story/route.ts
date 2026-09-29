import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { genre = "Mystery", chapterNumber = 1, previousSummary = "" } = await req.json();

    const prompt = `You are a bestselling fiction author writing an engaging, serialized novel for English learners at B1-B2 level.
Genre: ${genre}
Chapter Number: ${chapterNumber}
${previousSummary ? `Previous chapter summary: "${previousSummary}"` : "This is Chapter 1. Start an intriguing mystery or adventure."}

Requirements:
1. Write Chapter ${chapterNumber} of the story. Make the plot exciting, dialogue realistic, and keep the user hooked.
2. The chapter should be substantial and immersive (around 300 to 450 words for reading practice).
3. The chapter MUST end with a compelling cliffhanger that makes the reader eager to read the next chapter.
4. Extract 6-10 useful/challenging vocabulary words used in the story and provide accurate Hebrew translations.

Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Story or Chapter Title",
  "genre": "${genre}",
  "chapterNumber": ${chapterNumber},
  "content": "The full story chapter text here...",
  "cliffhanger": "A brief sentence describing what happens at the end",
  "summaryForNext": "A 2-sentence summary of this chapter to maintain plot continuity in the next chapter",
  "vocabulary": [
    { "word": "example", "translation": "דוגמה" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate story chapter" },
      { status: 500 }
    );
  }
}