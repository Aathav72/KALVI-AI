import groq from '@/lib/groq';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { transcript, grade, subject, language } = await request.json();

    const prompt = `
You are an expert teacher's assistant. A teacher of grade ${grade} teaching ${subject} in ${language} just asked this question/topic:
"${transcript}"

Provide the following, **in a single JSON object** (no markdown, no extra text):
1. **A detailed, curriculum‑appropriate explanation** (minimum 300 words) that includes key concepts and a clear narrative.
2. **Two worked example problems** with step‑by‑step solutions.
3. **Three practical teaching tips** for presenting this topic.
4. **Five multiple‑choice questions** (each with four options and the correct answer index).
5. **A concise summary** (one‑sentence) that can be used as a slide title.

Structure the JSON as:
{
  "explanation": "...",
  "examples": [{ "question": "...", "solution": "..." }, { "question": "...", "solution": "..." }],
  "tips": ["...", "...", "..."],
  "quiz": [
    { "question": "...", "options": ["A","B","C","D"], "answerIndex": 0 },
    { "question": "...", "options": ["A","B","C","D"], "answerIndex": 0 },
    { "question": "...", "options": ["A","B","C","D"], "answerIndex": 0 },
    { "question": "...", "options": ["A","B","C","D"], "answerIndex": 0 },
    { "question": "...", "options": ["A","B","C","D"], "answerIndex": 0 }
  ],
  "summary": "..."
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: "json_object" },
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;

    console.log("========== LLM RAW RESPONSE ==========");
    console.log(responseContent);

    const result = JSON.parse(responseContent);

    console.log("========== PARSED RESULT ==========");
    console.log(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Generation error:", error);
    return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
  }
}
