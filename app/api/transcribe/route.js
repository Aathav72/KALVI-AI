import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        console.log("=== Transcribe API Called ===");

        const formData = await request.formData();

        const audio = formData.get("audio");
        const language = formData.get("language") || "en";

        console.log("Language:", language);

        if (!audio) {
            console.log("No audio received");
            return NextResponse.json(
                { error: "No audio file received." },
                { status: 400 }
            );
        }

        console.log("Audio Name:", audio.name);
        console.log("Audio Type:", audio.type);
        console.log("Audio Size:", audio.size);

        const groqForm = new FormData();
        groqForm.append("file", audio);
        groqForm.append("model", "whisper-large-v3-turbo");
        groqForm.append("language", language);
        groqForm.append("response_format", "json");

        console.log("Sending request to Groq...");

        const response = await fetch(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
                body: groqForm,
            }
        );

        const data = await response.json();

        console.log("Status:", response.status);
        console.log("Groq Response:", JSON.stringify(data, null, 2));

        if (!response.ok) {
            return NextResponse.json(
                { error: data.error?.message || "Transcription failed" },
                { status: response.status }
            );
        }

        return NextResponse.json({
            transcript: data.text,
        });

    } catch (error) {
        console.error("Route Error:", error);

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}