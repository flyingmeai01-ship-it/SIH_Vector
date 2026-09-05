import { GoogleGenAI } from '@google/genai';

// Initialize the SDK. It automatically picks up GEMINI_API_KEY from environment variables.
const ai = new GoogleGenAI();

export async function POST(request) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return new Response(JSON.stringify({ error: "Transcript is required" }), { status: 400 });
    }

    const prompt = `You are a warm, empathetic assistant helping an elderly person with dementia document their day.
They just spoke the following text. Turn it into a short, positive, 3-bullet-point memory diary entry.
Keep it extremely simple, encouraging, and written in the second person (e.g., "You enjoyed a cup of tea today!").

Text from the patient:
"${transcript}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return new Response(JSON.stringify({ diary: response.text }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error("Gemini Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate diary entry" }), { status: 500 });
  }
}
